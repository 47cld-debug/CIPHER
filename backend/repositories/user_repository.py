from typing import Optional, List
from sqlalchemy.orm import Session
from models.user import User
from repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_employee_number(self, employee_number: str) -> Optional[User]:
        return self.db.query(User).filter(User.employee_number == employee_number).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self) -> List[User]:
        """Get all users"""
        return self.db.query(User).all()

    def create_or_update(self, employee_number: str, email: str, full_name: str, role: str) -> User:
        user = self.get_by_employee_number(employee_number)
        if user:
            user.email = email
            user.full_name = full_name
            user.role = role
            return self.update(user)
        else:
            user = User(
                employee_number=employee_number,
                email=email,
                full_name=full_name,
                role=role
            )
            return self.create(user)
