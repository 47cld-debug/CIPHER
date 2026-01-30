from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from models.user import User
from models.learning import ProgressState
from app.learning.schemas import (
    CourseResponse, EnrollmentResponse, ProgressUpdateRequest,
    CertificateUploadResponse, RecommendationResponse
)
from app.learning.service import LearningService

router = APIRouter()


@router.get("/courses", response_model=List[CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 100,
    course_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get course catalog with filtering"""
    service = LearningService(db)
    courses = service.get_courses(skip, limit, course_type, category, search)
    return courses


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get course details"""
    service = LearningService(db)
    course = service.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/courses/{course_id}/enroll", response_model=EnrollmentResponse)
def enroll_in_course(
    course_id: int,
    auto_enrolled: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll user in course"""
    service = LearningService(db)
    enrollment = service.enroll_user(current_user.id, course_id, auto_enrolled=auto_enrolled)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Failed to enroll")
    return enrollment


@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete enrollment (only if auto_enrolled and NOT_STARTED)"""
    service = LearningService(db)
    success = service.delete_enrollment(enrollment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete this enrollment")
    return None


@router.get("/enrollments", response_model=List[EnrollmentResponse])
def get_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's enrollments"""
    service = LearningService(db)
    enrollments = service.get_user_enrollments(current_user.id)
    return enrollments


@router.put("/enrollments/{enrollment_id}/progress", response_model=EnrollmentResponse)
def update_progress(
    enrollment_id: int,
    request: ProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update enrollment progress (event-based)"""
    service = LearningService(db)
    enrollment = service.update_progress(
        enrollment_id,
        current_user.id,
        request.progress_state
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment


@router.post("/enrollments/{enrollment_id}/certificate", response_model=CertificateUploadResponse)
async def upload_certificate(
    enrollment_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload certificate for completed course"""
    service = LearningService(db)
    try:
        certificate = await service.upload_certificate(enrollment_id, current_user.id, file)
        if not certificate:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        return certificate
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-based course recommendations"""
    service = LearningService(db)
    recommendations = await service.get_recommendations(current_user)
    return recommendations
