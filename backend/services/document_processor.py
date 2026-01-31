"""
Document processing service for parsing, chunking, and classifying compliance documents.
"""
import logging
from typing import List, Dict, Optional, Tuple
import io
from datetime import datetime
from services.openai_service import openai_service

logger = logging.getLogger(__name__)

# Chunking configuration
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}


def parse_document(content: bytes, filename: str) -> str:
    """
    Parse document content to plain text
    
    Args:
        content: File content as bytes
        filename: Original filename
        
    Returns:
        Extracted text content
    """
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    
    try:
        if ext == "pdf":
            return _parse_pdf(content)
        elif ext in ("doc", "docx"):
            return _parse_docx(content)
        elif ext == "txt":
            return _parse_txt(content)
        else:
            raise ValueError(f"Unsupported file type: {filename}")
    except Exception as e:
        logger.error(f"Error parsing document {filename}: {e}")
        raise


def _parse_pdf(content: bytes) -> str:
    """Parse PDF file"""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
        return "\n".join(parts)
    except ImportError:
        logger.error("pypdf not installed. Install with: pip install pypdf")
        raise
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise


def _parse_docx(content: bytes) -> str:
    """Parse DOCX file"""
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text and p.text.strip())
    except ImportError:
        logger.error("python-docx not installed. Install with: pip install python-docx")
        raise
    except Exception as e:
        logger.error(f"Error parsing DOCX: {e}")
        raise


def _parse_txt(content: bytes) -> str:
    """Parse TXT file"""
    try:
        return content.decode("utf-8", errors="replace")
    except Exception as e:
        logger.error(f"Error parsing TXT: {e}")
        raise


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping chunks
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk
        overlap: Overlap between chunks
        
    Returns:
        List of text chunks
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        return []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary if possible
        if end < len(text):
            # Look for sentence endings in the last 50 chars
            last_period = chunk.rfind(".")
            last_newline = chunk.rfind("\n")
            break_point = max(last_period, last_newline)
            
            if break_point > start + chunk_size * 0.7:  # Only break if not too early
                chunk = text[start:start + break_point + 1]
                start = start + break_point + 1 - overlap
            else:
                start = end - overlap
        else:
            start = end
        
        if chunk.strip():
            chunks.append(chunk.strip())
    
    return chunks


async def classify_document(text: str) -> str:
    """
    Classify document as HR, IT, or BOTH using OpenAI
    
    Args:
        text: Document text (first 2000 chars for classification)
        
    Returns:
        "HR", "IT", or "BOTH"
    """
    # Use first 2000 characters for classification
    sample_text = text[:2000] if len(text) > 2000 else text
    
    try:
        if not openai_service.client:
            # Fallback to keyword-based classification
            return _classify_by_keywords(sample_text)
        
        prompt = f"""
        Classify this compliance document into one of these categories:
        - HR: Human resources, leave policies, benefits, attendance, performance, remote work, expenses
        - IT: Information technology, security, passwords, software, AI tools, network, devices, data
        - BOTH: Documents covering both HR and IT topics
        
        Document sample:
        {sample_text}
        
        Respond with only one word: HR, IT, or BOTH
        """
        
        response = openai_service.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a document classifier. Respond with only one word: HR, IT, or BOTH."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=10
        )
        
        result = response.choices[0].message.content.strip().upper()
        if result in ["HR", "IT", "BOTH"]:
            return result
        return "BOTH"  # Default
    except Exception as e:
        logger.warning(f"Error classifying document with OpenAI, using keyword fallback: {e}")
        return _classify_by_keywords(sample_text)


def _classify_by_keywords(text: str) -> str:
    """Fallback keyword-based classification"""
    text_lower = text.lower()
    
    hr_keywords = [
        "leave", "vacation", "pto", "sick leave", "attendance", "time off",
        "benefits", "health insurance", "retirement", "expense", "reimbursement",
        "travel", "remote work", "work from home", "performance", "appraisal",
        "goal", "career", "promotion", "resignation", "termination", "hr", "human resources"
    ]
    
    it_keywords = [
        "password", "login", "authentication", "security", "data", "privacy",
        "software", "ai tools", "chatgpt", "cursor", "network", "vpn", "device",
        "laptop", "computer", "technical issue", "system access", "email",
        "backup", "intellectual property", "ip", "it", "information technology"
    ]
    
    hr_count = sum(1 for keyword in hr_keywords if keyword in text_lower)
    it_count = sum(1 for keyword in it_keywords if keyword in text_lower)
    
    if hr_count > 0 and it_count > 0:
        return "BOTH"
    elif hr_count > it_count:
        return "HR"
    elif it_count > hr_count:
        return "IT"
    else:
        return "BOTH"  # Default if unclear


async def process_document(
    content: bytes,
    filename: str,
    uploaded_by: int,
    document_id: Optional[int] = None
) -> Dict:
    """
    Full document processing pipeline
    
    Args:
        content: File content as bytes
        filename: Original filename
        uploaded_by: User ID who uploaded
        document_id: Optional document ID from database
        
    Returns:
        Dict with:
            - text: Full extracted text
            - chunks: List of text chunks
            - category: "HR", "IT", or "BOTH"
            - chunk_count: Number of chunks
            - metadata: List of metadata dicts for each chunk
    """
    # Parse document
    text = parse_document(content, filename)
    
    if not text or not text.strip():
        raise ValueError(f"Document {filename} is empty or could not be parsed")
    
    # Classify document
    category = await classify_document(text)
    
    # Chunk text
    chunks = chunk_text(text)
    
    if not chunks:
        raise ValueError(f"Document {filename} produced no chunks")
    
    # Create metadata for each chunk
    upload_date = datetime.utcnow().isoformat()
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        metadata = {
            "filename": filename,
            "category": category,
            "chunk_index": i,
            "total_chunks": len(chunks),
            "upload_date": upload_date,
            "uploaded_by": uploaded_by,
        }
        if document_id:
            metadata["document_id"] = document_id
        metadatas.append(metadata)
    
    return {
        "text": text,
        "chunks": chunks,
        "category": category,
        "chunk_count": len(chunks),
        "metadatas": metadatas
    }


def validate_file(filename: str, content: bytes, max_size: int = 10 * 1024 * 1024) -> Tuple[bool, Optional[str]]:
    """
    Validate uploaded file
    
    Args:
        filename: File name
        content: File content
        max_size: Maximum file size in bytes (default 10MB)
        
    Returns:
        (is_valid, error_message)
    """
    # Check file extension
    ext = "." + filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type {ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size
    if len(content) > max_size:
        return False, f"File size ({len(content)} bytes) exceeds maximum ({max_size} bytes)"
    
    if len(content) == 0:
        return False, "File is empty"
    
    return True, None
