from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.compliance.schemas import PolicyResponse, FAQResponse, ReminderResponse
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
