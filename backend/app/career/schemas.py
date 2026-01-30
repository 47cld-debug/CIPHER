from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AppraisalResponse(BaseModel):
    id: int
    period: str
    self_review: Optional[str] = None
    manager_feedback: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
