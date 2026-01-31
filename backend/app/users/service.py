from typing import Optional, List
from sqlalchemy.orm import Session
from models.user import User
from repositories.user_repository import UserRepository


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def get_user_profile(self, user_id: int) -> Optional[User]:
        """Get user profile"""
        return self.user_repo.get(user_id)

    def get_all_users(self) -> List[User]:
        """Get all users (admin only)"""
        return self.user_repo.get_all()