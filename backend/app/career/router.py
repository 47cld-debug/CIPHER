from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.career.schemas import (
    GoalResponse,
    AppraisalResponse,
    CareerSummaryResponse,
    SkillResponse,
    AchievementItem,
)
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


@router.get("/summary", response_model=CareerSummaryResponse)
def get_career_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get career path and metrics for dashboard"""
    service = CareerService(db)
    return service.get_career_summary(current_user.id)


@router.get("/skills", response_model=List[SkillResponse])
def get_career_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skills from completed courses"""
    service = CareerService(db)
    return service.get_user_skills(current_user.id)


@router.get("/achievements", response_model=List[AchievementItem])
def get_career_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get achievements (completed goals + completed courses)"""
    service = CareerService(db)
    return service.get_user_achievements(current_user.id)
