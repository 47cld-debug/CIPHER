from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.users.schemas import UserResponse
from app.users.service import UserService

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    service = UserService(db)
    user = service.get_user_profile(current_user.id)
    return user
