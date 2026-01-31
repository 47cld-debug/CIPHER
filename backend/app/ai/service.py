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
        # Get all available courses (increase limit to get all courses)
        courses = self.course_repo.get_all(skip=0, limit=1000)
        
        if not courses:
            return []
        
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
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Preparing recommendations from {len(course_data)} courses. Course IDs: {[c['id'] for c in course_data[:10]]}")
        logger.info(f"Course titles: {[c['title'] for c in course_data[:10]]}")
        
        recommendations = await openai_service.get_rag_learning_recommendations(user_query, course_data)
        logger.info(f"AI returned {len(recommendations)} recommendations with IDs: {[r.get('id') for r in recommendations]}")
        
        # Final validation - ensure all returned IDs exist
        valid_ids = {c['id'] for c in course_data}
        validated = []
        for r in recommendations:
            rec_id = r.get('id')
            if rec_id in valid_ids:
                validated.append(r)
            else:
                # Try to find by title as fallback
                title = r.get('title', '')
                matching_course = next((c for c in course_data if c.get('title', '').lower() == title.lower()), None)
                if matching_course:
                    logger.info(f"Found course by title '{title}', using ID {matching_course['id']} instead of {rec_id}")
                    validated.append({
                        **r,
                        'id': matching_course['id']
                    })
                else:
                    logger.warning(f"Could not find course with ID {rec_id} or title '{title}', skipping")
        
        if len(validated) < len(recommendations):
            logger.warning(f"Filtered out {len(recommendations) - len(validated)} invalid recommendations")
        
        logger.info(f"Returning {len(validated)} validated recommendations with IDs: {[r.get('id') for r in validated]}")
        return validated
