from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_admin_user
from models.user import User
from models.leave import LeaveStatus
from app.users.schemas import UserResponse
from app.admin.schemas import (
    CertificateVerificationRequest, CertificateVerificationResponse,
    CourseCreateRequest, CourseUpdateRequest, CourseResponse,
    LeaveResponse, LeaveApprovalRequest,
    PayrollResponse, PayrollCreateRequest, PayrollUpdateRequest
)
from app.admin.service import AdminService

router = APIRouter()


@router.get("/certificates/pending", response_model=List[CertificateVerificationResponse])
def get_pending_certificates(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get pending certificates for verification"""
    service = AdminService(db)
    return service.get_pending_certificates()


@router.put("/certificates/{certificate_id}/verify", response_model=CertificateVerificationResponse)
def verify_certificate(
    certificate_id: int,
    request: CertificateVerificationRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Verify certificate"""
    service = AdminService(db)
    certificate = service.verify_certificate(
        certificate_id,
        request.verification_status,
        current_user
    )
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate


@router.get("/courses", response_model=List[CourseResponse])
def get_all_courses(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all courses"""
    service = AdminService(db)
    return service.get_all_courses()


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    request: CourseCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new course"""
    service = AdminService(db)
    course = service.create_course(request.model_dump(exclude_unset=True))
    return course


@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    request: CourseUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a course"""
    service = AdminService(db)
    course_data = request.model_dump(exclude_unset=True)
    course = service.update_course(course_id, course_data)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a course"""
    service = AdminService(db)
    success = service.delete_course(course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return None


# Leave Management Endpoints
@router.get("/leaves/pending", response_model=List[LeaveResponse])
def get_pending_leaves(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all pending leave requests"""
    service = AdminService(db)
    return service.get_pending_leaves()


@router.get("/leaves", response_model=List[LeaveResponse])
def get_all_leaves(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all leave requests"""
    service = AdminService(db)
    return service.get_all_leaves()


@router.put("/leaves/{leave_id}/approve", response_model=LeaveResponse)
def approve_leave(
    leave_id: int,
    request: LeaveApprovalRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a leave request"""
    service = AdminService(db)
    leave = service.approve_leave(
        leave_id,
        current_user,
        request.status,
        request.rejection_reason if request.status == LeaveStatus.REJECTED else None
    )
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return leave


# Payroll Management Endpoints
@router.get("/payrolls", response_model=List[PayrollResponse])
def get_all_payrolls(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all payrolls"""
    service = AdminService(db)
    return service.get_all_payrolls()


@router.post("/payrolls", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_payroll(
    request: PayrollCreateRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new payroll record"""
    service = AdminService(db)
    payroll = service.create_payroll(request.model_dump())
    return payroll


@router.put("/payrolls/{payroll_id}", response_model=PayrollResponse)
def update_payroll(
    payroll_id: int,
    request: PayrollUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a payroll record"""
    service = AdminService(db)
    payroll_data = request.model_dump(exclude_unset=True)
    payroll = service.update_payroll(payroll_id, payroll_data)
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return payroll


@router.delete("/payrolls/{payroll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payroll(
    payroll_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a payroll record"""
    service = AdminService(db)
    success = service.delete_payroll(payroll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return None


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    from app.users.service import UserService
    service = UserService(db)
    return service.get_all_users()
