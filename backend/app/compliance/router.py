from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from openai import RateLimitError, AuthenticationError
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user
from models.user import User
from app.compliance.schemas import (
    PolicyResponse,
    FAQResponse,
    ReminderResponse,
    UploadResponse,
    DocumentInfo,
    ComplianceChatRequest,
    ComplianceChatResponse,
    ComplianceDocumentResponse,
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


# Admin-only document upload endpoints
@router.post("/admin/documents/upload", response_model=UploadResponse)
async def upload_documents_admin(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    files: List[UploadFile] = File(...),
):
    """Admin-only: Upload PDF/DOC/TXT for RAG. Documents are processed, chunked, and stored in ChromaDB."""
    service = ComplianceService(db)
    file_list = []
    for f in files:
        if not f.filename:
            continue
        content = await f.read()
        file_list.append((f.filename, content))
    try:
        uploaded, chunks_added = await service.upload_documents_admin(current_user.id, file_list)
        return UploadResponse(uploaded=uploaded, chunks_added=chunks_added)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RateLimitError:
        raise HTTPException(status_code=503, detail=QUOTA_MSG)
    except AuthenticationError:
        raise HTTPException(status_code=401, detail=AUTH_MSG)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading documents: {str(e)}")


@router.get("/admin/documents", response_model=List[ComplianceDocumentResponse])
def get_all_documents(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Admin-only: List all uploaded compliance documents."""
    service = ComplianceService(db)
    return service.get_all_documents()


@router.delete("/admin/documents/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Admin-only: Delete a compliance document."""
    service = ComplianceService(db)
    success = service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"deleted": True, "document_id": document_id}


# Legacy user upload endpoint - kept for backward compatibility but deprecated
@router.post("/documents/upload", response_model=UploadResponse, deprecated=True)
async def upload_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    files: List[UploadFile] = File(...),
):
    """DEPRECATED: Document upload is now admin-only. Use /admin/documents/upload instead."""
    raise HTTPException(
        status_code=403,
        detail="Document upload is restricted to administrators. Please contact an admin to upload compliance documents."
    )


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
    """RAG chat with agent coordination: routes to HR/IT agents and synthesizes responses."""
    service = ComplianceService(db)
    try:
        result = await service.compliance_chat_with_agents(request.message)
        return ComplianceChatResponse(**result)
    except RateLimitError:
        raise HTTPException(status_code=503, detail=QUOTA_MSG)
    except AuthenticationError:
        raise HTTPException(status_code=401, detail=AUTH_MSG)
    except Exception as e:
        logger.error(f"Error in compliance chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")