"""
RAG service for Compliance Chatbot: parse PDF/DOC/TXT, chunk, embed, store in-memory per user.
"""
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory store: user_id (str) -> list of { "text", "embedding", "source" }
_store: Dict[str, List[Dict[str, Any]]] = {}

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
MAX_CHUNKS_PER_USER = 200
MAX_FILES_PER_UPLOAD = 10
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
TOP_K = 5

# Keywords for in-domain check (HR, IT, leave, compliance, company, policy, SOP)
DOMAIN_KEYWORDS = [
    "hr", "human resources", "policy", "policies", "leave", "attendance",
    "it", "compliance", "company", "sop", "procedure", "code of conduct",
    "remote", "expense", "reimbursement", "data security", "training",
    "holiday", "sick", "vacation", "pto", "benefits", "handbook",
]


def _parse_pdf(content: bytes) -> str:
    from pypdf import PdfReader
    import io
    reader = PdfReader(io.BytesIO(content))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def _parse_docx(content: bytes) -> str:
    from docx import Document
    import io
    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs if p.text and p.text.strip())


def _parse_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="replace")


def parse_document(content: bytes, filename: str) -> str:
    """Parse PDF, DOC/DOCX, or TXT to plain text."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        return _parse_pdf(content)
    if ext in ("doc", "docx"):
        return _parse_docx(content)
    if ext == "txt":
        return _parse_txt(content)
    raise ValueError(f"Unsupported file type: {filename}")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks."""
    text = text.replace("\r\n", "\n").strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks


def get_embedding_client() -> Optional[OpenAI]:
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def embed_texts(client: OpenAI, texts: List[str]) -> List[List[float]]:
    """Get embeddings for a list of texts. Batches of 100 to avoid rate limits."""
    if not texts:
        return []
    model = "text-embedding-3-small"
    all_embeddings = []
    for i in range(0, len(texts), 100):
        batch = texts[i : i + 100]
        resp = client.embeddings.create(input=batch, model=model)
        for e in resp.data:
            all_embeddings.append(e.embedding)
    return all_embeddings


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a_norm = a / (np.linalg.norm(a) + 1e-10)
    b_norm = b / (np.linalg.norm(b) + 1e-10)
    return float(np.dot(a_norm, b_norm))


def add_documents_for_user(user_id: str, chunks_with_source: List[Dict[str, Any]]) -> int:
    """Append chunks to user store. Returns number added (may cap at MAX_CHUNKS_PER_USER)."""
    uid = str(user_id)
    if uid not in _store:
        _store[uid] = []
    current = _store[uid]
    remaining = MAX_CHUNKS_PER_USER - len(current)
    if remaining <= 0:
        return 0
    to_add = chunks_with_source[:remaining]
    current.extend(to_add)
    return len(to_add)


def get_chunks_for_user(user_id: str) -> List[Dict[str, Any]]:
    return _store.get(str(user_id), [])


def clear_documents_for_user(user_id: str) -> None:
    _store[str(user_id)] = []


def get_documents_summary_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Return list of { filename, chunks } for user's uploaded docs."""
    chunks = get_chunks_for_user(user_id)
    by_source: Dict[str, int] = {}
    for c in chunks:
        src = c.get("source") or "unknown"
        by_source[src] = by_source.get(src, 0) + 1
    return [{"filename": name, "chunks": count} for name, count in by_source.items()]


def retrieve_top_k(user_id: str, query_embedding: List[float], k: int = TOP_K) -> List[Dict[str, Any]]:
    """Return top-k chunks by cosine similarity to query embedding."""
    chunks = get_chunks_for_user(user_id)
    if not chunks or not query_embedding:
        return []
    q = np.array(query_embedding, dtype=np.float32)
    scored = []
    for c in chunks:
        emb = c.get("embedding")
        if emb is None:
            continue
        sim = cosine_similarity(q, np.array(emb, dtype=np.float32))
        scored.append((sim, c))
    scored.sort(key=lambda x: -x[0])
    return [c for _, c in scored[:k]]


def is_in_domain(message: str) -> bool:
    """Lightweight check: question seems about HR/IT/compliance/company."""
    lower = message.lower().strip()
    if len(lower) < 3:
        return False
    return any(kw in lower for kw in DOMAIN_KEYWORDS)
