from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from openai import RateLimitError, AuthenticationError
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.compliance.schemas import (
    PolicyResponse,
    FAQResponse,
    ReminderResponse,
    UploadResponse,
    DocumentInfo,
    ComplianceChatRequest,
    ComplianceChatResponse,
)
from app.compliance.service import ComplianceService

router = APIRouter()


@router.get("/policies", response_model=List[PolicyResponse])
def get_policies(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get policies"""
    service = ComplianceService(db)
    return service.get_policies(search)


@router.get("/faqs", response_model=List[FAQResponse])
def get_faqs(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get FAQs"""
    service = ComplianceService(db)
    return service.get_faqs(category)


@router.get("/reminders", response_model=List[ReminderResponse])
def get_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user reminders"""
    service = ComplianceService(db)
    return service.get_user_reminders(current_user.id)


# RAG Compliance Chatbot: document upload and chat
QUOTA_MSG = "OpenAI quota exceeded. Please check your plan and billing at https://platform.openai.com, or try again later."
AUTH_MSG = "Invalid OpenAI API key. Please check OPENAI_API_KEY in backend/.env and restart the server."


@router.post("/documents/upload", response_model=UploadResponse)
async def upload_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    files: List[UploadFile] = File(...),
):
    """Upload PDF/DOC/TXT for RAG. Parsed, chunked, embedded, stored per user."""
    service = ComplianceService(db)
    file_list = []
    for f in files:
        if not f.filename:
            continue
        content = await f.read()
        file_list.append((f.filename, content))
    try:
        uploaded, chunks_added = service.upload_documents(current_user.id, file_list)
        return UploadResponse(uploaded=uploaded, chunks_added=chunks_added)
    except RateLimitError:
        raise HTTPException(status_code=503, detail=QUOTA_MSG)
    except AuthenticationError:
        raise HTTPException(status_code=401, detail=AUTH_MSG)


@router.get("/documents", response_model=dict)
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List uploaded documents (filename + chunk count) for current user."""
    service = ComplianceService(db)
    docs = service.get_documents(current_user.id)
    return {"documents": [DocumentInfo(filename=d["filename"], chunks=d["chunks"]) for d in docs]}


@router.delete("/documents")
def clear_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear uploaded documents for current user."""
    service = ComplianceService(db)
    service.clear_documents(current_user.id)
    return {"cleared": True}


@router.post("/chat", response_model=ComplianceChatResponse)
async def compliance_chat(
    request: ComplianceChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """RAG chat: answer only from uploaded documents. Guardrails for no docs or off-topic."""
    service = ComplianceService(db)
    try:
        response = await service.compliance_chat(current_user.id, request.message)
        return ComplianceChatResponse(response=response)
    except RateLimitError:
        raise HTTPException(status_code=503, detail=QUOTA_MSG)
    except AuthenticationError:
        raise HTTPException(status_code=401, detail=AUTH_MSG)
