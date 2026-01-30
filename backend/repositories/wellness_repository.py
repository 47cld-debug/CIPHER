from typing import List
from sqlalchemy.orm import Session
from models.wellness import Initiative, Session
from repositories.base import BaseRepository


class InitiativeRepository(BaseRepository[Initiative]):
    def __init__(self, db: Session):
        super().__init__(Initiative, db)


class SessionRepository(BaseRepository[Session]):
    def __init__(self, db: Session):
        super().__init__(Session, db)

    def get_by_user(self, user_id: int) -> List[Session]:
        return self.db.query(Session).filter(Session.user_id == user_id).all()
