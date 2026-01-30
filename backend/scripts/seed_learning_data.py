"""
Seed learning module data: courses, enrollments, and employee roles
Run: python -m scripts.seed_learning_data
"""
import sys
from pathlib import Path
from datetime import datetime

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.employee import Employee
from models.user import User
from models.learning import Course, Enrollment, CourseType, ProgressState, EnrollmentStatus

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_employee_roles():
    """Update employees with roles"""
    employees_roles = {
        "EMP001": "developer",
        "EMP002": "tester",
        "EMP003": "manager",
        "ADMIN001": "admin",
        "ADMIN002": "manager",
    }
    
    for emp_num, role in employees_roles.items():
        emp = db.query(Employee).filter(Employee.employee_number == emp_num).first()
        if emp:
            emp.role = role
            print(f"✓ Updated {emp_num} with role: {role}")
    
    db.commit()

def seed_courses():
    """Seed courses (INTERNAL and EXTERNAL)"""
    courses_data = [
        # INTERNAL courses
        {
            "title": "Introduction to Python",
            "description": "Learn Python programming fundamentals",
            "category": "Technical",
            "skill_level": "Beginner",
            "duration": 10.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "Advanced Python Development",
            "description": "Deep dive into Python advanced topics",
            "category": "Technical",
            "skill_level": "Advanced",
            "duration": 20.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "JavaScript Fundamentals",
            "description": "Master JavaScript basics and ES6+ features",
            "category": "Technical",
            "skill_level": "Beginner",
            "duration": 15.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "React.js Complete Guide",
            "description": "Build modern web applications with React",
            "category": "Technical",
            "skill_level": "Intermediate",
            "duration": 25.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "Leadership Essentials",
            "description": "Develop core leadership skills",
            "category": "Leadership",
            "skill_level": "Intermediate",
            "duration": 12.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "Communication Skills",
            "description": "Improve your professional communication",
            "category": "Soft Skills",
            "skill_level": "Beginner",
            "duration": 8.0,
            "course_type": CourseType.INTERNAL,
        },
        {
            "title": "Testing Fundamentals",
            "description": "Learn software testing principles and practices",
            "category": "Technical",
            "skill_level": "Beginner",
            "duration": 12.0,
            "course_type": CourseType.INTERNAL,
        },
        # EXTERNAL courses
        {
            "title": "Python for Data Science",
            "description": "Comprehensive Python data science course",
            "category": "Technical",
            "skill_level": "Intermediate",
            "duration": 15.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "LinkedIn Learning",
            "external_url": "https://www.linkedin.com/learning/python-for-data-science",
        },
        {
            "title": "Salesforce Administration",
            "description": "Learn Salesforce administration basics",
            "category": "Technical",
            "skill_level": "Beginner",
            "duration": 20.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "LinkedIn Learning",
            "external_url": "https://www.linkedin.com/learning/salesforce-administration",
        },
        {
            "title": "Advanced Testing Strategies",
            "description": "Advanced software testing techniques",
            "category": "Technical",
            "skill_level": "Advanced",
            "duration": 15.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "LinkedIn Learning",
            "external_url": "https://www.linkedin.com/learning/advanced-testing-strategies",
        },
        {
            "title": "Salesforce Development",
            "description": "Advanced Salesforce development course",
            "category": "Technical",
            "skill_level": "Advanced",
            "duration": 25.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "LinkedIn Learning",
            "external_url": "https://www.linkedin.com/learning/salesforce-development",
        },
    ]
    
    created_courses = []
    for course_data in courses_data:
        existing = db.query(Course).filter(Course.title == course_data["title"]).first()
        if not existing:
            course = Course(**course_data)
            db.add(course)
            created_courses.append(course)
            print(f"✓ Created course: {course_data['title']}")
        else:
            created_courses.append(existing)
    
    db.commit()
    return created_courses

def seed_enrollments():
    """Seed sample enrollments for testing"""
    # Get users
    emp001 = db.query(User).filter(User.employee_number == "EMP001").first()
    emp002 = db.query(User).filter(User.employee_number == "EMP002").first()
    
    if not emp001 or not emp002:
        print("⚠ Users not found. Please create users first by logging in.")
        return
    
    # Get courses
    python_intro = db.query(Course).filter(Course.title == "Introduction to Python").first()
    js_fundamentals = db.query(Course).filter(Course.title == "JavaScript Fundamentals").first()
    react_guide = db.query(Course).filter(Course.title == "React.js Complete Guide").first()
    testing_fund = db.query(Course).filter(Course.title == "Testing Fundamentals").first()
    advanced_testing = db.query(Course).filter(Course.title == "Advanced Testing Strategies").first()
    
    enrollments_data = [
        # EMP001 (developer) - Technical courses
        {"user": emp001, "course": python_intro, "progress": ProgressState.HIGH, "auto_enrolled": False},
        {"user": emp001, "course": js_fundamentals, "progress": ProgressState.MEDIUM, "auto_enrolled": False},
        {"user": emp001, "course": react_guide, "progress": ProgressState.LOW, "auto_enrolled": False},
        # EMP002 (tester) - Testing courses
        {"user": emp002, "course": testing_fund, "progress": ProgressState.HIGH, "auto_enrolled": False},
        {"user": emp002, "course": advanced_testing, "progress": ProgressState.MEDIUM, "auto_enrolled": False},
    ]
    
    for enr_data in enrollments_data:
        if not enr_data["user"] or not enr_data["course"]:
            continue
        
        existing = db.query(Enrollment).filter(
            Enrollment.user_id == enr_data["user"].id,
            Enrollment.course_id == enr_data["course"].id
        ).first()
        
        if not existing:
            enrollment = Enrollment(
                user_id=enr_data["user"].id,
                course_id=enr_data["course"].id,
                status=EnrollmentStatus.ENROLLED,
                progress_state=enr_data["progress"],
                auto_enrolled=enr_data["auto_enrolled"]
            )
            db.add(enrollment)
            print(f"✓ Created enrollment: {enr_data['user'].full_name} -> {enr_data['course'].title}")
    
    # Create one completed course for EMP001
    if python_intro:
        completed_enr = db.query(Enrollment).filter(
            Enrollment.user_id == emp001.id,
            Enrollment.course_id == python_intro.id
        ).first()
        
        if completed_enr:
            completed_enr.progress_state = ProgressState.COMPLETED
            completed_enr.status = EnrollmentStatus.COMPLETED
            print(f"✓ Updated enrollment to COMPLETED: {emp001.full_name} -> {python_intro.title}")
    
    db.commit()

if __name__ == "__main__":
    try:
        print("Seeding Learning Module Data...")
        print("\n1. Updating employee roles...")
        seed_employee_roles()
        
        print("\n2. Seeding courses...")
        seed_courses()
        
        print("\n3. Seeding enrollments...")
        seed_enrollments()
        
        print("\n✅ Learning module data seeding completed!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
