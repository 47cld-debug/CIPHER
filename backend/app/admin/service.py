from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date
from models.user import User
from models.learning import VerificationStatus, Course, Certificate
from models.leave import Leave, LeaveStatus
from models.payroll import Payroll, PayrollStatus
from repositories.learning_repository import CertificateRepository, CourseRepository
from repositories.leave_repository import LeaveRepository
from repositories.payroll_repository import PayrollRepository


class AdminService:
    def __init__(self, db: Session):
        self.certificate_repo = CertificateRepository(db)
        self.course_repo = CourseRepository(db)
        self.leave_repo = LeaveRepository(db)
        self.payroll_repo = PayrollRepository(db)
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

    # Leave Management Methods
    def get_pending_leaves(self) -> List[Leave]:
        """Get all pending leave requests"""
        from sqlalchemy.orm import joinedload
        return self.db.query(Leave).options(
            joinedload(Leave.user)
        ).filter(
            Leave.status == LeaveStatus.PENDING
        ).order_by(Leave.applied_at.desc()).all()

    def get_all_leaves(self) -> List[Leave]:
        """Get all leave requests"""
        from sqlalchemy.orm import joinedload
        return self.db.query(Leave).options(
            joinedload(Leave.user)
        ).order_by(Leave.applied_at.desc()).all()

    def approve_leave(
        self,
        leave_id: int,
        approved_by: User,
        status: LeaveStatus,
        rejection_reason: Optional[str] = None
    ) -> Optional[Leave]:
        """Approve or reject a leave request"""
        leave = self.leave_repo.get(leave_id)
        if not leave:
            return None
        
        leave.status = status
        leave.approved_by = approved_by.id
        leave.approved_at = date.today()
        if rejection_reason:
            leave.rejection_reason = rejection_reason
        
        # Update leave balance if approved
        if leave.status == LeaveStatus.APPROVED:
            from models.leave import LeaveBalance
            from sqlalchemy import extract
            balance = self.db.query(LeaveBalance).filter(
                LeaveBalance.user_id == leave.user_id,
                LeaveBalance.leave_type == leave.leave_type,
                extract('year', LeaveBalance.year) == leave.start_date.year
            ).first()
            
            if balance:
                balance.used += leave.number_of_days
                balance.pending = max(0, balance.pending - leave.number_of_days)
                self.db.commit()
        
        return self.leave_repo.update(leave)

    # Payroll Management Methods
    def get_all_payrolls(self) -> List[Payroll]:
        """Get all payrolls"""
        from sqlalchemy.orm import joinedload
        return self.db.query(Payroll).options(
            joinedload(Payroll.user)
        ).order_by(Payroll.year.desc(), Payroll.month.desc()).all()

    def create_payroll(self, payroll_data: dict) -> Payroll:
        """Create a new payroll record"""
        # Calculate totals
        total_earnings = (
            payroll_data['basic_salary'] +
            payroll_data.get('house_rent_allowance', 0) +
            payroll_data.get('leave_travel_allowance', 0) +
            payroll_data.get('city_allowance', 0) +
            payroll_data.get('performance_pay', 0) +
            payroll_data.get('night_shift_allowance', 0) +
            payroll_data.get('miscellaneous', 0)
        )
        
        total_deductions = (
            payroll_data.get('provident_fund', 0) +
            payroll_data.get('professional_tax', 0) +
            payroll_data.get('es_is_deduction', 0)
        )
        
        payroll_data['total_earnings'] = total_earnings
        payroll_data['total_deductions'] = total_deductions
        payroll_data['net_salary'] = total_earnings - total_deductions
        payroll_data['generated_at'] = date.today()
        
        payroll = Payroll(**payroll_data)
        return self.payroll_repo.create(payroll)

    def update_payroll(self, payroll_id: int, payroll_data: dict) -> Optional[Payroll]:
        """Update a payroll record"""
        payroll = self.payroll_repo.get(payroll_id)
        if not payroll:
            return None
        
        # Update fields
        for key, value in payroll_data.items():
            if value is not None:
                setattr(payroll, key, value)
        
        # Recalculate totals
        total_earnings = (
            payroll.basic_salary +
            payroll.house_rent_allowance +
            payroll.leave_travel_allowance +
            payroll.city_allowance +
            payroll.performance_pay +
            payroll.night_shift_allowance +
            payroll.miscellaneous
        )
        
        total_deductions = (
            payroll.provident_fund +
            payroll.professional_tax +
            payroll.es_is_deduction
        )
        
        payroll.total_earnings = total_earnings
        payroll.total_deductions = total_deductions
        payroll.net_salary = total_earnings - total_deductions
        
        return self.payroll_repo.update(payroll)

    def delete_payroll(self, payroll_id: int) -> bool:
        """Delete a payroll record"""
        payroll = self.payroll_repo.get(payroll_id)
        if not payroll:
            return False
        
        self.payroll_repo.delete(payroll_id)
        return True
