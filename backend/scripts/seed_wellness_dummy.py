"""
Seed only wellness initiatives and sessions (dummy data).
Requires existing users - run seed_employees.py or seed_all_data.py first.
From backend directory: python scripts/seed_wellness_dummy.py
"""
import sys
from pathlib import Path
from datetime import date, timedelta

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.user import User
from models.wellness import Initiative, Session as WellnessSession, SessionStatus

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()


def seed_initiatives():
    """Seed wellness initiatives with session fields."""
    base_date = date.today()
    initiatives_data = [
        {
            "title": "Daily Exercise Sessions",
            "description": "Morning exercise sessions to promote physical wellness. Join for cardio, stretching, and light strength training.",
            "category": "Physical Wellness",
            "start_date": base_date - timedelta(days=30),
            "end_date": base_date + timedelta(days=60),
            "session_date": base_date + timedelta(days=1),
            "session_time": "7:00 AM - 8:00 AM",
            "trainer_name": "Alex Johnson",
            "total_slots": 25,
            "location": "Main Gym, Building A",
        },
        {
            "title": "Yoga Sessions",
            "description": "Weekly yoga and meditation sessions to promote physical and mental wellness. Sessions are held every Wednesday at 5 PM in the wellness center.",
            "category": "Physical Wellness",
            "start_date": base_date - timedelta(days=30),
            "end_date": base_date + timedelta(days=60),
            "session_date": base_date + timedelta(days=2),
            "session_time": "5:00 PM - 6:00 PM",
            "trainer_name": "Sarah Chen",
            "total_slots": 20,
            "location": "Wellness Center, Room 101",
        },
        {
            "title": "Counseling Sessions",
            "description": "One-on-one and group counseling for stress, work-life balance, and mental health. Confidential and led by certified counselors.",
            "category": "Mental Wellness",
            "start_date": base_date - timedelta(days=15),
            "end_date": base_date + timedelta(days=90),
            "session_date": base_date + timedelta(days=3),
            "session_time": "10:00 AM - 11:00 AM",
            "trainer_name": "Dr. Michael Roberts",
            "total_slots": 15,
            "location": "HR Wellness Wing, Room 205",
        },
        {
            "title": "Nutrition Workshop Series",
            "description": "Learn about healthy eating habits, meal planning, and nutrition basics. Three-part workshop series with certified nutritionist.",
            "category": "Physical Wellness",
            "start_date": base_date + timedelta(days=7),
            "end_date": base_date + timedelta(days=28),
            "session_date": base_date + timedelta(days=7),
            "session_time": "12:00 PM - 1:00 PM",
            "trainer_name": "Emily Davis",
            "total_slots": 30,
            "location": "Cafeteria Annex, Conference Room B",
        },
    ]

    created_initiatives = []
    for initiative_data in initiatives_data:
        existing = db.query(Initiative).filter(Initiative.title == initiative_data["title"]).first()
        if not existing:
            initiative = Initiative(**initiative_data)
            db.add(initiative)
            created_initiatives.append(initiative)
            print(f"Created initiative: {initiative_data['title']}")
        else:
            created_initiatives.append(existing)

    db.commit()
    return created_initiatives


def seed_sessions(initiatives, users):
    """Seed wellness session bookings."""
    sessions_data = [
        {"user": users[0], "initiative": initiatives[0], "status": SessionStatus.APPROVED},
        {"user": users[0], "initiative": initiatives[1], "status": SessionStatus.PENDING},
        {"user": users[1], "initiative": initiatives[0], "status": SessionStatus.COMPLETED},
        {"user": users[1], "initiative": initiatives[2], "status": SessionStatus.APPROVED},
        {"user": users[2], "initiative": initiatives[1], "status": SessionStatus.APPROVED},
        {"user": users[2], "initiative": initiatives[3], "status": SessionStatus.PENDING},
    ]

    for session_data in sessions_data:
        existing = db.query(WellnessSession).filter(
            WellnessSession.user_id == session_data["user"].id,
            WellnessSession.initiative_id == session_data["initiative"].id,
        ).first()
        if not existing:
            session = WellnessSession(
                user_id=session_data["user"].id,
                initiative_id=session_data["initiative"].id,
                status=session_data["status"],
            )
            db.add(session)
            print(f"Created session for {session_data['user'].full_name}: {session_data['initiative'].title}")

    db.commit()


def main():
    print("=" * 60)
    print("Seeding Wellness Dummy Data (Initiatives + Sessions)")
    print("=" * 60)
    print()

    users = db.query(User).all()
    if not users:
        print("No users found. Please run seed_employees.py or seed_all_data.py first.")
        sys.exit(1)
    if len(users) < 3:
        print("At least 3 users are required for session dummy data. Please run seed_employees.py or seed_all_data.py first.")
        sys.exit(1)

    try:
        print("1. Seeding wellness initiatives...")
        initiatives = seed_initiatives()
        print()
        print("2. Seeding wellness sessions...")
        seed_sessions(initiatives, users)
        print()
        print("=" * 60)
        print("Wellness dummy data seeded successfully.")
        print("=" * 60)
    except Exception as e:
        db.rollback()
        print(f"Error seeding wellness data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
