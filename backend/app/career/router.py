from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.career.schemas import GoalResponse, AppraisalResponse
from app.career.service import CareerService

router = APIRouter()


@router.get("/goals", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user goals"""
    service = CareerService(db)
    return service.get_user_goals(current_user.id)


@router.get("/appraisals", response_model=List[AppraisalResponse])
def get_appraisals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user appraisals"""
    service = CareerService(db)
    return service.get_user_appraisals(current_user.id)
