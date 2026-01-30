from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.wellness.schemas import (
    InitiativeResponse,
    InitiativeDetailResponse,
    BookSessionResponse,
    SessionResponse,
)
from app.wellness.service import WellnessService

router = APIRouter()


@router.get("/initiatives", response_model=List[InitiativeResponse])
def get_initiatives(db: Session = Depends(get_db)):
    """Get wellness initiatives"""
    service = WellnessService(db)
    return service.get_initiatives()


@router.get("/initiatives/{initiative_id}", response_model=InitiativeDetailResponse)
def get_initiative_detail(
    initiative_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get initiative detail with booked/available slots"""
    service = WellnessService(db)
    return service.get_initiative_detail(initiative_id)


@router.post("/initiatives/{initiative_id}/book", response_model=BookSessionResponse)
def book_session(
    initiative_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Book a session for the current user"""
    service = WellnessService(db)
    return service.book_session(initiative_id, current_user.id)


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user wellness sessions"""
    service = WellnessService(db)
    return service.get_user_sessions(current_user.id)


@router.delete("/sessions/{session_id}", status_code=204)
def cancel_booking(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel user's booking"""
    service = WellnessService(db)
    service.cancel_booking(session_id, current_user.id)
