"""
HR Agent service for handling HR-related compliance queries using ChromaDB RAG.
"""
import logging
from typing import Dict, Optional, List
from services.chromadb_service import chromadb_service
from services.openai_service import openai_service

logger = logging.getLogger(__name__)


class HRAgentService:
    """HR Agent service for handling HR-related compliance queries"""
    
    async def get_response(self, query: str) -> Dict:
        """
        Get HR agent response with RAG retrieval from ChromaDB
        
        Args:
            query: User's question
            
        Returns:
            Dict with:
                - response: Generated response text
                - agent: "hr"
                - compliant: Compliance status (True/False/None)
                - policy_references: List of referenced policy/document names
        """
        # Search ChromaDB for relevant HR documents
        relevant_chunks = []
        policy_references = []
        
        if chromadb_service.is_available():
            try:
                results = chromadb_service.search("hr", query, n_results=5)
                relevant_chunks = results
                
                # Extract policy references from metadata
                for result in results:
                    metadata = result.get('metadata', {})
                    filename = metadata.get('filename', 'HR Policy')
                    if filename not in policy_references:
                        policy_references.append(filename)
            except Exception as e:
                logger.warning(f"ChromaDB search failed for HR: {e}")
        
        # Build context from retrieved chunks
        if relevant_chunks:
            context_parts = []
            for chunk in relevant_chunks:
                doc_text = chunk.get('document', '')
                metadata = chunk.get('metadata', {})
                filename = metadata.get('filename', 'Document')
                context_parts.append(f"[From: {filename}]\n{doc_text}")
            
            policy_context = "\n\n---\n\n".join(context_parts)
        else:
            policy_context = "No specific HR policies found. General HR guidance may be provided."
            logger.warning("No HR chunks retrieved from ChromaDB")
        
        # Generate response using OpenAI
        try:
            response_content = await openai_service.get_agent_response(
                query,
                policy_context,
                "hr",
                policy_references
            )
        except Exception as e:
            logger.error(f"Error generating HR response: {e}")
            response_content = "I'm having trouble processing your HR question. Please contact HR directly."
        
        # Check compliance
        compliant = self._check_compliance(query, policy_context)
        
        return {
            "response": response_content,
            "agent": "hr",
            "compliant": compliant,
            "policy_references": policy_references
        }
    
    def _check_compliance(self, query: str, context: str) -> Optional[bool]:
        """
        Simple compliance checking based on query and context
        
        Args:
            query: User's question
            context: Retrieved policy context
            
        Returns:
            True if compliant, False if not compliant, None if cannot determine
        """
        query_lower = query.lower()
        context_lower = context.lower()
        
        # Check for compliance-related keywords
        compliance_keywords = [
            "can i", "is it allowed", "permitted", "against policy",
            "violate", "allowed to", "am i allowed"
        ]
        
        if not any(keyword in query_lower for keyword in compliance_keywords):
            return None  # Not a compliance question
        
        # Check for negative indicators
        negative_indicators = [
            "not allowed", "prohibited", "violation", "against",
            "forbidden", "restricted", "cannot", "must not"
        ]
        if any(indicator in context_lower for indicator in negative_indicators):
            return False
        
        # Check for positive indicators
        positive_indicators = [
            "allowed", "permitted", "approved", "compliant",
            "acceptable", "authorized", "can", "may"
        ]
        if any(indicator in context_lower for indicator in positive_indicators):
            return True
        
        return None  # Cannot determine


# Global instance
hr_agent_service = HRAgentService()
