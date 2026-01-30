import logging
from typing import List, Dict, Optional
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def get_learning_recommendations(
        self,
        user_skills: List[str],
        completed_courses: List[str],
        user_goals: List[str]
    ) -> List[Dict]:
        """Get AI-based learning recommendations"""
        if not self.client:
            # Return mock recommendations if OpenAI not configured
            return self._get_mock_recommendations()

        try:
            prompt = f"""
            Based on the following information, recommend 5 learning courses:
            - User's current skills: {', '.join(user_skills)}
            - Completed courses: {', '.join(completed_courses)}
            - User's career goals: {', '.join(user_goals)}
            
            Provide recommendations as a JSON array with course titles and brief descriptions.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful learning advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Parse response (simplified - would need proper JSON parsing)
            return self._parse_recommendations(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._get_mock_recommendations()

    def _get_mock_recommendations(self) -> List[Dict]:
        """Mock recommendations for demo"""
        return [
            {"title": "Advanced Python Programming", "description": "Deep dive into Python"},
            {"title": "Leadership Fundamentals", "description": "Build leadership skills"},
            {"title": "Data Science Essentials", "description": "Introduction to data science"},
        ]

    def _parse_recommendations(self, content: str) -> List[Dict]:
        """Parse OpenAI response (simplified)"""
        # In production, would properly parse JSON response
        return self._get_mock_recommendations()

    async def answer_policy_question(self, question: str, policy_context: str) -> str:
        """Answer policy questions using RAG-like approach"""
        if not self.client:
            return "I'm currently in demo mode. Please contact HR for policy questions."

        try:
            prompt = f"""
            Based on the following company policy context, answer the user's question.
            
            Policy Context:
            {policy_context}
            
            Question: {question}
            
            Provide a clear, helpful answer.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful HR assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return "I'm having trouble processing your question. Please try again later."


openai_service = OpenAIService()
