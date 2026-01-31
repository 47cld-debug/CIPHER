from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date
from models.leave import LeaveType, LeaveStatus


class LeaveBase(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None


class LeaveCreateRequest(LeaveBase):
    pass


class LeaveResponse(BaseModel):
    id: int
    user_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    number_of_days: float
    reason: Optional[str] = None
    status: LeaveStatus
    applied_at: date
    approved_at: Optional[date] = None
    approved_by: Optional[int] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class LeaveBalanceResponse(BaseModel):
    id: int
    user_id: int
    leave_type: LeaveType
    total_allocated: float
    used: float
    pending: float
    available: float  # total_allocated - used - pending
    year: int

    class Config:
        from_attributes = True


class LeaveSummaryResponse(BaseModel):
    leaves: List[LeaveResponse]
    balances: List[LeaveBalanceResponse]
    pending_leaves: List[LeaveResponse]
    approved_leaves: List[LeaveResponse]
    rejected_leaves: List[LeaveResponse]
