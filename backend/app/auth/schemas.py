from pydantic import BaseModel, EmailStr
from typing import Optional


class RequestOTPRequest(BaseModel):
    employee_number: str


class RequestOTPResponse(BaseModel):
    message: str
    email: str  # Masked email for confirmation


class VerifyOTPRequest(BaseModel):
    employee_number: str
    otp: str


class VerifyOTPResponse(BaseModel):
    message: str
    has_admin_access: bool
    email: str
    full_name: str


class SelectRoleRequest(BaseModel):
    employee_number: str
    role: str  # "ADMIN" or "USER"


class SelectRoleResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
