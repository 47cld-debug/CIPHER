from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class PolicyResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    category: Optional[str] = None

    class Config:
        from_attributes = True


class ReminderResponse(BaseModel):
    id: int
    type: str
    message: str
    due_date: Optional[date] = None
    completed: bool

    class Config:
        from_attributes = True


# RAG Compliance Chatbot
class DocumentInfo(BaseModel):
    filename: str
    chunks: int


class UploadResponse(BaseModel):
    uploaded: List[str]
    chunks_added: int


class ComplianceChatRequest(BaseModel):
    message: str


class ComplianceChatResponse(BaseModel):
    response: str
    agent: str  # "hr", "it", or "both"
    compliant: Optional[bool] = None
    policy_references: List[str] = []


class ComplianceDocumentResponse(BaseModel):
    id: int
    filename: str
    category: str
    uploaded_by: int
    uploaded_at: datetime
    chunk_count: int
    file_size: Optional[int] = None

    class Config:
        from_attributes = True