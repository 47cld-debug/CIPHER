from typing import List, Optional
from sqlalchemy.orm import Session
from models.user import User
from models.learning import Enrollment, Course, Certificate, ProgressState, EnrollmentStatus, VerificationStatus
from repositories.learning_repository import (
    CourseRepository, EnrollmentRepository, CertificateRepository
)
from services.file_service import file_service
from services.openai_service import openai_service


class LearningService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.certificate_repo = CertificateRepository(db)

    def get_courses(
        self,
        skip: int = 0,
        limit: int = 100,
        course_type: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Course]:
        """Get courses with filtering"""
        if search:
            return self.course_repo.search(search, skip, limit)
        
        if course_type:
            from models.learning import CourseType
            return self.course_repo.get_by_type(CourseType(course_type), skip, limit)
        
        return self.course_repo.get_all(skip, limit)

    def get_course(self, course_id: int) -> Optional[Course]:
        """Get course by ID"""
        return self.course_repo.get(course_id)

    def enroll_user(self, user_id: int, course_id: int, auto_enrolled: bool = False) -> Optional[Enrollment]:
        """Enroll user in course"""
        # Check if course exists
        course = self.course_repo.get(course_id)
        if not course:
            raise ValueError(f"Course with ID {course_id} not found")
        
        # Check if already enrolled
        existing = self.enrollment_repo.get_by_user_and_course(user_id, course_id)
        if existing:
            return existing

        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id,
            status=EnrollmentStatus.ENROLLED,
            progress_state=ProgressState.NOT_STARTED,
            auto_enrolled=auto_enrolled
        )
        return self.enrollment_repo.create(enrollment)

    def get_user_enrollments(self, user_id: int) -> List[Enrollment]:
        """Get user's enrollments"""
        return self.enrollment_repo.get_by_user(user_id)

    def update_progress(
        self,
        enrollment_id: int,
        user_id: int,
        progress_state: ProgressState
    ) -> Optional[Enrollment]:
        """Update enrollment progress (event-based)"""
        enrollment = self.enrollment_repo.get(enrollment_id)
        if not enrollment or enrollment.user_id != user_id:
            return None

        return self.enrollment_repo.update_progress(enrollment_id, progress_state)

    async def upload_certificate(
        self,
        enrollment_id: int,
        user_id: int,
        file
    ) -> Optional[Certificate]:
        """Upload certificate for completed course"""
        enrollment = self.enrollment_repo.get(enrollment_id)
        if not enrollment or enrollment.user_id != user_id:
            return None

        if enrollment.progress_state != ProgressState.COMPLETED:
            raise ValueError("Course must be marked as completed before uploading certificate")

        # Check if certificate already exists
        existing = self.certificate_repo.get_by_enrollment(enrollment_id)
        if existing:
            # Update existing certificate
            file_url = await file_service.save_certificate(file)
            existing.file_url = file_url
            existing.verification_status = VerificationStatus.PENDING
            return self.certificate_repo.update(existing)

        # Create new certificate
        file_url = await file_service.save_certificate(file)
        certificate = Certificate(
            enrollment_id=enrollment_id,
            file_url=file_url,
            verification_status=VerificationStatus.PENDING
        )
        return self.certificate_repo.create(certificate)

    async def get_recommendations(self, user: User) -> List[dict]:
        """Get personalized course recommendations based on user's course history"""
        from models.employee import Employee
        import re
        
        enrollments = self.get_user_enrollments(user.id)
        enrolled_course_ids = {e.course_id for e in enrollments if e.course_id}
        
        # Check if new employee (no enrollments)
        if len(enrollments) == 0:
            # Get employee role from Employee model
            employee = self.db.query(Employee).filter(Employee.employee_number == user.employee_number).first()
            if employee and employee.role:
                # Recommend courses based on role
                role_lower = employee.role.lower()
                # Search for courses matching role
                courses = self.course_repo.search(role_lower, skip=0, limit=5)
                if not courses:
                    # Fallback: get any courses
                    courses = self.course_repo.get_all(skip=0, limit=5)
                return [
                    {
                        "title": c.title,
                        "description": c.description or "",
                        "id": c.id,
                        "course_type": c.course_type.value,
                        "external_url": c.external_url
                    }
                    for c in courses
                ]
        
        # Analyze user's course history to find dominant topics
        topic_keywords = {
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network', 'nlp', 'natural language'],
            'python': ['python', 'django', 'flask', 'pandas', 'numpy', 'scikit'],
            'javascript': ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'typescript'],
            'data science': ['data science', 'data analysis', 'data analytics', 'big data', 'data visualization'],
            'cloud': ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'amazon web services'],
            'devops': ['devops', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform'],
            'web development': ['web development', 'html', 'css', 'frontend', 'backend', 'full stack'],
            'database': ['database', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql'],
            'security': ['security', 'cybersecurity', 'ethical hacking', 'penetration testing'],
            'mobile': ['mobile', 'android', 'ios', 'react native', 'flutter', 'swift'],
        }
        
        # Count courses by topic
        topic_counts = {topic: 0 for topic in topic_keywords.keys()}
        
        for enrollment in enrollments:
            if not enrollment.course:
                continue
            
            course_text = f"{enrollment.course.title} {enrollment.course.description or ''}".lower()
            
            # Check which topics this course matches
            for topic, keywords in topic_keywords.items():
                if any(keyword in course_text for keyword in keywords):
                    topic_counts[topic] += 1
        
        # Find the dominant topic (most courses taken)
        if topic_counts and max(topic_counts.values()) > 0:
            dominant_topic = max(topic_counts, key=topic_counts.get)
            dominant_keywords = topic_keywords[dominant_topic]
            
            # Get all available courses
            all_courses = self.course_repo.get_all(skip=0, limit=1000)
            
            # Filter courses that match the dominant topic and user hasn't taken
            recommended_courses = []
            for course in all_courses:
                if course.id in enrolled_course_ids:
                    continue  # Skip already enrolled courses
                
                course_text = f"{course.title} {course.description or ''}".lower()
                # Check if course matches dominant topic keywords
                if any(keyword in course_text for keyword in dominant_keywords):
                    recommended_courses.append(course)
            
            # If we found recommendations, return them
            if recommended_courses:
                return [
                    {
                        "title": c.title,
                        "description": c.description or "",
                        "id": c.id,
                        "course_type": c.course_type.value,
                        "external_url": c.external_url
                    }
                    for c in recommended_courses[:5]  # Return top 5
                ]
        
        # Fallback 1: Use category-based recommendations (existing logic)
        category_counts = {}
        for enrollment in enrollments:
            if enrollment.course and enrollment.course.category:
                category = enrollment.course.category
                category_counts[category] = category_counts.get(category, 0) + 1
        
        if category_counts:
            # Get category with max count
            max_category = max(category_counts, key=category_counts.get)
            # Get courses from that category
            all_courses = self.course_repo.get_all(skip=0, limit=1000)
            recommended_courses = [
                c for c in all_courses 
                if c.category == max_category and c.id not in enrolled_course_ids
            ][:5]
            
            if recommended_courses:
                return [
                    {
                        "title": c.title,
                        "description": c.description or "",
                        "id": c.id,
                        "course_type": c.course_type.value,
                        "external_url": c.external_url
                    }
                    for c in recommended_courses
                ]
        
        # Fallback 2: Get any courses user hasn't taken
        all_courses = self.course_repo.get_all(skip=0, limit=1000)
        new_courses = [c for c in all_courses if c.id not in enrolled_course_ids][:5]
        if new_courses:
            return [
                {
                    "title": c.title,
                    "description": c.description or "",
                    "id": c.id,
                    "course_type": c.course_type.value,
                    "external_url": c.external_url
                }
                for c in new_courses
            ]
        
        # Final fallback: get any courses
        courses = self.course_repo.get_all(skip=0, limit=5)
        return [
            {
                "title": c.title,
                "description": c.description or "",
                "id": c.id,
                "course_type": c.course_type.value,
                "external_url": c.external_url
            }
            for c in courses
        ]

    def delete_enrollment(self, enrollment_id: int, user_id: int) -> bool:
        """Delete enrollment if auto_enrolled and NOT_STARTED"""
        enrollment = self.enrollment_repo.get(enrollment_id)
        if not enrollment or enrollment.user_id != user_id:
            return False
        
        # Only allow deletion if auto_enrolled and NOT_STARTED
        if enrollment.auto_enrolled and enrollment.progress_state == ProgressState.NOT_STARTED:
            return self.enrollment_repo.delete(enrollment_id)
        return False
