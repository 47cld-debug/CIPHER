from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.learning import CourseType, ProgressState, EnrollmentStatus, VerificationStatus


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: Optional[str] = None
    duration: Optional[float] = None
    course_type: CourseType
    provider_name: Optional[str] = None
    external_url: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    course_id: int


class CertificateUploadResponse(BaseModel):
    id: int
    enrollment_id: int
    file_url: str
    verification_status: VerificationStatus
    uploaded_at: datetime

    class Config:
        from_attributes = True


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: EnrollmentStatus
    progress_state: ProgressState
    auto_enrolled: bool = False
    enrolled_at: datetime
    updated_at: Optional[datetime] = None
    course: CourseResponse
    certificate: Optional[CertificateUploadResponse] = None

    class Config:
        from_attributes = True


class ProgressUpdateRequest(BaseModel):
    progress_state: ProgressState


class RecommendationResponse(BaseModel):
    title: str
    description: str
