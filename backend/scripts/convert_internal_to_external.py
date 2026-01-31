"""
Convert INTERNAL courses to EXTERNAL with LinkedIn Learning URLs
Run: python -m scripts.convert_internal_to_external
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.learning import Course, CourseType
import re

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Mapping of course titles to actual LinkedIn Learning URLs
COURSE_URL_MAPPING = {
    "Introduction to Python": "https://www.linkedin.com/learning/learning-python-25309312/learning-python?u=141392732",
    "Python for Data Science": "https://www.linkedin.com/learning/learning-python-25309312/learning-python?u=141392732",
    "Advanced Python Development": "https://www.linkedin.com/learning/advanced-python-23931756/welcome?u=141392732",
    "JavaScript Fundamentals": "https://www.linkedin.com/learning/javascript-essential-training/javascript-the-soil-from-which-the-modern-web-grows?u=141392732",
    "React.js Complete Guide": "https://www.linkedin.com/learning/react-essential-training/building-modern-user-interfaces-with-react?u=141392732",
    "React Advanced Patterns": "https://www.linkedin.com/learning/react-advanced-code-challenges/advanced-code-challenges-in-react?u=141392732",
    "Leadership Essentials": "https://www.linkedin.com/learning/search?keywords=leadership%20essentials&u=141392732",
    "Leadership Fundamentals": "https://www.linkedin.com/learning/leadership-foundations-22307442/welcome-to-leadership-foundations?u=141392732",
    "Communication Skills": "https://www.linkedin.com/learning/communicating-with-confidence-23450131/prepare-to-become-a-more-confident-communicator?u=141392732",
    "Effective Communication": "https://www.linkedin.com/learning/communication-foundations-23064093/communication-for-career-success?u=141392732",
    "Testing Fundamentals": "https://www.linkedin.com/learning/netops-devops-for-network-engineers-automating-networks/devops-for-network-engineers?u=141392732",
    "Advanced Testing Strategies": "https://www.linkedin.com/learning/strategic-business-analysis-essentials/your-role-in-shaping-business-strategy?u=141392732",
    "Salesforce Administration": "https://www.linkedin.com/learning/salesforce-administrator-cert-prep-the-basics/introduction-and-exam-overview?u=141392732",
    "Salesforce Development": "https://www.linkedin.com/learning/salesforce-essential-training-24934421/learning-the-essentials-of-salesforce?u=141392732",
    "Agile Project Management": "https://www.linkedin.com/learning/agile-foundations/understanding-agile-21059664?u=141392732",
    "Time Management Mastery": "https://www.linkedin.com/learning/time-management-fundamentals-14548057/the-power-of-managing-your-time?u=141392732",
    "Cloud Architecture with AWS": "https://www.linkedin.com/learning/building-a-cloud-architecture-diagram/an-in-depth-look-at-cloud-architecture-diagrams?u=141392732",
    "Emotional Intelligence at Work": "https://www.linkedin.com/learning/developing-your-emotional-intelligence-22196221/developing-your-emotional-intelligence?u=141392732",
}


def title_to_linkedin_slug(title: str) -> str:
    """Convert course title to LinkedIn Learning URL slug (fallback for unmapped courses)"""
    slug = title.lower()
    # Remove periods (e.g., "React.js" -> "reactjs")
    slug = slug.replace('.', '')
    # Replace spaces with hyphens
    slug = slug.replace(' ', '-')
    # Remove special characters, keep only alphanumeric and hyphens
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Replace multiple hyphens with single hyphen
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug


def convert_internal_to_external():
    """Convert all INTERNAL courses to EXTERNAL with LinkedIn Learning URLs"""
    # Query all INTERNAL courses
    internal_courses = db.query(Course).filter(Course.course_type == CourseType.INTERNAL).all()
    
    if not internal_courses:
        print("No INTERNAL courses found to convert.")
        return
    
    print(f"Found {len(internal_courses)} INTERNAL course(s) to convert.\n")
    
    updated_count = 0
    for course in internal_courses:
        # Skip if already has external_url (shouldn't happen for INTERNAL, but safety check)
        if course.external_url:
            print(f"⚠ Skipping '{course.title}' - already has external_url")
            continue
        
        # Use mapping if available, otherwise generate URL
        if course.title in COURSE_URL_MAPPING:
            external_url = COURSE_URL_MAPPING[course.title]
            url_source = "mapping"
        else:
            # Fallback to generated URL
            slug = title_to_linkedin_slug(course.title)
            external_url = f"https://www.linkedin.com/learning/{slug}"
            url_source = "generated"
        
        # Update course
        course.course_type = CourseType.EXTERNAL
        course.provider_name = "LinkedIn Learning"
        course.external_url = external_url
        
        print(f"✓ Converted: '{course.title}'")
        print(f"  URL: {external_url} ({url_source})")
        updated_count += 1
    
    if updated_count > 0:
        db.commit()
        print(f"\n✅ Successfully converted {updated_count} course(s) to EXTERNAL with LinkedIn Learning URLs.")
    else:
        print("\n⚠ No courses were updated.")


if __name__ == "__main__":
    try:
        print("=" * 60)
        print("Converting INTERNAL Courses to EXTERNAL")
        print("=" * 60)
        print()
        
        convert_internal_to_external()
        
        print("\n" + "=" * 60)
        print("Conversion complete!")
        print("=" * 60)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
