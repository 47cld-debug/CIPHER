from app.config import settings

print("DATABASE_URL from config:")
print(settings.DATABASE_URL)
print("\nTrying to connect...")

from sqlalchemy import create_engine

try:
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")