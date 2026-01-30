from typing import Optional
from sqlalchemy.orm import Session
from models.employee import Employee
from repositories.employee_repository import EmployeeRepository


class EmployeeService:
    def __init__(self, db: Session):
        self.employee_repo = EmployeeRepository(db)

    def get_employee(self, employee_number: str) -> Optional[Employee]:
        """Get employee from company database"""
        return self.employee_repo.get_by_employee_number(employee_number)

    def employee_exists(self, employee_number: str) -> bool:
        """Check if employee exists"""
        return self.get_employee(employee_number) is not None
