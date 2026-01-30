from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_admin_user
from models.user import User
from app.admin.schemas import (
    CertificateVerificationRequest, CertificateVerificationResponse,
    CourseCreateRequest, CourseUpdateRequest, CourseResponse
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
    course = service.create_course(request.dict())
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
    course_data = {k: v for k, v in request.dict().items() if v is not None}
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
