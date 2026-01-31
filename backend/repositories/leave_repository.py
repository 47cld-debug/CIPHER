from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date
from models.leave import Leave, LeaveBalance, LeaveType
from repositories.base import BaseRepository


class LeaveRepository(BaseRepository[Leave]):
    def __init__(self, db: Session):
        super().__init__(Leave, db)

    def get_by_user(self, user_id: int) -> List[Leave]:
        """Get all leaves for a user"""
        return self.db.query(Leave).filter(Leave.user_id == user_id).order_by(Leave.start_date.desc()).all()

    def get_by_status(self, user_id: int, status: str) -> List[Leave]:
        """Get leaves by status"""
        return self.db.query(Leave).filter(
            Leave.user_id == user_id,
            Leave.status == status
        ).order_by(Leave.start_date.desc()).all()

    def get_by_type(self, user_id: int, leave_type: LeaveType) -> List[Leave]:
        """Get leaves by type"""
        return self.db.query(Leave).filter(
            Leave.user_id == user_id,
            Leave.leave_type == leave_type
        ).order_by(Leave.start_date.desc()).all()


class LeaveBalanceRepository(BaseRepository[LeaveBalance]):
    def __init__(self, db: Session):
        super().__init__(LeaveBalance, db)

    def get_by_user(self, user_id: int, year: Optional[int] = None) -> List[LeaveBalance]:
        """Get leave balances for a user"""
        query = self.db.query(LeaveBalance).filter(LeaveBalance.user_id == user_id)
        if year:
            query = query.filter(LeaveBalance.year == year)
        return query.all()

    def get_by_user_and_type(self, user_id: int, leave_type: LeaveType, year: int) -> Optional[LeaveBalance]:
        """Get specific leave balance"""
        return self.db.query(LeaveBalance).filter(
            LeaveBalance.user_id == user_id,
            LeaveBalance.leave_type == leave_type,
            LeaveBalance.year == year
        ).first()
