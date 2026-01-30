from sqlalchemy.orm import Session
from services.openai_service import openai_service
from repositories.compliance_repository import PolicyRepository


class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.policy_repo = PolicyRepository(db)

    async def chat(self, message: str, context: str = "") -> str:
        """Handle AI chat requests"""
        # If context suggests policy question, search policies
        if "policy" in context.lower() or "policy" in message.lower():
            policies = self.policy_repo.get_all()
            policy_context = "\n".join([f"{p.title}: {p.content[:200]}" for p in policies[:5]])
            return await openai_service.answer_policy_question(message, policy_context)
        
        # General chat
        return await openai_service.answer_policy_question(message, "")
