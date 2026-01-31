from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from app.payroll.schemas import PayrollResponse, PayrollSummaryResponse
from app.payroll.service import PayrollService

router = APIRouter()


@router.get("", response_model=PayrollSummaryResponse)
def get_payroll_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's payroll summary"""
    service = PayrollService(db)
    summary = service.get_payroll_summary(current_user.id)
    return PayrollSummaryResponse(**summary)


@router.get("/payslips", response_model=List[PayrollResponse])
def get_payslips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payslips for user"""
    service = PayrollService(db)
    return service.get_user_payrolls(current_user.id)


@router.get("/payslips/{month}/{year}", response_model=PayrollResponse)
def get_payslip_by_period(
    month: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payslip for specific month and year"""
    service = PayrollService(db)
    payroll = service.get_payroll_by_period(current_user.id, month, year)
    if not payroll:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Payslip not found")
    return payroll
