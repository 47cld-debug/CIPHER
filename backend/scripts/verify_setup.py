"""
Setup verification script
Run this to check if your backend is configured correctly
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def check_env_file():
    """Check if .env file exists"""
    env_path = backend_dir / '.env'
    if env_path.exists():
        print("✓ .env file exists")
        return True
    else:
        print("✗ .env file not found. Please create backend/.env file")
        print("  You can copy from .env.example if it exists")
        return False

def check_database_connection():
    """Check if PostgreSQL database connection works"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text
        
        # Check if DATABASE_URL is configured
        if not settings.DATABASE_URL or settings.DATABASE_URL == "postgresql://user:password@localhost:5432/employee_portal":
            print("⚠ DATABASE_URL appears to be using default value")
            print("  Please configure DATABASE_URL in .env file")
        
        # Verify it's PostgreSQL
        if not settings.DATABASE_URL.startswith("postgresql"):
            print("⚠ DATABASE_URL does not appear to be PostgreSQL")
            print(f"  Current URL starts with: {settings.DATABASE_URL.split('://')[0]}")
        
        # Test connection
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            # Test basic query
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
            
            # Get PostgreSQL version
            version_result = conn.execute(text("SELECT version()"))
            version = version_result.scalar()
            print(f"✓ Database connection successful")
            print(f"  PostgreSQL version: {version.split(',')[0]}")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("  Please check your DATABASE_URL in .env file")
        print("  Ensure PostgreSQL is running and accessible")
        return False

def check_database_tables():
    """Check if database tables exist"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, inspect
        
        engine = create_engine(settings.DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # Core tables required for the application
        required_tables = [
            'employees', 'users', 'courses', 'enrollments', 
            'certificates', 'goals', 'career_profiles', 'appraisals',
            'initiatives', 'sessions', 'policies', 'faqs', 
            'compliance_documents', 'reminders'
        ]
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            print(f"✗ Missing database tables: {', '.join(missing_tables)}")
            print("  Please run: alembic upgrade head")
            return False
        else:
            print(f"✓ All required database tables exist ({len(required_tables)} tables)")
            return True
    except Exception as e:
        print(f"✗ Error checking tables: {e}")
        return False

def check_database_data():
    """Check if data exists in key tables"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text
        
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            # Check employees
            result = conn.execute(text("SELECT COUNT(*) FROM employees"))
            employee_count = result.scalar()
            
            # Check users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            
            # Check courses
            result = conn.execute(text("SELECT COUNT(*) FROM courses"))
            course_count = result.scalar()
            
            # Check enrollments
            result = conn.execute(text("SELECT COUNT(*) FROM enrollments"))
            enrollment_count = result.scalar()
            
            # Check initiatives
            result = conn.execute(text("SELECT COUNT(*) FROM initiatives"))
            initiative_count = result.scalar()
            
            # Check policies
            result = conn.execute(text("SELECT COUNT(*) FROM policies"))
            policy_count = result.scalar()
            
            print("\n  Database Data Summary:")
            print(f"    - Employees: {employee_count}")
            print(f"    - Users: {user_count}")
            print(f"    - Courses: {course_count}")
            print(f"    - Enrollments: {enrollment_count}")
            print(f"    - Wellness Initiatives: {initiative_count}")
            print(f"    - Policies: {policy_count}")
            
            # Warn if no data
            if employee_count == 0 and user_count == 0:
                print("\n  ⚠ No employees or users found in database")
                print("    Consider running: python scripts/seed_all_data.py")
                return False
            
            if course_count == 0:
                print("\n  ⚠ No courses found in database")
                print("    Consider running: python scripts/seed_learning_data.py")
            
            return True
    except Exception as e:
        print(f"✗ Error checking data: {e}")
        return False

def main():
    print("=" * 60)
    print("PostgreSQL Database Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Environment file", check_env_file),
        ("PostgreSQL connection", check_database_connection),
        ("Database tables", check_database_tables),
        ("Database data", check_database_data),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"Checking {name}...")
        result = check_func()
        results.append(result)
        print()
    
    print("=" * 60)
    if all(results):
        print("✓ All checks passed! PostgreSQL is configured correctly.")
        print("  Backend is ready to run.")
        print("  Start the server with: uvicorn app.main:app --reload")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print("\n  Common fixes:")
        print("    - Ensure PostgreSQL is running")
        print("    - Check DATABASE_URL in backend/.env file")
        print("    - Run migrations: alembic upgrade head")
        print("    - Seed data: python scripts/seed_all_data.py")
    print("=" * 60)

if __name__ == "__main__":
    main()
