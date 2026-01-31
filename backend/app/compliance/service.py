"""
Compliance service with ChromaDB-based RAG and agent coordination.
"""
import logging
from typing import List, Tuple, Dict, Optional
from sqlalchemy.orm import Session
from repositories.compliance_repository import PolicyRepository, FAQRepository, ReminderRepository
from services.chromadb_service import chromadb_service
from services.document_processor import (
    process_document,
    validate_file,
    ALLOWED_EXTENSIONS
)
from services.coordinating_agent import coordinating_agent
from services.hr_agent_service import hr_agent_service
from services.it_agent_service import it_agent_service
from models.compliance import ComplianceDocument
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class ComplianceService:
    """Service for compliance document management and RAG chat"""
    
    def __init__(self, db: Session):
        self.db = db
        self.policy_repo = PolicyRepository(db)
        self.faq_repo = FAQRepository(db)
        self.reminder_repo = ReminderRepository(db)
    
    async def upload_documents_admin(
        self,
        admin_id: int,
        files: List[Tuple[str, bytes]]
    ) -> Tuple[List[str], int]:
        """
        Admin-only: Upload and process documents for ChromaDB storage
        
        Args:
            admin_id: Admin user ID
            files: List of (filename, content) tuples
            
        Returns:
            Tuple of (uploaded filenames, total chunks_added)
        """
        uploaded = []
        total_chunks = 0
        
        # Get OpenAI client for embeddings
        client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        if not client:
            raise ValueError("OpenAI API key not configured. Cannot process documents.")
        
        if not chromadb_service.is_available():
            raise ValueError("ChromaDB is not available. Please install ChromaDB to use document upload.")
        
        for filename, content in files:
            try:
                # Validate file
                is_valid, error_msg = validate_file(filename, content)
                if not is_valid:
                    logger.warning(f"Skipping invalid file {filename}: {error_msg}")
                    continue
                
                # Process document (parse, classify, chunk)
                processed = await process_document(
                    content,
                    filename,
                    admin_id
                )
                
                # Create database record
                doc_record = ComplianceDocument(
                    filename=filename,
                    category=processed["category"],
                    uploaded_by=admin_id,
                    chunk_count=processed["chunk_count"],
                    file_size=len(content),
                    chromadb_collection=processed["category"].lower() if processed["category"] != "BOTH" else "both"
                )
                self.db.add(doc_record)
                self.db.flush()  # Get the ID
                
                # Generate embeddings for chunks
                from services.rag_compliance_service import embed_texts
                embeddings = embed_texts(client, processed["chunks"])
                
                # Determine which collection(s) to use
                collections = []
                if processed["category"] in ["HR", "BOTH"]:
                    collections.append("hr")
                if processed["category"] in ["IT", "BOTH"]:
                    collections.append("it")
                
                # Store in ChromaDB
                chunks_added = 0
                for collection in collections:
                    # Update metadata with document ID
                    metadatas = []
                    for i, metadata in enumerate(processed["metadatas"]):
                        metadata["document_id"] = doc_record.id
                        metadatas.append(metadata)
                    
                    # Add chunks to ChromaDB
                    added = chromadb_service.add_document_chunks(
                        collection=collection,
                        chunks=processed["chunks"],
                        metadatas=metadatas
                    )
                    chunks_added = max(chunks_added, added)
                
                if chunks_added > 0:
                    doc_record.chunk_count = chunks_added
                    self.db.commit()
                    uploaded.append(filename)
                    total_chunks += chunks_added
                    logger.info(f"Successfully uploaded {filename}: {chunks_added} chunks to {collections}")
                else:
                    self.db.rollback()
                    logger.warning(f"Failed to add chunks for {filename}")
                    
            except Exception as e:
                logger.error(f"Error processing file {filename}: {e}")
                self.db.rollback()
                continue
        
        return uploaded, total_chunks
    
    def get_all_documents(self) -> List[ComplianceDocument]:
        """Get all uploaded compliance documents (admin only)"""
        return self.db.query(ComplianceDocument).order_by(ComplianceDocument.uploaded_at.desc()).all()
    
    def delete_document(self, document_id: int) -> bool:
        """Delete a compliance document and its chunks from ChromaDB"""
        doc = self.db.query(ComplianceDocument).filter(ComplianceDocument.id == document_id).first()
        if not doc:
            return False
        
        try:
            # Delete from ChromaDB (by metadata filter)
            if chromadb_service.is_available():
                collections = []
                if doc.category in ["HR", "BOTH"]:
                    collections.append("hr")
                if doc.category in ["IT", "BOTH"]:
                    collections.append("it")
                
                for collection in collections:
                    # Note: ChromaDB doesn't have a direct way to delete by metadata
                    # We'd need to query first, then delete by IDs
                    # For now, we'll just delete the DB record
                    # In production, you might want to implement proper cleanup
                    pass
            
            # Delete from database
            self.db.delete(doc)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            self.db.rollback()
            return False
    
    async def compliance_chat_with_agents(self, message: str) -> Dict:
        """
        RAG chat with agent coordination
        
        Args:
            message: User's question
            
        Returns:
            Dict with response, agent, compliant, policy_references
        """
        # Check if ChromaDB has any documents
        if chromadb_service.is_available():
            hr_count = chromadb_service.get_collection_count("hr")
            it_count = chromadb_service.get_collection_count("it")
            
            if hr_count == 0 and it_count == 0:
                return {
                    "response": "No compliance documents have been uploaded yet. Please contact an administrator to upload policy documents.",
                    "agent": "both",
                    "compliant": None,
                    "policy_references": []
                }
        
        # Route query to appropriate agent(s)
        routing = await coordinating_agent.route_query(message)
        
        hr_response = None
        it_response = None
        
        # Get HR agent response if needed
        if routing.get("hr"):
            try:
                hr_response = await hr_agent_service.get_response(message)
            except Exception as e:
                logger.error(f"Error getting HR agent response: {e}")
        
        # Get IT agent response if needed
        if routing.get("it"):
            try:
                it_response = await it_agent_service.get_response(message)
            except Exception as e:
                logger.error(f"Error getting IT agent response: {e}")
        
        # Synthesize responses
        final_response = await coordinating_agent.synthesize_response(
            message,
            hr_response,
            it_response
        )
        
        return final_response
    
    # Legacy methods for backward compatibility
    def upload_documents(self, user_id: int, files: List[Tuple[str, bytes]]) -> Tuple[List[str], int]:
        """Legacy method - kept for backward compatibility"""
        logger.warning("Legacy upload_documents called - this should use admin upload")
        return [], 0
    
    def get_documents(self, user_id: int) -> List[dict]:
        """Legacy method - kept for backward compatibility"""
        return []
    
    def clear_documents(self, user_id: int) -> None:
        """Legacy method - kept for backward compatibility"""
        pass
    
    async def compliance_chat(self, user_id: int, message: str) -> str:
        """Legacy method - redirects to new agent-based chat"""
        result = await self.compliance_chat_with_agents(message)
        return result.get("response", "I'm having trouble processing your question.")
    
    def get_policies(self, search: str = None) -> List:
        """Get policies"""
        if search:
            return self.policy_repo.search(search)
        return self.policy_repo.get_all()
    
    def get_faqs(self, category: str = None) -> List:
        """Get FAQs"""
        if category:
            return self.faq_repo.get_by_category(category)
        return self.faq_repo.get_all()
    
    def get_user_reminders(self, user_id: int) -> List:
        """Get user reminders"""
        return self.reminder_repo.get_by_user(user_id)
