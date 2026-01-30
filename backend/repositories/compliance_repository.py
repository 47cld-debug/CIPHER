from typing import List
from sqlalchemy.orm import Session
from models.compliance import Policy, FAQ, Reminder
from repositories.base import BaseRepository


class PolicyRepository(BaseRepository[Policy]):
    def __init__(self, db: Session):
        super().__init__(Policy, db)

    def search(self, query: str) -> List[Policy]:
        return self.db.query(Policy).filter(
            Policy.title.ilike(f"%{query}%")
        ).all()


class FAQRepository(BaseRepository[FAQ]):
    def __init__(self, db: Session):
        super().__init__(FAQ, db)

    def get_by_category(self, category: str) -> List[FAQ]:
        return self.db.query(FAQ).filter(FAQ.category == category).all()


class ReminderRepository(BaseRepository[Reminder]):
    def __init__(self, db: Session):
        super().__init__(Reminder, db)

    def get_by_user(self, user_id: int) -> List[Reminder]:
        return self.db.query(Reminder).filter(
            Reminder.user_id == user_id,
            Reminder.completed == False
        ).all()
