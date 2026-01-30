from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from sqlalchemy.orm import Session
from app.config import settings
from services.otp_service import otp_service
from services.email_service import email_service
from services.employee_service import EmployeeService
from repositories.user_repository import UserRepository
from models.user import User, UserRole


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.employee_service = EmployeeService(db)
        self.user_repo = UserRepository(db)

    async def request_otp(self, employee_number: str) -> tuple[bool, Optional[str]]:
        """Request OTP for employee number"""
        employee = self.employee_service.get_employee(employee_number)
        if not employee:
            return False, None

        otp = otp_service.generate_otp()
        otp_service.store_otp(employee_number, otp)
        
        await email_service.send_otp_email(employee.email, otp)
        
        # Return masked email
        email_parts = employee.email.split("@")
        masked_email = f"{email_parts[0][:2]}***@{email_parts[1]}"
        return True, masked_email

    def verify_otp(self, employee_number: str, otp: str) -> Optional[dict]:
        """Verify OTP and return employee info"""
        if not otp_service.verify_otp(employee_number, otp):
            return None

        employee = self.employee_service.get_employee(employee_number)
        if not employee:
            return None

        return {
            "has_admin_access": employee.has_admin_access,
            "email": employee.email,
            "full_name": employee.full_name
        }

    def create_access_token(self, employee_number: str, role: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": employee_number,
            "role": role,
            "exp": expire
        }
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    def select_role_and_login(self, employee_number: str, role: str) -> tuple[str, User]:
        """Select role, create/update user, and return token"""
        employee = self.employee_service.get_employee(employee_number)
        if not employee:
            raise ValueError("Employee not found")

        # Validate role selection
        if role == "ADMIN" and not employee.has_admin_access:
            raise ValueError("User does not have admin access")

        user_role = UserRole.ADMIN if role == "ADMIN" else UserRole.EMPLOYEE
        
        # Create or update user
        user = self.user_repo.create_or_update(
            employee_number=employee_number,
            email=employee.email,
            full_name=employee.full_name,
            role=user_role.value
        )
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.user_repo.update(user)

        # Generate token
        token = self.create_access_token(employee_number, role)
        
        return token, user
