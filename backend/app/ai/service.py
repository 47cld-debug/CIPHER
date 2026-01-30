from sqlalchemy.orm import Session
from typing import List, Dict
from services.openai_service import openai_service
from repositories.compliance_repository import PolicyRepository
from repositories.learning_repository import CourseRepository


class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.policy_repo = PolicyRepository(db)
        self.course_repo = CourseRepository(db)

    async def chat(self, message: str, context: str = "") -> str:
        """Handle AI chat requests"""
        # If context suggests policy question, search policies
        if "policy" in context.lower() or "policy" in message.lower():
            policies = self.policy_repo.get_all()
            policy_context = "\n".join([f"{p.title}: {p.content[:200]}" for p in policies[:5]])
            return await openai_service.answer_policy_question(message, policy_context)
        
        # General chat
        return await openai_service.answer_policy_question(message, "")

    async def get_learning_recommendations_rag(self, user_query: str) -> List[Dict]:
        """RAG-based learning recommendations"""
        # Get all available courses
        courses = self.course_repo.get_all(skip=0, limit=100)
        course_data = [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description or "",
                "category": c.category or "",
                "course_type": c.course_type.value,
                "external_url": c.external_url
            }
            for c in courses
        ]
        
        return await openai_service.get_rag_learning_recommendations(user_query, course_data)
