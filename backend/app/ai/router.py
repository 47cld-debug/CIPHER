from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.ai.schemas import ChatRequest, ChatResponse
from app.ai.service import AIService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI chat endpoint"""
    service = AIService(db)
    response = await service.chat(request.message, request.context)
    return ChatResponse(response=response)
