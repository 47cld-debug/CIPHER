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

    async def get_rag_learning_recommendations(
        self,
        user_query: str,
        available_courses: List[Dict]
    ) -> List[Dict]:
        """RAG-based learning recommendations - understands project needs and recommends courses"""
        if not self.client:
            # Return mock recommendations based on query
            query_lower = user_query.lower()
            matched = [c for c in available_courses[:5] if any(
                term in c.get("title", "").lower() or term in c.get("description", "").lower()
                for term in query_lower.split()
            )]
            return matched[:3] if matched else available_courses[:3]

        try:
            # Build course context
            course_context = "\n".join([
                f"- {c.get('title', '')}: {c.get('description', '')[:100]} (Type: {c.get('course_type', '')}, Category: {c.get('category', '')})"
                for c in available_courses[:20]
            ])
            
            prompt = f"""
            The user has a project or learning need: "{user_query}"
            
            Available courses:
            {course_context}
            
            Based on the user's project description, recommend 3-5 most relevant courses.
            Understand what skills/knowledge they need and match courses accordingly.
            
            Return a JSON array with this structure:
            [
                {{
                    "id": <course_id>,
                    "title": "<course_title>",
                    "description": "<why this course is relevant>",
                    "course_type": "<INTERNAL or EXTERNAL>",
                    "external_url": "<url if external>"
                }}
            ]
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a learning advisor. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Parse JSON response
            import json
            content = response.choices[0].message.content
            # Try to extract JSON from response
            try:
                # Remove markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                recommendations = json.loads(content)
                # Validate and return
                return recommendations[:5]
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON: {content}")
                return self._get_mock_rag_recommendations(user_query, available_courses)
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._get_mock_rag_recommendations(user_query, available_courses)

    def _get_mock_rag_recommendations(self, query: str, courses: List[Dict]) -> List[Dict]:
        """Mock RAG recommendations based on query"""
        query_lower = query.lower()
        # Simple keyword matching
        matched = []
        for course in courses:
            title = course.get("title", "").lower()
            desc = course.get("description", "").lower()
            if any(term in title or term in desc for term in query_lower.split() if len(term) > 3):
                matched.append({
                    "id": course.get("id"),
                    "title": course.get("title"),
                    "description": f"Relevant to your project: {course.get('description', '')[:100]}",
                    "course_type": course.get("course_type", "INTERNAL"),
                    "external_url": course.get("external_url")
                })
        return matched[:5] if matched else courses[:3]


openai_service = OpenAIService()
