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
    """Check if database connection works"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text
        
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("  Please check your DATABASE_URL in .env file")
        return False

def check_database_tables():
    """Check if database tables exist"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text, inspect
        
        engine = create_engine(settings.DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ['employees', 'users', 'courses', 'enrollments']
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            print(f"✗ Missing database tables: {', '.join(missing_tables)}")
            print("  Please run: alembic upgrade head")
            return False
        else:
            print("✓ All required database tables exist")
            return True
    except Exception as e:
        print(f"✗ Error checking tables: {e}")
        return False

def check_employees():
    """Check if employees are seeded"""
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text
        
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM employees"))
            count = result.scalar()
            
        if count > 0:
            print(f"✓ Found {count} employee(s) in database")
            return True
        else:
            print("✗ No employees found in database")
            print("  Please run: python scripts/seed_employees.py")
            return False
    except Exception as e:
        print(f"✗ Error checking employees: {e}")
        return False

def main():
    print("=" * 50)
    print("Backend Setup Verification")
    print("=" * 50)
    print()
    
    checks = [
        ("Environment file", check_env_file),
        ("Database connection", check_database_connection),
        ("Database tables", check_database_tables),
        ("Employee data", check_employees),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"Checking {name}...")
        result = check_func()
        results.append(result)
        print()
    
    print("=" * 50)
    if all(results):
        print("✓ All checks passed! Backend is ready to run.")
        print("  Start the server with: uvicorn app.main:app --reload")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
    print("=" * 50)

if __name__ == "__main__":
    main()
