from typing import List
from sqlalchemy.orm import Session
from repositories.wellness_repository import InitiativeRepository, SessionRepository


class WellnessService:
    def __init__(self, db: Session):
        self.initiative_repo = InitiativeRepository(db)
        self.session_repo = SessionRepository(db)

    def get_initiatives(self) -> List:
        """Get wellness initiatives"""
        return self.initiative_repo.get_all()

    def get_user_sessions(self, user_id: int) -> List:
        """Get user wellness sessions"""
        return self.session_repo.get_by_user(user_id)
