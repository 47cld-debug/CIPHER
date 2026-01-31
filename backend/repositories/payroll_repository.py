from typing import List, Optional
from sqlalchemy.orm import Session
from models.payroll import Payroll
from repositories.base import BaseRepository


class PayrollRepository(BaseRepository[Payroll]):
    def __init__(self, db: Session):
        super().__init__(Payroll, db)

    def get_by_user(self, user_id: int) -> List[Payroll]:
        """Get all payrolls for a user"""
        return self.db.query(Payroll).filter(
            Payroll.user_id == user_id
        ).order_by(Payroll.year.desc(), Payroll.month.desc()).all()

    def get_by_period(self, user_id: int, month: int, year: int) -> Optional[Payroll]:
        """Get payroll for specific month and year"""
        return self.db.query(Payroll).filter(
            Payroll.user_id == user_id,
            Payroll.month == month,
            Payroll.year == year
        ).first()

    def get_latest(self, user_id: int) -> Optional[Payroll]:
        """Get latest payroll for user"""
        return self.db.query(Payroll).filter(
            Payroll.user_id == user_id
        ).order_by(Payroll.year.desc(), Payroll.month.desc()).first()
