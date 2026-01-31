from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.leave.schemas import (
    LeaveResponse, LeaveBalanceResponse, LeaveSummaryResponse,
    LeaveCreateRequest
)
from app.leave.service import LeaveService

router = APIRouter()


@router.get("", response_model=LeaveSummaryResponse)
def get_leave_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's leave summary"""
    service = LeaveService(db)
    summary = service.get_leave_summary(current_user.id)
    return LeaveSummaryResponse(**summary)


@router.get("/leaves", response_model=List[LeaveResponse])
def get_leaves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all leaves for user"""
    service = LeaveService(db)
    return service.get_user_leaves(current_user.id)


@router.get("/balances", response_model=List[LeaveBalanceResponse])
def get_leave_balances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leave balances for user"""
    service = LeaveService(db)
    balances = service.get_user_balances(current_user.id)
    # Calculate available for each balance
    result = []
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
        result.append(balance_dict)
    return result


@router.post("/leaves", response_model=LeaveResponse, status_code=201)
def create_leave(
    request: LeaveCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new leave request"""
    service = LeaveService(db)
    leave = service.create_leave(current_user.id, request.model_dump())
    return leave
