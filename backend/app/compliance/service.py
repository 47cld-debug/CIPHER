from typing import List, Tuple
from sqlalchemy.orm import Session
from repositories.compliance_repository import PolicyRepository, FAQRepository, ReminderRepository
from services.rag_compliance_service import (
    parse_document,
    chunk_text,
    get_embedding_client,
    embed_texts,
    add_documents_for_user,
    get_documents_summary_for_user,
    clear_documents_for_user,
    retrieve_top_k,
    is_in_domain,
    MAX_FILES_PER_UPLOAD,
    ALLOWED_EXTENSIONS,
)
from services.openai_service import openai_service


class ComplianceService:
    def __init__(self, db: Session):
        self.policy_repo = PolicyRepository(db)
        self.faq_repo = FAQRepository(db)
        self.reminder_repo = ReminderRepository(db)

    def upload_documents(self, user_id: int, files: List[Tuple[str, bytes]]) -> Tuple[List[str], int]:
        """Parse, chunk, embed, store. Returns (uploaded filenames, chunks_added)."""
        uploaded = []
        all_chunks_with_meta = []
        client = get_embedding_client()
        if not client:
            return [], 0
        for i, (filename, content) in enumerate(files):
            if i >= MAX_FILES_PER_UPLOAD:
                break
            ext = "." + filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
            if ext not in ALLOWED_EXTENSIONS:
                continue
            try:
                text = parse_document(content, filename)
            except Exception:
                continue
            chunks = chunk_text(text)
            if not chunks:
                continue
            embeddings = embed_texts(client, chunks)
            for j, (chunk, emb) in enumerate(zip(chunks, embeddings)):
                all_chunks_with_meta.append({"text": chunk, "embedding": emb, "source": filename})
            uploaded.append(filename)
        added = add_documents_for_user(str(user_id), all_chunks_with_meta)
        return uploaded, added

    def get_documents(self, user_id: int) -> List[dict]:
        """List uploaded documents (filename, chunks) for user."""
        return get_documents_summary_for_user(str(user_id))

    def clear_documents(self, user_id: int) -> None:
        clear_documents_for_user(str(user_id))

    async def compliance_chat(self, user_id: int, message: str) -> str:
        """RAG chat: retrieve from user docs, strict LLM answer. Guardrails if no docs or off-topic."""
        chunks = get_documents_summary_for_user(str(user_id))
        total_chunks = sum(c["chunks"] for c in chunks)
        if total_chunks == 0:
            return "Upload documents to start asking questions."
        if not is_in_domain(message):
            return "I'm designed to assist only with company-related HR, IT, and compliance queries."
        client = get_embedding_client()
        if not client:
            return "I'm currently in demo mode. Please ensure OpenAI is configured for the Compliance Assistant."
        query_embedding = embed_texts(client, [message.strip()])
        if not query_embedding:
            return "I'm having trouble processing your question. Please try again later."
        retrieved = retrieve_top_k(str(user_id), query_embedding[0])
        if not retrieved:
            return "I couldn't find relevant content in your documents for this question. Try rephrasing or upload more documents."
        context_text = "\n\n---\n\n".join(
            f"[From: {c.get('source', 'document')}]\n{c.get('text', '')}" for c in retrieved
        )
        return await openai_service.answer_compliance_rag(message, context_text)

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
