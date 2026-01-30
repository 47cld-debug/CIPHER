from typing import List
from sqlalchemy.orm import Session
from repositories.career_repository import GoalRepository, AppraisalRepository


class CareerService:
    def __init__(self, db: Session):
        self.goal_repo = GoalRepository(db)
        self.appraisal_repo = AppraisalRepository(db)

    def get_user_goals(self, user_id: int) -> List:
        """Get user goals"""
        return self.goal_repo.get_by_user(user_id)

    def get_user_appraisals(self, user_id: int) -> List:
        """Get user appraisals"""
        return self.appraisal_repo.get_by_user(user_id)
