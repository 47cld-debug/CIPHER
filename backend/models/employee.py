from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class Employee(Base):
    """Dummy company database model"""
    __tablename__ = "employees"

    employee_number = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    has_admin_access = Column(Boolean, default=False, nullable=False)
    department = Column(String, nullable=True)
