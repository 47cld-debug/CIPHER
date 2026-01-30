from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.schemas import (
    RequestOTPRequest, RequestOTPResponse,
    VerifyOTPRequest, VerifyOTPResponse,
    SelectRoleRequest, SelectRoleResponse
)
from app.auth.service import AuthService

router = APIRouter()


@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(request: RequestOTPRequest, db: Session = Depends(get_db)):
    """Request OTP for employee number"""
    auth_service = AuthService(db)
    success, masked_email = await auth_service.request_otp(request.employee_number)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee number not found"
        )
    
    return RequestOTPResponse(
        message="OTP sent to your email",
        email=masked_email
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP"""
    auth_service = AuthService(db)
    employee_info = auth_service.verify_otp(request.employee_number, request.otp)
    
    if not employee_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP"
        )
    
    return VerifyOTPResponse(
        message="OTP verified successfully",
        has_admin_access=employee_info["has_admin_access"],
        email=employee_info["email"],
        full_name=employee_info["full_name"]
    )


@router.post("/select-role", response_model=SelectRoleResponse)
async def select_role(request: SelectRoleRequest, db: Session = Depends(get_db)):
    """Select role and complete login"""
    auth_service = AuthService(db)
    
    try:
        token, user = auth_service.select_role_and_login(
            request.employee_number,
            request.role
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return SelectRoleResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "employee_number": user.employee_number,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value
        }
    )
