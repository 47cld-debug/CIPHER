from typing import Optional
from sqlalchemy.orm import Session
from models.employee import Employee
from repositories.base import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self, db: Session):
        super().__init__(Employee, db)

    def get_by_employee_number(self, employee_number: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.employee_number == employee_number).first()
