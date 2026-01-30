import secrets
import time
from typing import Optional, Dict
from app.config import settings

# In-memory OTP storage (for demo - use Redis in production)
_otp_storage: Dict[str, Dict] = {}


class OTPService:
    def __init__(self):
        self.expiration_minutes = settings.OTP_EXPIRATION_MINUTES

    def generate_otp(self) -> str:
        """Generate 6-digit OTP"""
        return f"{secrets.randbelow(1000000):06d}"

    def store_otp(self, employee_number: str, otp: str) -> None:
        """Store OTP with expiration"""
        expires_at = time.time() + (self.expiration_minutes * 60)
        _otp_storage[employee_number] = {
            "otp": otp,
            "expires_at": expires_at
        }

    def verify_otp(self, employee_number: str, otp: str) -> bool:
        """Verify OTP"""
        stored = _otp_storage.get(employee_number)
        if not stored:
            return False
        
        if time.time() > stored["expires_at"]:
            # Expired - remove from storage
            _otp_storage.pop(employee_number, None)
            return False
        
        if stored["otp"] == otp:
            # Valid - remove from storage
            _otp_storage.pop(employee_number, None)
            return True
        
        return False

    def clear_otp(self, employee_number: str) -> None:
        """Clear OTP for employee"""
        _otp_storage.pop(employee_number, None)


otp_service = OTPService()
