from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, distinct
from sqlalchemy.orm import joinedload
from models.learning import Course, Enrollment, Certificate, Skill, CourseSkill, UserSkill
from models.learning import CourseType, ProgressState, EnrollmentStatus
from repositories.base import BaseRepository


class CourseRepository(BaseRepository[Course]):
    def __init__(self, db: Session):
        super().__init__(Course, db)

    def get_by_type(self, course_type: CourseType, skip: int = 0, limit: int = 100) -> List[Course]:
        return self.db.query(Course).filter(
            Course.course_type == course_type
        ).offset(skip).limit(limit).all()

    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[Course]:
        """Search courses by title, description, or category"""
        search_term = f"%{query}%"
        return self.db.query(Course).filter(
            (Course.title.ilike(search_term)) |
            (Course.description.ilike(search_term)) |
            (Course.category.ilike(search_term))
        ).offset(skip).limit(limit).all()


class EnrollmentRepository(BaseRepository[Enrollment]):
    def __init__(self, db: Session):
        super().__init__(Enrollment, db)

    def get_by_user(self, user_id: int) -> List[Enrollment]:
        from sqlalchemy.orm import joinedload
        return self.db.query(Enrollment).options(
            joinedload(Enrollment.course),
            joinedload(Enrollment.certificate)
        ).filter(Enrollment.user_id == user_id).all()

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

    def delete(self, enrollment_id: int) -> bool:
        """Delete enrollment"""
        enrollment = self.get(enrollment_id)
        if enrollment:
            self.db.delete(enrollment)
            self.db.commit()
            return True
        return False


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

    def get_skills_for_user_from_completed_courses(self, user_id: int) -> List[Skill]:
        """Distinct skills from courses where user has completed enrollment (status COMPLETED)."""
        return (
            self.db.query(Skill)
            .join(CourseSkill, CourseSkill.skill_id == Skill.id)
            .join(Course, Course.id == CourseSkill.course_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(
                Enrollment.user_id == user_id,
                Enrollment.status == EnrollmentStatus.COMPLETED,
            )
            .distinct()
            .all()
        )

    def get_skills_for_user_from_certifications(self, user_id: int) -> List[Skill]:
        """Distinct skills from courses where user has an enrollment with a certificate."""
        return (
            self.db.query(Skill)
            .join(CourseSkill, CourseSkill.skill_id == Skill.id)
            .join(Course, Course.id == CourseSkill.course_id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .join(Certificate, Certificate.enrollment_id == Enrollment.id)
            .filter(Enrollment.user_id == user_id)
            .distinct()
            .all()
        )


class UserSkillRepository(BaseRepository[UserSkill]):
    def __init__(self, db: Session):
        super().__init__(UserSkill, db)

    def get_by_user(self, user_id: int) -> List[UserSkill]:
        return (
            self.db.query(UserSkill)
            .options(joinedload(UserSkill.skill))
            .filter(UserSkill.user_id == user_id)
            .all()
        )

    def get_skills_for_user(self, user_id: int) -> List[Skill]:
        """Return Skill objects for skills the user already has (UserSkill)."""
        rows = self.get_by_user(user_id)
        return [r.skill for r in rows if r.skill]

    def exists(self, user_id: int, skill_id: int) -> bool:
        return (
            self.db.query(UserSkill)
            .filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_id == skill_id,
            )
            .first()
            is not None
        )
