from typing import List
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from models.wellness import Initiative, Session as WellnessSession
from repositories.base import BaseRepository


class InitiativeRepository(BaseRepository[Initiative]):
    def __init__(self, db: DBSession):
        super().__init__(Initiative, db)


class SessionRepository(BaseRepository[WellnessSession]):
    def __init__(self, db: DBSession):
        super().__init__(WellnessSession, db)

    def get_by_user(self, user_id: int) -> List[WellnessSession]:
        return self.db.query(WellnessSession).filter(WellnessSession.user_id == user_id).all()

    def count_by_initiative(self, initiative_id: int) -> int:
        return self.db.query(func.count(WellnessSession.id)).filter(
            WellnessSession.initiative_id == initiative_id
        ).scalar() or 0

    def exists_for_user(self, initiative_id: int, user_id: int) -> bool:
        return self.db.query(WellnessSession).filter(
            WellnessSession.initiative_id == initiative_id,
            WellnessSession.user_id == user_id
        ).first() is not None

    def delete_by_id_and_user(self, session_id: int, user_id: int) -> bool:
        obj = self.db.query(WellnessSession).filter(
            WellnessSession.id == session_id,
            WellnessSession.user_id == user_id
        ).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False
