"""
Script to assign dashboard widgets to Jeremy Joseph (JEREMY001)
Run this: python scripts/assign_widgets_to_jeremy.py
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.user import User
from models.dashboard import Widget, UserWidget

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Find Jeremy's user record
    jeremy_user = db.query(User).filter(User.employee_number == "JEREMY001").first()
    
    if not jeremy_user:
        print("[ERROR] User JEREMY001 not found!")
        print("   Please login once with JEREMY001 to create the user record, then run this script again.")
        db.close()
        exit(1)
    
    print(f"[OK] Found user: {jeremy_user.full_name} (ID: {jeremy_user.id})")
    
    # Get all available widgets
    widgets = db.query(Widget).all()
    
    if not widgets:
        print("[ERROR] No widgets found in database!")
        print("   Please run seed_all_data.py first to create widgets.")
        db.close()
        exit(1)
    
    print(f"[OK] Found {len(widgets)} widgets")
    
    # Assign widgets to Jeremy
    assigned_count = 0
    for i, widget in enumerate(widgets):
        # Check if widget is already assigned
        existing = db.query(UserWidget).filter(
            UserWidget.user_id == jeremy_user.id,
            UserWidget.widget_id == widget.id
        ).first()
        
        if not existing:
            user_widget = UserWidget(
                user_id=jeremy_user.id,
                widget_id=widget.id,
                position=i,
                enabled=True
            )
            db.add(user_widget)
            assigned_count += 1
            print(f"  [OK] Assigned: {widget.name}")
        else:
            print(f"  [-] Already assigned: {widget.name}")
    
    db.commit()
    
    print(f"\n[SUCCESS] Assigned {assigned_count} widget(s) to {jeremy_user.full_name}!")
    print(f"\nTotal widgets assigned: {len(widgets)}")
    print("\nRefresh your dashboard to see the widgets.")
    
except Exception as e:
    db.rollback()
    print(f"[ERROR] Error: {e}")
    raise
finally:
    db.close()
