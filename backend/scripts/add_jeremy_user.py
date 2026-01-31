"""
Script to add Jeremy Joseph user for demo purposes
Run this to create the user: python scripts/add_jeremy_user.py
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

# Jeremy Joseph employee
jeremy_employee = Employee(
    employee_number="JEREMY001",
    email="jeremyj2030@gmail.com",
    full_name="Jeremy Joseph",
    has_admin_access=True,  # Give admin access for demo
    department="Engineering",
    role="developer"
)

try:
    # Check if employee already exists
    existing = db.query(Employee).filter(
        Employee.employee_number == jeremy_employee.employee_number
    ).first()
    
    if existing:
        # Update existing employee
        existing.email = jeremy_employee.email
        existing.full_name = jeremy_employee.full_name
        existing.has_admin_access = jeremy_employee.has_admin_access
        existing.department = jeremy_employee.department
        existing.role = jeremy_employee.role
        print(f"Updated employee: {jeremy_employee.employee_number} - {jeremy_employee.full_name}")
        print(f"Email: {jeremy_employee.email}")
    else:
        # Add new employee
        db.add(jeremy_employee)
        print(f"Added employee: {jeremy_employee.employee_number} - {jeremy_employee.full_name}")
        print(f"Email: {jeremy_employee.email}")
    
    db.commit()
    print("\n[SUCCESS] Jeremy Joseph user created/updated successfully!")
    print(f"\nLogin Details:")
    print(f"  Employee Number: {jeremy_employee.employee_number}")
    print(f"  Email: {jeremy_employee.email}")
    print(f"  Admin Access: {jeremy_employee.has_admin_access}")
    print("\nYou can now login with employee number: JEREMY001")
except Exception as e:
    db.rollback()
    print(f"Error creating user: {e}")
    raise
finally:
    db.close()
