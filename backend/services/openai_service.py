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

    async def answer_compliance_rag(self, question: str, context_text: str) -> str:
        """Answer ONLY from provided document context. No external knowledge. Strict RAG."""
        if not self.client:
            return "I'm currently in demo mode. Please upload documents and ensure OpenAI is configured for the Compliance Assistant."

        system = (
            "You are a compliance assistant. Answer ONLY using the following document context. "
            "Do not use external knowledge. If the context does not contain the answer, say so clearly. "
            "Domains: HR Policy, IT Policy, Leave & Attendance, Compliance & Company SOPs. "
            "Keep answers concise and reference the documents implicitly."
        )
        try:
            prompt = f"Document context:\n\n{context_text}\n\nQuestion: {question}"
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
            )
            return response.choices[0].message.content
        except Exception as e:
            err_name = type(e).__name__
            if err_name == "RateLimitError" or (getattr(e, "status_code", None) == 429):
                logger.warning("OpenAI quota exceeded: %s", e)
                return "OpenAI quota exceeded. Please check your plan and billing at https://platform.openai.com, or try again later."
            if err_name == "AuthenticationError" or (getattr(e, "status_code", None) == 401):
                logger.warning("OpenAI invalid API key: %s", e)
                return "Invalid OpenAI API key. Please check OPENAI_API_KEY in backend/.env and restart the server."
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
            # Build course context with explicit IDs
            course_context = "\n".join([
                f"ID: {c.get('id')} - {c.get('title', '')}: {c.get('description', '')[:100]} (Type: {c.get('course_type', '')}, Category: {c.get('category', '')})"
                for c in available_courses[:20]
            ])
            
            # Create a mapping of course IDs for validation
            valid_course_ids = {c.get('id') for c in available_courses}
            course_id_map = {c.get('id'): c for c in available_courses}
            
            prompt = f"""
            The user has a project or learning need: "{user_query}"
            
            Available courses (YOU MUST USE ONLY THESE IDs):
            {course_context}
            
            IMPORTANT: You MUST use ONLY the course IDs listed above. Do not create or invent new IDs.
            
            Based on the user's project description, recommend 3-5 most relevant courses from the list above.
            Understand what skills/knowledge they need and match courses accordingly.
            
            Return a JSON array with this EXACT structure (use the IDs from the list above):
            [
                {{
                    "id": <course_id_from_list_above>,
                    "title": "<exact_course_title_from_list>",
                    "description": "<why this course is relevant to the user's project>",
                    "course_type": "<INTERNAL or EXTERNAL from list>",
                    "external_url": "<url if external, null otherwise>"
                }}
            ]
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a learning advisor. You MUST return only valid JSON with course IDs that exist in the provided list. Never invent or create new course IDs."},
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
                
                # Validate and filter recommendations - only return courses with valid IDs
                validated_recommendations = []
                for rec in recommendations:
                    rec_id = rec.get('id')
                    # Convert to int if it's a string, and check if it exists
                    try:
                        rec_id_int = int(rec_id) if rec_id is not None else None
                    except (ValueError, TypeError):
                        logger.warning(f"AI returned invalid course ID (not a number): {rec_id}, skipping")
                        continue
                    
                    if rec_id_int is not None and rec_id_int in valid_course_ids:
                        # Use the actual course data to ensure accuracy
                        original_course = course_id_map[rec_id_int]
                        validated_recommendations.append({
                            "id": rec_id_int,
                            "title": original_course.get('title'),
                            "description": rec.get('description', original_course.get('description', '')),  # Use AI description but keep original title
                            "course_type": original_course.get('course_type'),
                            "external_url": original_course.get('external_url')
                        })
                    else:
                        logger.warning(f"AI returned invalid course ID: {rec_id_int} (not in available courses), skipping. Available IDs: {sorted(list(valid_course_ids))[:10]}")
                
                if not validated_recommendations:
                    logger.warning("All AI recommendations had invalid IDs, falling back to mock recommendations")
                    return self._get_mock_rag_recommendations(user_query, available_courses)
                
                return validated_recommendations[:5]
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

    async def get_agent_response(
        self,
        query: str,
        context: str,
        agent_type: str,
        policy_references: List[str] = None
    ) -> str:
        """
        Get agent response with context from RAG
        
        Args:
            query: User's question
            context: Retrieved policy/document context
            agent_type: "hr" or "it"
            policy_references: List of referenced policy/document names
            
        Returns:
            Generated response text
        """
        if not self.client:
            return f"I'm currently in demo mode. Please contact {agent_type.upper()} for assistance."
        
        try:
            agent_role = "HR assistant" if agent_type == "hr" else "IT support assistant"
            policy_refs = "\n".join([f"- {ref}" for ref in (policy_references or [])])
            
            # Build the relevant policies section separately
            relevant_policies_section = ""
            if policy_refs:
                relevant_policies_section = f"\n\nRelevant Policies:\n{policy_refs}"
            
            prompt = f"""You are a helpful {agent_role}. Answer the user's question based on the following company policy context.

Policy Context:
{context}{relevant_policies_section}

User Question: {query}

Provide a clear, helpful, and accurate answer based on the policies. If the question relates to compliance, indicate whether the action is compliant or not."""
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are a helpful {agent_role}."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return f"I'm having trouble processing your question. Please try again later or contact {agent_type.upper()} directly."

    async def get_career_suggestions(
        self,
        user_profile: Dict,
        company_roles: List[Dict],
        user_skills: List[str],
    ) -> Dict[str, str]:
        """
        Act as career mentor: suggest career paths and skill gaps.
        user_profile: { job_title, performance_rating, full_name }
        company_roles: [ { name, required_skills: [...] } ]
        user_skills: list of skill names the user has
        Returns: { "suggestions": "...", "skill_gaps": "..." }
        """
        if not self.client:
            return self._get_mock_career_suggestions(user_profile, company_roles, user_skills)

        try:
            roles_text = "\n".join([
                f"- {r.get('name', '')}: requires {', '.join(r.get('required_skills', []))}"
                for r in company_roles
            ])
            prompt = f"""You are a career mentor. Analyze this employee profile and company roles.

Employee profile:
- Current job role: {user_profile.get('job_title', 'Not specified')}
- Performance rating: {user_profile.get('performance_rating', 'Not specified')}
- Name: {user_profile.get('full_name', '')}

Skills the employee has: {', '.join(user_skills) if user_skills else 'None listed'}

Company roles and required skills:
{roles_text}

Provide two parts in your response:

1) CAREER PATH SUGGESTIONS (2-4 bullet points): Based on their experience and skills, suggest specific next roles they could grow toward (use the company role names above). Example: "Based on your experience in frontend development, you could grow toward: Senior Frontend Engineer, UI Architect, Full Stack Developer."

2) SKILL GAPS: For each suggested role, list the skills they still need. Example: "To reach Senior Frontend Engineer you need: System Design, Performance Optimization, API Integration."

Format your reply with clear headings "CAREER PATH SUGGESTIONS" and "SKILL GAPS" so the two parts can be split."""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a career mentor. Be concise and use the company role names and skill names provided."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
            )
            content = response.choices[0].message.content or ""
            suggestions, skill_gaps = self._split_career_response(content)
            return {"suggestions": suggestions, "skill_gaps": skill_gaps}
        except Exception as e:
            logger.error(f"OpenAI API error (career): {e}")
            return self._get_mock_career_suggestions(user_profile, company_roles, user_skills)

    def _split_career_response(self, content: str) -> tuple:
        """Split AI response into suggestions and skill_gaps by headings."""
        suggestions = ""
        skill_gaps = ""
        if "SKILL GAPS" in content.upper():
            parts = content.upper().split("SKILL GAPS")
            if len(parts) >= 2:
                suggestions = content[: content.upper().rfind("SKILL GAPS")].strip()
                skill_gaps = content[content.upper().rfind("SKILL GAPS") + len("SKILL GAPS") :].strip()
            else:
                suggestions = content
        else:
            suggestions = content
        return suggestions, skill_gaps

    def _get_mock_career_suggestions(
        self, user_profile: Dict, company_roles: List[Dict], user_skills: List[str]
    ) -> Dict[str, str]:
        """Mock career suggestions when OpenAI is not configured."""
        role_names = [r.get("name", "") for r in company_roles if r.get("name")][:3]
        suggestions = (
            f"Based on your profile ({user_profile.get('job_title', 'Current role')}), "
            f"you could grow toward: {', '.join(role_names or ['Senior roles'])}. "
            "Configure OPENAI_API_KEY for personalized AI suggestions."
        )
        skill_gaps = "To get personalized skill gaps, add OPENAI_API_KEY to your backend .env and refresh."
        return {"suggestions": suggestions, "skill_gaps": skill_gaps}


openai_service = OpenAIService()
