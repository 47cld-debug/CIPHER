from pydantic import BaseModel, field_validator, field_serializer
from typing import List, Optional, Union
from datetime import datetime
from models.learning import VerificationStatus, CourseType


class CertificateVerificationRequest(BaseModel):
    verification_status: VerificationStatus


class EnrollmentUserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class EnrollmentCourseResponse(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class EnrollmentResponse(BaseModel):
    id: int
    course: EnrollmentCourseResponse
    user: EnrollmentUserResponse

    class Config:
        from_attributes = True


class CertificateVerificationResponse(BaseModel):
    id: int
    enrollment_id: int
    file_url: str
    verification_status: VerificationStatus
    uploaded_at: Union[datetime, str]
    verified_at: Optional[Union[datetime, str]] = None
    verified_by: Optional[int] = None
    enrollment: Optional[EnrollmentResponse] = None

    @field_validator('uploaded_at', 'verified_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True


class CourseCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: Optional[str] = None
    duration: Optional[float] = None
    course_type: CourseType
    provider_name: Optional[str] = None
    external_url: Optional[str] = None


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: Optional[str] = None
    duration: Optional[float] = None
    course_type: Optional[CourseType] = None
    provider_name: Optional[str] = None
    external_url: Optional[str] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: Optional[str] = None
    duration: Optional[float] = None
    course_type: CourseType
    provider_name: Optional[str] = None
    external_url: Optional[str] = None
    created_at: Union[datetime, str]

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True
