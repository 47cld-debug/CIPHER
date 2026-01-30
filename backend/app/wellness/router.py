from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.wellness.schemas import InitiativeResponse, SessionResponse
from app.wellness.service import WellnessService

router = APIRouter()


@router.get("/initiatives", response_model=List[InitiativeResponse])
def get_initiatives(db: Session = Depends(get_db)):
    """Get wellness initiatives"""
    service = WellnessService(db)
    return service.get_initiatives()


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user wellness sessions"""
    service = WellnessService(db)
    return service.get_user_sessions(current_user.id)
