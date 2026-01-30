from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class InitiativeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: int
    initiative_id: int
    requested_at: datetime
    status: str
    initiative: InitiativeResponse

    class Config:
        from_attributes = True
