"""
Coordinating agent that routes queries to appropriate agents (HR/IT) and synthesizes responses.
"""
import logging
from typing import Dict, Optional, List
from services.openai_service import openai_service

logger = logging.getLogger(__name__)


class CoordinatingAgent:
    """Coordinates between HR and IT agents for compliance queries"""
    
    HR_KEYWORDS = [
        "leave", "vacation", "pto", "sick leave", "attendance", "time off",
        "benefits", "health insurance", "retirement", "expense", "reimbursement",
        "travel", "remote work", "work from home", "code of conduct", "harassment",
        "discrimination", "performance", "appraisal", "goal", "career", "promotion",
        "resignation", "termination", "policy", "hr", "human resources"
    ]
    
    IT_KEYWORDS = [
        "password", "login", "authentication", "security", "data", "privacy",
        "software", "ai tools", "chatgpt", "cursor", "network", "vpn", "device",
        "laptop", "computer", "technical issue", "system access", "email",
        "backup", "intellectual property", "ip", "it", "information technology"
    ]
    
    async def route_query(self, query: str) -> Dict[str, bool]:
        """
        Route query to appropriate agent(s)
        
        Args:
            query: User's question
            
        Returns:
            Dict with "hr" and "it" boolean flags indicating which agents should respond
        """
        query_lower = query.lower()
        
        # Try OpenAI classification first
        if openai_service.client:
            try:
                classification = await self._classify_with_openai(query)
                if classification in ["hr", "it", "both"]:
                    if classification == "hr":
                        return {"hr": True, "it": False}
                    elif classification == "it":
                        return {"hr": False, "it": True}
                    else:  # both
                        return {"hr": True, "it": True}
            except Exception as e:
                logger.warning(f"OpenAI classification failed, using keyword fallback: {e}")
        
        # Fallback to keyword-based classification
        return self._classify_with_keywords(query_lower)
    
    async def _classify_with_openai(self, query: str) -> str:
        """Use OpenAI to classify query intent"""
        prompt = f"""
        Classify this employee query into HR, IT, or BOTH:
        Query: "{query}"
        
        HR topics: leave, attendance, benefits, expenses, conduct, harassment, performance, remote work, travel, career, goals
        IT topics: security, passwords, software, AI tools, data, network, devices, technical issues, systems, access
        
        Respond with only one word: HR, IT, or BOTH
        """
        
        try:
            response = openai_service.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a query classifier. Respond with only one word: HR, IT, or BOTH."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=10
            )
            
            result = response.choices[0].message.content.strip().lower()
            if result in ["hr", "it", "both"]:
                return result
            return "both"
        except Exception as e:
            logger.error(f"OpenAI classification error: {e}")
            return "both"
    
    def _classify_with_keywords(self, query_lower: str) -> Dict[str, bool]:
        """Fallback keyword-based classification"""
        is_hr = any(keyword in query_lower for keyword in self.HR_KEYWORDS)
        is_it = any(keyword in query_lower for keyword in self.IT_KEYWORDS)
        
        return {
            "hr": is_hr,
            "it": is_it
        }
    
    async def synthesize_response(
        self,
        query: str,
        hr_response: Optional[Dict],
        it_response: Optional[Dict]
    ) -> Dict:
        """
        Synthesize responses from multiple agents into a coherent answer
        
        Args:
            query: Original user query
            hr_response: Response from HR agent (if available)
            it_response: Response from IT agent (if available)
            
        Returns:
            Synthesized response dict with:
                - response: Combined answer
                - - agent: "both"
                - compliant: Overall compliance status
                - policy_references: Combined policy references
        """
        # If only one agent responded, return that response
        if hr_response and not it_response:
            return {
                **hr_response,
                "agent": "hr"
            }
        if it_response and not hr_response:
            return {
                **it_response,
                "agent": "it"
            }
        
        # If both agents responded, synthesize
        if hr_response and it_response:
            return await self._synthesize_both_responses(query, hr_response, it_response)
        
        # No responses (shouldn't happen, but handle gracefully)
        return {
            "response": "I'm having trouble processing your question. Please try rephrasing or contact support.",
            "agent": "both",
            "compliant": None,
            "policy_references": []
        }
    
    async def _synthesize_both_responses(
        self,
        query: str,
        hr_response: Dict,
        it_response: Dict
    ) -> Dict:
        """Synthesize responses from both HR and IT agents"""
        hr_text = hr_response.get("response", "")
        it_text = it_response.get("response", "")
        hr_refs = hr_response.get("policy_references", [])
        it_refs = it_response.get("policy_references", [])
        hr_compliant = hr_response.get("compliant")
        it_compliant = it_response.get("compliant")
        
        # Combine policy references
        all_references = list(set(hr_refs + it_refs))
        
        # Determine overall compliance (both must be compliant if both are determined)
        overall_compliant = None
        if hr_compliant is not None and it_compliant is not None:
            overall_compliant = hr_compliant and it_compliant
        elif hr_compliant is not None:
            overall_compliant = hr_compliant
        elif it_compliant is not None:
            overall_compliant = it_compliant
        
        # Use OpenAI to synthesize if available
        if openai_service.client:
            try:
                prompt = f"""
                The user asked: "{query}"
                
                HR Agent Response:
                {hr_text}
                
                IT Agent Response:
                {it_text}
                
                Synthesize these two responses into a single, coherent, and helpful answer.
                Make sure the answer addresses both HR and IT aspects if relevant.
                Keep the answer clear and concise.
                """
                
                response = openai_service.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful compliance assistant that synthesizes information from multiple sources."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                
                synthesized_text = response.choices[0].message.content
                
                return {
                    "response": synthesized_text,
                    "agent": "both",
                    "compliant": overall_compliant,
                    "policy_references": all_references
                }
            except Exception as e:
                logger.warning(f"Error synthesizing with OpenAI, using simple concatenation: {e}")
        
        # Fallback: Simple concatenation
        combined_response = f"**HR Response:**\n{hr_text}\n\n**IT Response:**\n{it_text}"
        
        return {
            "response": combined_response,
            "agent": "both",
            "compliant": overall_compliant,
            "policy_references": all_references
        }


# Global instance
coordinating_agent = CoordinatingAgent()
