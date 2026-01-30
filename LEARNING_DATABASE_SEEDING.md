# Learning Module Database Seeding Guide

This guide provides SQL scripts and Python instructions to seed the database with test data for the Learning module.

## Prerequisites

1. **Run Database Migrations First:**
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Ensure you have the new columns:**
   - `employees.role` column
   - `enrollments.auto_enrolled` column

## Option 1: Using Python Seed Script (Recommended)

### Step 1: Update Employee Roles

Update existing employees with roles for role-based recommendations:

```python
# Run this in Python or add to seed_employees.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.employee import Employee

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Update employees with roles
employees_to_update = [
    ("EMP001", "developer"),
    ("EMP002", "tester"),
    ("EMP003", "manager"),
    ("ADMIN001", "admin"),
    ("ADMIN002", "manager"),
]

for emp_num, role in employees_to_update:
    emp = db.query(Employee).filter(Employee.employee_number == emp_num).first()
    if emp:
        emp.role = role
        print(f"Updated {emp_num} with role: {role}")

db.commit()
db.close()
```

### Step 2: Seed Courses

Run this SQL script or add to your seed script:

```sql
-- Insert INTERNAL courses
INSERT INTO courses (title, description, category, skill_level, duration, course_type, created_at)
VALUES
    ('Introduction to Python', 'Learn Python programming fundamentals', 'Technical', 'Beginner', 10.0, 'INTERNAL', NOW()),
    ('Advanced Python Development', 'Deep dive into Python advanced topics', 'Technical', 'Advanced', 20.0, 'INTERNAL', NOW()),
    ('JavaScript Fundamentals', 'Master JavaScript basics and ES6+ features', 'Technical', 'Beginner', 15.0, 'INTERNAL', NOW()),
    ('React.js Complete Guide', 'Build modern web applications with React', 'Technical', 'Intermediate', 25.0, 'INTERNAL', NOW()),
    ('Leadership Essentials', 'Develop core leadership skills', 'Leadership', 'Intermediate', 12.0, 'INTERNAL', NOW()),
    ('Communication Skills', 'Improve your professional communication', 'Soft Skills', 'Beginner', 8.0, 'INTERNAL', NOW()),
    ('Project Management Basics', 'Learn project management fundamentals', 'Leadership', 'Beginner', 10.0, 'INTERNAL', NOW()),
    ('Data Science with Python', 'Introduction to data science and analytics', 'Technical', 'Intermediate', 30.0, 'INTERNAL', NOW()),
    ('Testing Fundamentals', 'Learn software testing principles and practices', 'Technical', 'Beginner', 12.0, 'INTERNAL', NOW()),
    ('Agile Methodology', 'Master Agile and Scrum frameworks', 'Leadership', 'Intermediate', 10.0, 'INTERNAL', NOW())
ON CONFLICT DO NOTHING;

-- Insert EXTERNAL courses (LinkedIn Learning style)
INSERT INTO courses (title, description, category, skill_level, duration, course_type, provider_name, external_url, created_at)
VALUES
    ('Python for Data Science', 'Comprehensive Python data science course', 'Technical', 'Intermediate', 15.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/python-for-data-science', NOW()),
    ('Salesforce Administration', 'Learn Salesforce administration basics', 'Technical', 'Beginner', 20.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/salesforce-administration', NOW()),
    ('AI and Machine Learning Basics', 'Introduction to AI and ML concepts', 'Technical', 'Intermediate', 18.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/ai-machine-learning-basics', NOW()),
    ('Effective Team Management', 'Learn how to manage teams effectively', 'Leadership', 'Intermediate', 10.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/effective-team-management', NOW()),
    ('Public Speaking Mastery', 'Improve your public speaking skills', 'Soft Skills', 'Beginner', 8.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/public-speaking-mastery', NOW()),
    ('Advanced Testing Strategies', 'Advanced software testing techniques', 'Technical', 'Advanced', 15.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/advanced-testing-strategies', NOW()),
    ('Salesforce Development', 'Advanced Salesforce development course', 'Technical', 'Advanced', 25.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/salesforce-development', NOW()),
    ('Business Communication', 'Professional business communication skills', 'Soft Skills', 'Intermediate', 10.0, 'EXTERNAL', 'LinkedIn Learning', 'https://www.linkedin.com/learning/business-communication', NOW())
ON CONFLICT DO NOTHING;
```

### Step 3: Create Sample Enrollments (for testing existing employee recommendations)

```sql
-- First, get user IDs (replace with actual user IDs from your database)
-- Example: Assuming user with employee_number 'EMP001' has user_id = 1

-- Insert enrollments for EMP001 (developer role)
-- This user has taken mostly Technical courses, so recommendations should be Technical-focused
INSERT INTO enrollments (user_id, course_id, status, progress_state, auto_enrolled, enrolled_at)
SELECT 
    u.id,
    c.id,
    'ENROLLED',
    'HIGH',
    false,
    NOW()
FROM users u
CROSS JOIN courses c
WHERE u.employee_number = 'EMP001'
  AND c.category = 'Technical'
  AND c.title IN ('Introduction to Python', 'JavaScript Fundamentals', 'React.js Complete Guide')
LIMIT 3;

-- Insert enrollments for EMP002 (tester role)
-- This user has taken Testing courses, so recommendations should be Testing-focused
INSERT INTO enrollments (user_id, course_id, status, progress_state, auto_enrolled, enrolled_at)
SELECT 
    u.id,
    c.id,
    'ENROLLED',
    'MEDIUM',
    false,
    NOW()
FROM users u
CROSS JOIN courses c
WHERE u.employee_number = 'EMP002'
  AND c.title IN ('Testing Fundamentals', 'Advanced Testing Strategies')
LIMIT 2;

-- Insert one completed course for testing CompletedCoursesSection
INSERT INTO enrollments (user_id, course_id, status, progress_state, auto_enrolled, enrolled_at)
SELECT 
    u.id,
    c.id,
    'COMPLETED',
    'COMPLETED',
    false,
    NOW()
FROM users u
CROSS JOIN courses c
WHERE u.employee_number = 'EMP001'
  AND c.title = 'Introduction to Python'
LIMIT 1;
```

## Option 2: Complete Python Script

Create a file `backend/scripts/seed_learning_data.py`:

```python
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
    emp001 = db.query(User).join(Employee).filter(Employee.employee_number == "EMP001").first()
    emp002 = db.query(User).join(Employee).filter(Employee.employee_number == "EMP002").first()
    
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
```

## Testing Checklist

After seeding, test the following:

1. **Search Functionality:**
   - Search for "Python" - should show Python courses
   - Search for "Testing" - should show testing courses
   - Search for "Leadership" - should show leadership courses

2. **Role-Based Recommendations (New Employee):**
   - Login as EMP001 (developer role) - should see Technical course recommendations
   - Login as EMP002 (tester role) - should see Testing course recommendations

3. **Category-Based Recommendations (Existing Employee):**
   - EMP001 has taken Technical courses - recommendations should be Technical-focused
   - EMP002 has taken Testing courses - recommendations should be Testing-focused

4. **AI Chatbot:**
   - Click chatbot button
   - Ask: "I have a project to do search for documents from HR and IT"
   - Should get relevant course recommendations
   - Click a recommendation - should auto-enroll and show progress modal

5. **Course Enrollment:**
   - Click on an unenrolled course - should auto-enroll and show progress modal
   - Update progress - should save and redirect if external course

6. **Completed Courses:**
   - Mark a course as COMPLETED
   - Should appear in Completed Courses section
   - Should be able to upload certificate

7. **Delete Functionality:**
   - Enroll via AI chatbot (auto_enrolled = true)
   - Should see delete icon if progress is NOT_STARTED
   - Delete should remove the enrollment

## Quick Test Commands

```bash
# Run migrations
cd backend
alembic upgrade head

# Seed learning data
python -m scripts.seed_learning_data

# Or use SQL directly in psql
psql -U postgres -d employee_portal -f learning_seed.sql
```
