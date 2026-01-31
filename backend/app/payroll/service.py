from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date
from models.payroll import Payroll
from repositories.payroll_repository import PayrollRepository


class PayrollService:
    def __init__(self, db: Session):
        self.db = db
        self.payroll_repo = PayrollRepository(db)

    def get_user_payrolls(self, user_id: int) -> List[Payroll]:
        """Get all payrolls for user"""
        return self.payroll_repo.get_by_user(user_id)

    def get_payroll_summary(self, user_id: int) -> dict:
        """Get payroll summary with YTD calculations"""
        payrolls = self.get_user_payrolls(user_id)
        latest = self.payroll_repo.get_latest(user_id)
        
        current_year = date.today().year
        ytd_payrolls = [p for p in payrolls if p.year == current_year]
        
        total_earnings_ytd = sum(p.total_earnings for p in ytd_payrolls)
        total_deductions_ytd = sum(p.total_deductions for p in ytd_payrolls)
        net_salary_ytd = sum(p.net_salary for p in ytd_payrolls)
        
        return {
            "payrolls": payrolls,
            "latest_payroll": latest,
            "total_earnings_ytd": total_earnings_ytd,
            "total_deductions_ytd": total_deductions_ytd,
            "net_salary_ytd": net_salary_ytd,
        }

    def get_payroll_by_period(self, user_id: int, month: int, year: int) -> Optional[Payroll]:
        """Get payroll for specific month and year"""
        return self.payroll_repo.get_by_period(user_id, month, year)
