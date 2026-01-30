from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.dashboard.schemas import DashboardResponse
from app.dashboard.service import DashboardService

router = APIRouter()


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user dashboard data"""
    service = DashboardService(db)
    widgets = service.get_user_widgets(current_user.id)
    return DashboardResponse(widgets=widgets)
