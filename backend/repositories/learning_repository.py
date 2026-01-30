from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.learning import Course, Enrollment, Certificate, Skill, CourseSkill
from models.learning import CourseType, ProgressState
from repositories.base import BaseRepository


class CourseRepository(BaseRepository[Course]):
    def __init__(self, db: Session):
        super().__init__(Course, db)

    def get_by_type(self, course_type: CourseType, skip: int = 0, limit: int = 100) -> List[Course]:
        return self.db.query(Course).filter(
            Course.course_type == course_type
        ).offset(skip).limit(limit).all()

    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[Course]:
        return self.db.query(Course).filter(
            Course.title.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()


class EnrollmentRepository(BaseRepository[Enrollment]):
    def __init__(self, db: Session):
        super().__init__(Enrollment, db)

    def get_by_user(self, user_id: int) -> List[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.user_id == user_id).all()

    def get_by_user_and_course(self, user_id: int, course_id: int) -> Optional[Enrollment]:
        return self.db.query(Enrollment).filter(
            and_(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        ).first()

    def update_progress(self, enrollment_id: int, progress_state: ProgressState) -> Optional[Enrollment]:
        enrollment = self.get(enrollment_id)
        if enrollment:
            enrollment.progress_state = progress_state
            if progress_state == ProgressState.COMPLETED:
                enrollment.status = "COMPLETED"
            return self.update(enrollment)
        return None


class CertificateRepository(BaseRepository[Certificate]):
    def __init__(self, db: Session):
        super().__init__(Certificate, db)

    def get_by_enrollment(self, enrollment_id: int) -> Optional[Certificate]:
        return self.db.query(Certificate).filter(
            Certificate.enrollment_id == enrollment_id
        ).first()


class SkillRepository(BaseRepository[Skill]):
    def __init__(self, db: Session):
        super().__init__(Skill, db)

    def get_by_name(self, name: str) -> Optional[Skill]:
        return self.db.query(Skill).filter(Skill.name == name).first()
