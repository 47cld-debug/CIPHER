from pydantic import BaseModel, field_validator, field_serializer
from typing import List, Optional, Union
from datetime import datetime, date
from models.learning import VerificationStatus, CourseType
from models.leave import LeaveStatus
from models.payroll import PayrollStatus


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


# Leave Management Schemas
class LeaveUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    employee_number: str

    class Config:
        from_attributes = True


class LeaveResponse(BaseModel):
    id: int
    user_id: int
    leave_type: str
    start_date: date
    end_date: date
    number_of_days: float
    reason: Optional[str] = None
    status: LeaveStatus
    applied_at: date
    approved_at: Optional[date] = None
    approved_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    user: Optional[LeaveUserResponse] = None

    class Config:
        from_attributes = True


class LeaveApprovalRequest(BaseModel):
    status: LeaveStatus
    rejection_reason: Optional[str] = None


# Payroll Management Schemas
class PayrollUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    employee_number: str

    class Config:
        from_attributes = True


class PayrollCreateRequest(BaseModel):
    user_id: int
    month: int
    year: int
    pay_period_start: date
    pay_period_end: date
    basic_salary: float
    house_rent_allowance: float = 0
    leave_travel_allowance: float = 0
    city_allowance: float = 0
    performance_pay: float = 0
    night_shift_allowance: float = 0
    miscellaneous: float = 0
    provident_fund: float = 0
    professional_tax: float = 0
    es_is_deduction: float = 0
    status: PayrollStatus = PayrollStatus.PROCESSED


class PayrollUpdateRequest(BaseModel):
    month: Optional[int] = None
    year: Optional[int] = None
    pay_period_start: Optional[date] = None
    pay_period_end: Optional[date] = None
    basic_salary: Optional[float] = None
    house_rent_allowance: Optional[float] = None
    leave_travel_allowance: Optional[float] = None
    city_allowance: Optional[float] = None
    performance_pay: Optional[float] = None
    night_shift_allowance: Optional[float] = None
    miscellaneous: Optional[float] = None
    provident_fund: Optional[float] = None
    professional_tax: Optional[float] = None
    es_is_deduction: Optional[float] = None
    status: Optional[PayrollStatus] = None


class PayrollResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    pay_period_start: date
    pay_period_end: date
    basic_salary: float
    house_rent_allowance: float
    leave_travel_allowance: float
    city_allowance: float
    performance_pay: float
    night_shift_allowance: float
    miscellaneous: float
    provident_fund: float
    professional_tax: float
    es_is_deduction: float
    total_earnings: float
    total_deductions: float
    net_salary: float
    status: PayrollStatus
    generated_at: date
    file_url: Optional[str] = None
    user: Optional[PayrollUserResponse] = None

    class Config:
        from_attributes = True
