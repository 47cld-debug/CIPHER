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
