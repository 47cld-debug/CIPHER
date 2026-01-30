from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    context: str = ""  # Optional context (e.g., current page, user role)


class ChatResponse(BaseModel):
    response: str


class LearningRecommendationRequest(BaseModel):
    query: str  # User's project description or learning need


class LearningRecommendationResponse(BaseModel):
    id: int
    title: str
    description: str
    course_type: str  # INTERNAL or EXTERNAL
    external_url: Optional[str] = None
