"""
Master seed script - Seeds all data for the employee portal
Run this after setting up the database: python scripts/seed_all_data.py
"""
import sys
from pathlib import Path
from datetime import datetime, date, timedelta

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.employee import Employee
from models.user import User, UserRole
from models.dashboard import Widget, UserWidget
from models.learning import Course, Enrollment, CourseType, ProgressState, EnrollmentStatus, Skill, CourseSkill, SkillCategory
from models.career import Goal, Appraisal, GoalStatus, AppraisalStatus
from models.compliance import Policy, FAQ, Reminder
from models.wellness import Initiative, Session, SessionStatus

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_widgets():
    """Seed dashboard widgets"""
    widgets_data = [
        {"name": "Learning Progress", "type": "learning_progress", "config": {"show_completed": True, "limit": 5}},
        {"name": "Upcoming Courses", "type": "upcoming_courses", "config": {"limit": 3}},
        {"name": "Career Goals", "type": "career_goals", "config": {"show_active_only": True, "limit": 3}},
        {"name": "Compliance Reminders", "type": "compliance_reminders", "config": {"show_pending": True, "limit": 3}},
        {"name": "Wellness Initiatives", "type": "wellness_initiatives", "config": {"limit": 3}},
    ]
    
    created_widgets = []
    for widget_data in widgets_data:
        existing = db.query(Widget).filter(Widget.name == widget_data["name"]).first()
        if not existing:
            widget = Widget(**widget_data)
            db.add(widget)
            created_widgets.append(widget)
            print(f"✓ Created widget: {widget_data['name']}")
        else:
            created_widgets.append(existing)
    
    db.commit()
    return created_widgets

def assign_widgets_to_users(widgets):
    """Assign widgets to all users"""
    users = db.query(User).all()
    for user in users:
        for i, widget in enumerate(widgets):
            existing = db.query(UserWidget).filter(
                UserWidget.user_id == user.id,
                UserWidget.widget_id == widget.id
            ).first()
            if not existing:
                user_widget = UserWidget(
                    user_id=user.id,
                    widget_id=widget.id,
                    position=i,
                    enabled=True
                )
                db.add(user_widget)
        print(f"✓ Assigned widgets to {user.full_name}")
    db.commit()

def seed_courses():
    """Seed learning courses"""
    courses_data = [
        {
            "title": "Python for Data Science",
            "description": "Master Python programming for data analysis, visualization, and machine learning. Learn pandas, numpy, matplotlib, and scikit-learn.",
            "category": "Technical",
            "skill_level": "Intermediate",
            "duration": 40.0,
            "course_type": CourseType.INTERNAL,
            "provider_name": None,
            "external_url": None
        },
        {
            "title": "React Advanced Patterns",
            "description": "Deep dive into React hooks, context API, performance optimization, and advanced state management patterns.",
            "category": "Technical",
            "skill_level": "Advanced",
            "duration": 30.0,
            "course_type": CourseType.INTERNAL,
            "provider_name": None,
            "external_url": None
        },
        {
            "title": "Leadership Fundamentals",
            "description": "Develop essential leadership skills including communication, team management, decision-making, and conflict resolution.",
            "category": "Leadership",
            "skill_level": "Beginner",
            "duration": 20.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "LinkedIn Learning",
            "external_url": "https://www.linkedin.com/learning/leadership-fundamentals"
        },
        {
            "title": "Effective Communication",
            "description": "Improve your communication skills for better workplace relationships and professional success.",
            "category": "Soft Skills",
            "skill_level": "Beginner",
            "duration": 15.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "Coursera",
            "external_url": "https://www.coursera.org/learn/communication"
        },
        {
            "title": "Agile Project Management",
            "description": "Learn Agile methodologies, Scrum framework, and how to manage projects in fast-paced environments.",
            "category": "Technical",
            "skill_level": "Intermediate",
            "duration": 25.0,
            "course_type": CourseType.INTERNAL,
            "provider_name": None,
            "external_url": None
        },
        {
            "title": "Time Management Mastery",
            "description": "Master productivity techniques, prioritization strategies, and tools to maximize your efficiency.",
            "category": "Soft Skills",
            "skill_level": "Beginner",
            "duration": 10.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "Udemy",
            "external_url": "https://www.udemy.com/time-management"
        },
        {
            "title": "Cloud Architecture with AWS",
            "description": "Comprehensive guide to designing and deploying scalable applications on Amazon Web Services.",
            "category": "Technical",
            "skill_level": "Advanced",
            "duration": 50.0,
            "course_type": CourseType.EXTERNAL,
            "provider_name": "AWS Training",
            "external_url": "https://aws.amazon.com/training/"
        },
        {
            "title": "Emotional Intelligence at Work",
            "description": "Develop emotional intelligence to improve workplace relationships and leadership effectiveness.",
            "category": "Soft Skills",
            "skill_level": "Intermediate",
            "duration": 12.0,
            "course_type": CourseType.INTERNAL,
            "provider_name": None,
            "external_url": None
        }
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

def seed_enrollments(courses, users):
    """Seed course enrollments"""
    if len(users) < 3 or len(courses) < 8:
        print("⚠ Skipping enrollments: need at least 3 users and 8 courses (run seed_employees.py and ensure seed_courses created 8).")
        return
    enrollments_data = [
        # User 1 enrollments
        {"user": users[0], "course": courses[0], "progress": ProgressState.MEDIUM, "status": EnrollmentStatus.ENROLLED},
        {"user": users[0], "course": courses[2], "progress": ProgressState.HIGH, "status": EnrollmentStatus.ENROLLED},
        {"user": users[0], "course": courses[4], "progress": ProgressState.NOT_STARTED, "status": EnrollmentStatus.ENROLLED},
        # User 2 enrollments
        {"user": users[1], "course": courses[1], "progress": ProgressState.COMPLETED, "status": EnrollmentStatus.COMPLETED},
        {"user": users[1], "course": courses[3], "progress": ProgressState.LOW, "status": EnrollmentStatus.ENROLLED},
        {"user": users[1], "course": courses[5], "progress": ProgressState.MEDIUM, "status": EnrollmentStatus.ENROLLED},
        # User 3 enrollments
        {"user": users[2], "course": courses[6], "progress": ProgressState.HIGH, "status": EnrollmentStatus.ENROLLED},
        {"user": users[2], "course": courses[7], "progress": ProgressState.COMPLETED, "status": EnrollmentStatus.COMPLETED},
    ]
    
    for enrollment_data in enrollments_data:
        existing = db.query(Enrollment).filter(
            Enrollment.user_id == enrollment_data["user"].id,
            Enrollment.course_id == enrollment_data["course"].id
        ).first()
        if not existing:
            enrollment = Enrollment(
                user_id=enrollment_data["user"].id,
                course_id=enrollment_data["course"].id,
                status=enrollment_data["status"],
                progress_state=enrollment_data["progress"]
            )
            db.add(enrollment)
            print(f"✓ Enrolled {enrollment_data['user'].full_name} in {enrollment_data['course'].title}")
    
    db.commit()

def seed_goals(users):
    """Seed career goals"""
    if len(users) < 3:
        print("⚠ Skipping career goals: need at least 3 users.")
        return
    goals_data = [
        {
            "user": users[0],
            "title": "Complete Python Certification",
            "description": "Finish the Python for Data Science course and obtain certification by end of quarter",
            "target_date": date.today() + timedelta(days=60),
            "status": GoalStatus.IN_PROGRESS,
            "progress": 65,
        },
        {
            "user": users[0],
            "title": "Lead a Team Project",
            "description": "Take on a leadership role in the upcoming Q2 project initiative",
            "target_date": date.today() + timedelta(days=90),
            "status": GoalStatus.PENDING,
            "progress": 0,
        },
        {
            "user": users[1],
            "title": "Master React Advanced Patterns",
            "description": "Complete the React course and implement advanced patterns in current project",
            "target_date": date.today() + timedelta(days=45),
            "status": GoalStatus.IN_PROGRESS,
            "progress": 40,
        },
        {
            "user": users[1],
            "title": "Improve Communication Skills",
            "description": "Complete communication course and apply learnings in team meetings",
            "target_date": date.today() + timedelta(days=30),
            "status": GoalStatus.IN_PROGRESS,
            "progress": 75,
        },
        {
            "user": users[2],
            "title": "AWS Cloud Certification",
            "description": "Complete AWS architecture course and pass certification exam",
            "target_date": date.today() + timedelta(days=120),
            "status": GoalStatus.PENDING,
            "progress": 0,
        },
        {
            "user": users[2],
            "title": "Enhance Emotional Intelligence",
            "description": "Complete EI course and improve workplace relationships",
            "target_date": date.today() + timedelta(days=20),
            "status": GoalStatus.COMPLETED,
            "progress": 100,
        },
    ]
    
    for goal_data in goals_data:
        existing = db.query(Goal).filter(
            Goal.user_id == goal_data["user"].id,
            Goal.title == goal_data["title"]
        ).first()
        if not existing:
            goal = Goal(**goal_data)
            db.add(goal)
            print(f"✓ Created goal for {goal_data['user'].full_name}: {goal_data['title']}")
    
    db.commit()

def seed_appraisals(users):
    """Seed performance appraisals"""
    if len(users) < 3:
        print("⚠ Skipping appraisals: need at least 3 users.")
        return
    appraisals_data = [
        {
            "user": users[0],
            "period": "Q4 2024",
            "self_review": "I have made significant progress in my technical skills and completed several key projects. I'm looking forward to taking on more leadership responsibilities.",
            "manager_feedback": "Excellent work this quarter. Strong technical performance and good team collaboration. Ready for more challenging assignments.",
            "status": AppraisalStatus.REVIEWED
        },
        {
            "user": users[1],
            "period": "Q4 2024",
            "self_review": "Completed React course and successfully implemented new patterns in our frontend. Working on improving communication with cross-functional teams.",
            "manager_feedback": "Great technical contributions. Continue focusing on communication skills development.",
            "status": AppraisalStatus.SUBMITTED
        },
        {
            "user": users[2],
            "period": "Q4 2024",
            "self_review": "Focused on cloud technologies and emotional intelligence. Completed wellness initiatives and improved work-life balance.",
            "manager_feedback": "Strong growth in technical and soft skills. Well-rounded performance.",
            "status": AppraisalStatus.DRAFT
        }
    ]
    
    for appraisal_data in appraisals_data:
        existing = db.query(Appraisal).filter(
            Appraisal.user_id == appraisal_data["user"].id,
            Appraisal.period == appraisal_data["period"]
        ).first()
        if not existing:
            appraisal = Appraisal(**appraisal_data)
            db.add(appraisal)
            print(f"✓ Created appraisal for {appraisal_data['user'].full_name}: {appraisal_data['period']}")
    
    db.commit()

def seed_policies():
    """Seed compliance policies"""
    policies_data = [
        {
            "title": "Code of Conduct",
            "content": "Our Code of Conduct outlines the standards of behavior expected from all employees. This includes respect for colleagues, integrity in all business dealings, and commitment to ethical practices. Violations may result in disciplinary action.",
            "category": "HR",
            "version": "2.1"
        },
        {
            "title": "Remote Work Policy",
            "content": "Employees may work remotely up to 3 days per week with manager approval. Remote workers must maintain regular communication, attend all required meetings, and ensure a secure work environment. Equipment and internet costs are reimbursed up to $100/month.",
            "category": "HR",
            "version": "1.5"
        },
        {
            "title": "Data Security Policy",
            "content": "All employees must follow data security protocols including strong password requirements, two-factor authentication, regular software updates, and secure handling of sensitive information. Unauthorized data access or sharing is strictly prohibited.",
            "category": "IT",
            "version": "3.0"
        },
        {
            "title": "Leave Policy",
            "content": "Full-time employees accrue 20 days of paid leave annually. Leave requests must be submitted at least 2 weeks in advance. Emergency leave may be approved by manager. Unused leave may be carried forward up to 10 days.",
            "category": "HR",
            "version": "1.8"
        },
        {
            "title": "Expense Reimbursement Policy",
            "content": "Business expenses must be pre-approved for amounts over $500. Submit receipts within 30 days. Reimbursements are processed monthly. Personal expenses are not eligible for reimbursement.",
            "category": "Finance",
            "version": "2.2"
        }
    ]
    
    created_policies = []
    for policy_data in policies_data:
        existing = db.query(Policy).filter(Policy.title == policy_data["title"]).first()
        if not existing:
            policy = Policy(**policy_data)
            db.add(policy)
            created_policies.append(policy)
            print(f"✓ Created policy: {policy_data['title']}")
        else:
            created_policies.append(existing)
    
    db.commit()
    return created_policies

def seed_faqs(policies):
    """Seed FAQs"""
    faqs_data = [
        {
            "question": "How do I request time off?",
            "answer": "Submit a leave request through the employee portal at least 2 weeks in advance. Your manager will review and approve the request. You'll receive a confirmation email once approved.",
            "category": "HR",
            "policy_id": policies[2].id if len(policies) > 2 else None
        },
        {
            "question": "What is the remote work policy?",
            "answer": "You can work remotely up to 3 days per week with your manager's approval. Ensure you have a secure internet connection and attend all required meetings. Equipment reimbursement is available up to $100/month.",
            "category": "HR",
            "policy_id": policies[1].id if len(policies) > 1 else None
        },
        {
            "question": "How do I reset my password?",
            "answer": "Click 'Forgot Password' on the login page and follow the instructions sent to your email. For security reasons, passwords must be changed every 90 days.",
            "category": "IT",
            "policy_id": policies[2].id if len(policies) > 2 else None
        },
        {
            "question": "What expenses can I claim?",
            "answer": "Business-related expenses such as travel, meals during business meetings, training courses, and equipment. All expenses over $500 require pre-approval. Submit receipts within 30 days.",
            "category": "Finance",
            "policy_id": policies[4].id if len(policies) > 4 else None
        },
        {
            "question": "How do I report a violation of the Code of Conduct?",
            "answer": "Report violations to HR through the confidential reporting portal or contact your HR representative directly. All reports are taken seriously and investigated promptly.",
            "category": "HR",
            "policy_id": policies[0].id if len(policies) > 0 else None
        }
    ]
    
    for faq_data in faqs_data:
        existing = db.query(FAQ).filter(FAQ.question == faq_data["question"]).first()
        if not existing:
            faq = FAQ(**faq_data)
            db.add(faq)
            print(f"✓ Created FAQ: {faq_data['question']}")
    
    db.commit()

def seed_reminders(users):
    """Seed compliance reminders"""
    if len(users) < 3:
        print("⚠ Skipping compliance reminders: need at least 3 users.")
        return
    reminders_data = [
        {
            "user": users[0],
            "type": "Training",
            "message": "Complete mandatory security training by end of month",
            "due_date": date.today() + timedelta(days=15),
            "completed": False
        },
        {
            "user": users[0],
            "type": "Policy Review",
            "message": "Review and acknowledge updated Code of Conduct",
            "due_date": date.today() + timedelta(days=7),
            "completed": False
        },
        {
            "user": users[1],
            "type": "Training",
            "message": "Complete mandatory security training by end of month",
            "due_date": date.today() + timedelta(days=15),
            "completed": False
        },
        {
            "user": users[2],
            "type": "Policy Review",
            "message": "Review and acknowledge updated Code of Conduct",
            "due_date": date.today() + timedelta(days=7),
            "completed": True
        },
        {
            "user": users[2],
            "type": "Certification",
            "message": "Renew professional certification before expiration",
            "due_date": date.today() + timedelta(days=45),
            "completed": False
        }
    ]
    
    for reminder_data in reminders_data:
        existing = db.query(Reminder).filter(
            Reminder.user_id == reminder_data["user"].id,
            Reminder.message == reminder_data["message"]
        ).first()
        if not existing:
            reminder = Reminder(**reminder_data)
            db.add(reminder)
            print(f"✓ Created reminder for {reminder_data['user'].full_name}")
    
    db.commit()

def seed_initiatives():
    """Seed wellness initiatives"""
    initiatives_data = [
        {
            "title": "Yoga & Meditation Sessions",
            "description": "Weekly yoga and meditation sessions to promote physical and mental wellness. Sessions are held every Wednesday at 5 PM in the wellness center.",
            "category": "Physical Wellness",
            "start_date": date.today() - timedelta(days=30),
            "end_date": date.today() + timedelta(days=60)
        },
        {
            "title": "Mental Health Support Group",
            "description": "Monthly support group meetings for employees to discuss work-life balance, stress management, and mental health topics in a safe, confidential environment.",
            "category": "Mental Wellness",
            "start_date": date.today() - timedelta(days=15),
            "end_date": date.today() + timedelta(days=90)
        },
        {
            "title": "Nutrition Workshop Series",
            "description": "Learn about healthy eating habits, meal planning, and nutrition basics. Three-part workshop series with certified nutritionist.",
            "category": "Physical Wellness",
            "start_date": date.today() + timedelta(days=7),
            "end_date": date.today() + timedelta(days=28)
        },
        {
            "title": "Financial Wellness Seminar",
            "description": "Educational sessions on budgeting, retirement planning, and financial goal setting. Led by certified financial advisors.",
            "category": "Financial Wellness",
            "start_date": date.today() + timedelta(days=14),
            "end_date": date.today() + timedelta(days=45)
        }
    ]
    
    created_initiatives = []
    for initiative_data in initiatives_data:
        existing = db.query(Initiative).filter(Initiative.title == initiative_data["title"]).first()
        if not existing:
            initiative = Initiative(**initiative_data)
            db.add(initiative)
            created_initiatives.append(initiative)
            print(f"✓ Created initiative: {initiative_data['title']}")
        else:
            created_initiatives.append(existing)
    
    db.commit()
    return created_initiatives

def seed_sessions(initiatives, users):
    """Seed wellness sessions"""
    if len(users) < 3 or len(initiatives) < 4:
        print("⚠ Skipping wellness sessions: need at least 3 users and 4 initiatives.")
        return
    sessions_data = [
        {
            "user": users[0],
            "initiative": initiatives[0],
            "status": SessionStatus.APPROVED
        },
        {
            "user": users[0],
            "initiative": initiatives[1],
            "status": SessionStatus.PENDING
        },
        {
            "user": users[1],
            "initiative": initiatives[0],
            "status": SessionStatus.COMPLETED
        },
        {
            "user": users[1],
            "initiative": initiatives[2],
            "status": SessionStatus.APPROVED
        },
        {
            "user": users[2],
            "initiative": initiatives[1],
            "status": SessionStatus.APPROVED
        },
        {
            "user": users[2],
            "initiative": initiatives[3],
            "status": SessionStatus.PENDING
        }
    ]
    
    for session_data in sessions_data:
        existing = db.query(Session).filter(
            Session.user_id == session_data["user"].id,
            Session.initiative_id == session_data["initiative"].id
        ).first()
        if not existing:
            session = Session(
                user_id=session_data["user"].id,
                initiative_id=session_data["initiative"].id,
                status=session_data["status"]
            )
            db.add(session)
            print(f"✓ Created session for {session_data['user'].full_name}: {session_data['initiative'].title}")
    
    db.commit()

def main():
    print("=" * 60)
    print("Seeding All Employee Portal Data")
    print("=" * 60)
    print()
    
    try:
        # Seed widgets
        print("1. Seeding widgets...")
        widgets = seed_widgets()
        print()
        
        # Get users (should already exist from seed_employees.py)
        users = db.query(User).all()
        if not users:
            print("⚠ No users found. Please run seed_employees.py first!")
            return
        
        # Assign widgets to users
        print("2. Assigning widgets to users...")
        assign_widgets_to_users(widgets)
        print()
        
        # Seed courses
        print("3. Seeding courses...")
        courses = seed_courses()
        print()
        
        # Seed enrollments
        print("4. Seeding enrollments...")
        seed_enrollments(courses, users)
        print()
        
        # Seed goals
        print("5. Seeding career goals...")
        seed_goals(users)
        print()
        
        # Seed appraisals
        print("6. Seeding appraisals...")
        seed_appraisals(users)
        print()
        
        # Seed policies
        print("7. Seeding policies...")
        policies = seed_policies()
        print()
        
        # Seed FAQs
        print("8. Seeding FAQs...")
        seed_faqs(policies)
        print()
        
        # Seed reminders
        print("9. Seeding compliance reminders...")
        seed_reminders(users)
        print()
        
        # Seed initiatives
        print("10. Seeding wellness initiatives...")
        initiatives = seed_initiatives()
        print()
        
        # Seed sessions
        print("11. Seeding wellness sessions...")
        seed_sessions(initiatives, users)
        print()
        
        print("=" * 60)
        print("✓ All data seeded successfully!")
        print("=" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error seeding data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
    db.close()