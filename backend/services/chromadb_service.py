"""
ChromaDB service for persistent vector storage of compliance documents.
Handles HR and IT policy collections with semantic search capabilities.
"""
import logging
from typing import List, Dict, Optional
import uuid
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)

# Try to import ChromaDB, but make it optional
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError as e:
    logger.warning(f"ChromaDB not available: {e}. System will use database fallback.")
    CHROMADB_AVAILABLE = False
    chromadb = None
    Settings = None


class ChromaDBService:
    """Service for managing ChromaDB collections and vector operations"""
    
    def __init__(self):
        if not CHROMADB_AVAILABLE:
            logger.warning("ChromaDB is not installed. Using database fallback mode.")
            self.client = None
            self.collection_hr = None
            self.collection_it = None
            return
        
        try:
            # Ensure directory exists
            persist_dir = Path(settings.CHROMADB_PERSIST_DIR)
            persist_dir.mkdir(parents=True, exist_ok=True)
            
            self.client = chromadb.PersistentClient(
                path=str(persist_dir)
            )
            
            # Create or get collections
            self.collection_hr = self.client.get_or_create_collection(
                name="hr_policies",
                metadata={"description": "HR policies and compliance documents"}
            )
            self.collection_it = self.client.get_or_create_collection(
                name="it_policies",
                metadata={"description": "IT policies and compliance documents"}
            )
            
            logger.info("ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.client = None
            self.collection_hr = None
            self.collection_it = None
    
    def is_available(self) -> bool:
        """Check if ChromaDB is available and initialized"""
        return CHROMADB_AVAILABLE and self.client is not None
    
    def add_document_chunks(
        self,
        collection: str,
        chunks: List[str],
        metadatas: List[Dict],
        ids: Optional[List[str]] = None
    ) -> int:
        """
        Add document chunks to ChromaDB collection
        
        Args:
            collection: "hr" or "it"
            chunks: List of text chunks
            metadatas: List of metadata dicts for each chunk
            ids: Optional list of IDs, will generate if not provided
            
        Returns:
            Number of chunks added
        """
        if not self.is_available():
            logger.warning("ChromaDB not available, skipping document addition")
            return 0
        
        if not chunks or not metadatas:
            logger.warning("No chunks or metadatas provided")
            return 0
        
        try:
            collection_obj = self.collection_hr if collection.lower() == "hr" else self.collection_it
            
            # Generate IDs if not provided
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in chunks]
            
            # Ensure metadatas match chunks length
            if len(metadatas) != len(chunks):
                logger.warning(f"Metadata count ({len(metadatas)}) doesn't match chunks ({len(chunks)})")
                # Pad or truncate metadatas
                if len(metadatas) < len(chunks):
                    metadatas.extend([{}] * (len(chunks) - len(metadatas)))
                else:
                    metadatas = metadatas[:len(chunks)]
            
            # Add to collection
            collection_obj.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(chunks)} chunks to {collection} collection")
            return len(chunks)
        except Exception as e:
            logger.error(f"Error adding documents to ChromaDB: {e}")
            return 0
    
    def search(
        self,
        collection: str,
        query: str,
        n_results: int = 5,
        where: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Search similar documents in ChromaDB collection
        
        Args:
            collection: "hr" or "it"
            query: Search query text
            n_results: Number of results to return
            where: Optional metadata filter
            
        Returns:
            List of result dicts with 'document', 'metadata', 'distance', 'id'
        """
        if not self.is_available():
            logger.warning("ChromaDB not available, returning empty results")
            return []
        
        if not query or not query.strip():
            return []
        
        try:
            collection_obj = self.collection_hr if collection.lower() == "hr" else self.collection_it
            
            # Perform query
            results = collection_obj.query(
                query_texts=[query.strip()],
                n_results=n_results,
                where=where
            )
            
            # Format results
            formatted_results = []
            if results.get('documents') and len(results['documents']) > 0:
                documents = results['documents'][0]
                metadatas = results.get('metadatas', [[]])[0] if results.get('metadatas') else []
                distances = results.get('distances', [[]])[0] if results.get('distances') else []
                ids = results.get('ids', [[]])[0] if results.get('ids') else []
                
                for i in range(len(documents)):
                    formatted_results.append({
                        'document': documents[i],
                        'metadata': metadatas[i] if i < len(metadatas) else {},
                        'distance': distances[i] if i < len(distances) else None,
                        'id': ids[i] if i < len(ids) else None
                    })
            
            return formatted_results
        except Exception as e:
            logger.error(f"Error searching ChromaDB: {e}")
            return []
    
    def clear_collection(self, collection: str) -> bool:
        """
        Clear all documents from a collection
        
        Args:
            collection: "hr" or "it"
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_available():
            logger.warning("ChromaDB not available, cannot clear collection")
            return False
        
        try:
            collection_obj = self.collection_hr if collection.lower() == "hr" else self.collection_it
            # Delete collection and recreate
            self.client.delete_collection(name=collection_obj.name)
            
            if collection.lower() == "hr":
                self.collection_hr = self.client.create_collection(
                    name="hr_policies",
                    metadata={"description": "HR policies and compliance documents"}
                )
            else:
                self.collection_it = self.client.create_collection(
                    name="it_policies",
                    metadata={"description": "IT policies and compliance documents"}
                )
            
            logger.info(f"Cleared {collection} collection")
            return True
        except Exception as e:
            logger.error(f"Error clearing ChromaDB collection: {e}")
            return False
    
    def get_collection_count(self, collection: str) -> int:
        """Get number of documents in a collection"""
        if not self.is_available():
            return 0
        
        try:
            collection_obj = self.collection_hr if collection.lower() == "hr" else self.collection_it
            return collection_obj.count()
        except Exception as e:
            logger.error(f"Error getting collection count: {e}")
            return 0
    
    def delete_document(self, collection: str, document_id: str) -> bool:
        """Delete a specific document by ID"""
        if not self.is_available():
            return False
        
        try:
            collection_obj = self.collection_hr if collection.lower() == "hr" else self.collection_it
            collection_obj.delete(ids=[document_id])
            logger.info(f"Deleted document {document_id} from {collection} collection")
            return True
        except Exception as e:
            logger.error(f"Error deleting document from ChromaDB: {e}")
            return False


# Global instance
chromadb_service = ChromaDBService()
