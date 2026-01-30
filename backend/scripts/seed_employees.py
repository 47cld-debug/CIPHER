"""
Script to seed dummy employee data for demo purposes
Run this after setting up the database
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.employee import Employee

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Dummy employees
employees = [
    Employee(
        employee_number="EMP001",
        email="employee1@company.com",
        full_name="John Doe",
        has_admin_access=False,
        department="Engineering"
    ),
    Employee(
        employee_number="EMP002",
        email="employee2@company.com",
        full_name="Jane Smith",
        has_admin_access=False,
        department="Marketing"
    ),
    Employee(
        employee_number="EMP003",
        email="employee3@company.com",
        full_name="Bob Johnson",
        has_admin_access=False,
        department="Sales"
    ),
    Employee(
        employee_number="ADMIN001",
        email="admin@company.com",
        full_name="Admin User",
        has_admin_access=True,
        department="HR"
    ),
    Employee(
        employee_number="ADMIN002",
        email="admin2@company.com",
        full_name="Manager User",
        has_admin_access=True,
        department="Operations"
    ),
]

try:
    for emp in employees:
        # Check if employee already exists
        existing = db.query(Employee).filter(
            Employee.employee_number == emp.employee_number
        ).first()
        if not existing:
            db.add(emp)
            print(f"Added employee: {emp.employee_number} - {emp.full_name}")
        else:
            print(f"Employee {emp.employee_number} already exists, skipping...")
    
    db.commit()
    print("\nEmployee seeding completed!")
except Exception as e:
    db.rollback()
    print(f"Error seeding employees: {e}")
finally:
    db.close()
