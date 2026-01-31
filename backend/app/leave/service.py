from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models.leave import Leave, LeaveBalance, LeaveType, LeaveStatus
from repositories.leave_repository import LeaveRepository, LeaveBalanceRepository


class LeaveService:
    def __init__(self, db: Session):
        self.db = db
        self.leave_repo = LeaveRepository(db)
        self.balance_repo = LeaveBalanceRepository(db)

    def get_user_leaves(self, user_id: int) -> List[Leave]:
        """Get all leaves for user"""
        return self.leave_repo.get_by_user(user_id)

    def get_user_balances(self, user_id: int, year: Optional[int] = None) -> List[LeaveBalance]:
        """Get leave balances for user"""
        if not year:
            year = date.today().year
        return self.balance_repo.get_by_user(user_id, year)

    def get_leave_summary(self, user_id: int) -> dict:
        """Get complete leave summary"""
        leaves = self.get_user_leaves(user_id)
        balances = self.get_user_balances(user_id)
        
        # Calculate available balance for each type
        balances_with_available = []
        for balance in balances:
            available = balance.total_allocated - balance.used - balance.pending
            balance_dict = {
                "id": balance.id,
                "user_id": balance.user_id,
                "leave_type": balance.leave_type,
                "total_allocated": balance.total_allocated,
                "used": balance.used,
                "pending": balance.pending,
                "available": max(0, available),
                "year": balance.year
            }
            balances_with_available.append(balance_dict)
        
        return {
            "leaves": leaves,
            "balances": balances_with_available,
            "pending_leaves": [l for l in leaves if l.status == LeaveStatus.PENDING],
            "approved_leaves": [l for l in leaves if l.status == LeaveStatus.APPROVED],
            "rejected_leaves": [l for l in leaves if l.status == LeaveStatus.REJECTED],
        }

    def create_leave(self, user_id: int, leave_data: dict) -> Leave:
        """Create a new leave request"""
        start_date = leave_data["start_date"]
        end_date = leave_data["end_date"]
        
        # Calculate number of days
        delta = end_date - start_date
        number_of_days = delta.days + 1  # Include both start and end dates
        
        leave = Leave(
            user_id=user_id,
            leave_type=leave_data["leave_type"],
            start_date=start_date,
            end_date=end_date,
            number_of_days=number_of_days,
            reason=leave_data.get("reason"),
            status=LeaveStatus.PENDING
        )
        
        return self.leave_repo.create(leave)
