from typing import List
from sqlalchemy.orm import Session
from models.dashboard import Widget, UserWidget
from repositories.base import BaseRepository


class WidgetRepository(BaseRepository[Widget]):
    def __init__(self, db: Session):
        super().__init__(Widget, db)


class UserWidgetRepository(BaseRepository[UserWidget]):
    def __init__(self, db: Session):
        super().__init__(UserWidget, db)

    def get_by_user(self, user_id: int) -> List[UserWidget]:
        return self.db.query(UserWidget).filter(
            UserWidget.user_id == user_id,
            UserWidget.enabled == True
        ).order_by(UserWidget.position).all()
