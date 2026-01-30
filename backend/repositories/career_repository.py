from typing import List, Optional
from sqlalchemy.orm import Session
from models.career import Goal, Appraisal, Feedback, CareerProfile
from repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

    def get_by_user(self, user_id: int) -> List[Goal]:
        return self.db.query(Goal).filter(Goal.user_id == user_id).all()


class AppraisalRepository(BaseRepository[Appraisal]):
    def __init__(self, db: Session):
        super().__init__(Appraisal, db)

    def get_by_user(self, user_id: int) -> List[Appraisal]:
        return self.db.query(Appraisal).filter(Appraisal.user_id == user_id).all()


class FeedbackRepository(BaseRepository[Feedback]):
    def __init__(self, db: Session):
        super().__init__(Feedback, db)

    def get_by_user(self, user_id: int) -> List[Feedback]:
        return self.db.query(Feedback).filter(Feedback.user_id == user_id).all()


class CareerProfileRepository(BaseRepository[CareerProfile]):
    def __init__(self, db: Session):
        super().__init__(CareerProfile, db)

    def get_by_user_id(self, user_id: int) -> Optional[CareerProfile]:
        return self.db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
