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
    session_date: Optional[date] = None
    session_time: Optional[str] = None
    trainer_name: Optional[str] = None
    total_slots: Optional[int] = None
    location: Optional[str] = None
    booked_slots: Optional[int] = None
    available_slots: Optional[int] = None

    class Config:
        from_attributes = True


class InitiativeDetailResponse(InitiativeResponse):
    booked_slots: int
    available_slots: int


class BookSessionResponse(BaseModel):
    id: int
    initiative_id: int
    message: str = "Booked successfully"


class SessionResponse(BaseModel):
    id: int
    initiative_id: int
    requested_at: datetime
    status: str
    initiative: InitiativeResponse

    class Config:
        from_attributes = True
