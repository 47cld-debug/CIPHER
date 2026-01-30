from typing import List, Optional
from sqlalchemy.orm import Session
from models.user import User
from models.learning import VerificationStatus, Course, Certificate
from repositories.learning_repository import CertificateRepository, CourseRepository


class AdminService:
    def __init__(self, db: Session):
        self.certificate_repo = CertificateRepository(db)
        self.course_repo = CourseRepository(db)
        self.db = db

    def get_pending_certificates(self) -> List:
        """Get pending certificates for verification"""
        from sqlalchemy.orm import joinedload
        from models.learning import Enrollment
        from models.user import User
        
        certificates = self.db.query(Certificate).options(
            joinedload(Certificate.enrollment).joinedload(Enrollment.course),
            joinedload(Certificate.enrollment).joinedload(Enrollment.user)
        ).filter(
            Certificate.verification_status == VerificationStatus.PENDING
        ).all()
        return certificates

    def verify_certificate(
        self,
        certificate_id: int,
        verification_status: VerificationStatus,
        verified_by: User
    ):
        """Verify certificate"""
        certificate = self.certificate_repo.get(certificate_id)
        if not certificate:
            return None
        
        certificate.verification_status = verification_status
        certificate.verified_by = verified_by.id
        from datetime import datetime
        certificate.verified_at = datetime.utcnow()
        
        return self.certificate_repo.update(certificate)

    def get_all_courses(self) -> List[Course]:
        """Get all courses"""
        return self.course_repo.get_all()

    def create_course(self, course_data: dict) -> Course:
        """Create a new course"""
        course = Course(**course_data)
        return self.course_repo.create(course)

    def update_course(self, course_id: int, course_data: dict) -> Optional[Course]:
        """Update a course"""
        course = self.course_repo.get(course_id)
        if not course:
            return None
        
        for key, value in course_data.items():
            if value is not None:
                setattr(course, key, value)
        
        return self.course_repo.update(course)

    def delete_course(self, course_id: int) -> bool:
        """Delete a course"""
        course = self.course_repo.get(course_id)
        if not course:
            return False
        
        self.course_repo.delete(course_id)
        return True
