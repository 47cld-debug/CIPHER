from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from repositories.career_repository import GoalRepository, AppraisalRepository, CareerProfileRepository
from repositories.learning_repository import EnrollmentRepository
from models.career import GoalStatus, CareerProfile
from models.learning import ProgressState


class CareerService:
    def __init__(self, db: Session):
        self.goal_repo = GoalRepository(db)
        self.appraisal_repo = AppraisalRepository(db)
        self.career_profile_repo = CareerProfileRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.db = db

    def get_user_goals(self, user_id: int) -> List:
        """Get user goals"""
        return self.goal_repo.get_by_user(user_id)

    def get_user_appraisals(self, user_id: int) -> List:
        """Get user appraisals"""
        return self.appraisal_repo.get_by_user(user_id)

    def get_career_summary(self, user_id: int) -> dict:
        """Get career summary for dashboard (path, metrics, achievements count)."""
        profile = self.career_profile_repo.get_by_user_id(user_id)
        if not profile:
            profile = CareerProfile(
                user_id=user_id,
                current_level="Developer",
                next_level="Senior Developer",
                progress_pct=80,
                years_experience=5,
                company_years=2,
                level_badge="Level 4",
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)

        goals = self.goal_repo.get_by_user(user_id)
        enrollments = self.enrollment_repo.get_by_user(user_id)
        completed_goals = [g for g in goals if g.status == GoalStatus.COMPLETED]
        completed_courses = [e for e in enrollments if e.progress_state == ProgressState.COMPLETED]
        achievements_count = len(completed_goals) + len(completed_courses)
        current_year = datetime.utcnow().year
        achievements_this_year = sum(
            1 for g in completed_goals if g.created_at and g.created_at.year == current_year
        ) + sum(
            1 for e in completed_courses if e.enrolled_at and e.enrolled_at.year == current_year
        )

        path_label = " → ".join(
            filter(None, [profile.current_level, profile.next_level, "Engineering Manager"])
        ) if profile.current_level or profile.next_level else "Developer → Senior Developer → Team Lead"

        return {
            "path_label": path_label,
            "current_level": profile.current_level,
            "next_level": profile.next_level,
            "progress_pct": profile.progress_pct,
            "level_badge": profile.level_badge,
            "years_experience": profile.years_experience,
            "company_years": profile.company_years,
            "achievements_count": achievements_count,
            "achievements_this_year": achievements_this_year,
        }

    def get_user_skills(self, user_id: int) -> List[dict]:
        """Get skills from completed courses (technical & soft)."""
        enrollments = self.enrollment_repo.get_by_user(user_id)
        completed = [e for e in enrollments if e.progress_state == ProgressState.COMPLETED]
        seen = set()
        skills = []
        for e in completed:
            if not e.course or not hasattr(e.course, "course_skills"):
                continue
            for cs in e.course.course_skills:
                if cs.skill and cs.skill.id not in seen:
                    seen.add(cs.skill.id)
                    skills.append({
                        "id": cs.skill.id,
                        "name": cs.skill.name,
                        "category": cs.skill.category.value if hasattr(cs.skill.category, "value") else str(cs.skill.category),
                    })
        return skills

    def get_user_achievements(self, user_id: int) -> List[dict]:
        """Get achievements (completed goals + completed courses)."""
        goals = self.goal_repo.get_by_user(user_id)
        enrollments = self.enrollment_repo.get_by_user(user_id)
        items = []
        for g in goals:
            if g.status == GoalStatus.COMPLETED:
                items.append({
                    "title": g.title,
                    "date": g.target_date.isoformat() if g.target_date else (g.created_at.isoformat() if g.created_at else None),
                    "type": "goal",
                })
        for e in enrollments:
            if e.progress_state == ProgressState.COMPLETED and e.course:
                items.append({
                    "title": e.course.title,
                    "date": e.enrolled_at.isoformat() if e.enrolled_at else None,
                    "type": "course",
                })
        items.sort(key=lambda x: x["date"] or "", reverse=True)
        return items[:50]
