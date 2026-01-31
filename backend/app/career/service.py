from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from repositories.career_repository import GoalRepository, AppraisalRepository, CareerProfileRepository
from repositories.learning_repository import (
    EnrollmentRepository,
    SkillRepository,
    UserSkillRepository,
)
from models.career import GoalStatus, CareerProfile
from models.learning import ProgressState, EnrollmentStatus
from models.user import User
from services.openai_service import openai_service

# Company roles for AI mentor (static list; required_skills = skill names)
COMPANY_ROLES = [
    {"name": "Senior Frontend Engineer", "required_skills": ["React", "System Design", "Performance Optimization", "API Integration"]},
    {"name": "UI Architect", "required_skills": ["React", "System Design", "Leadership", "Performance Optimization"]},
    {"name": "Full Stack Developer", "required_skills": ["Python", "React", "API Integration", "System Design"]},
    {"name": "Team Lead", "required_skills": ["Leadership", "Communication", "System Design"]},
    {"name": "Data Engineer", "required_skills": ["Python", "Data Analysis", "API Integration"]},
]

PROGRESS_STATE_NUMERIC = {
    ProgressState.NOT_STARTED: 0.0,
    ProgressState.LOW: 0.25,
    ProgressState.MEDIUM: 0.5,
    ProgressState.HIGH: 0.75,
    ProgressState.COMPLETED: 1.0,
}

TARGET_CERT_COUNT_FOR_FULL = 5


class CareerService:
    def __init__(self, db: Session):
        self.goal_repo = GoalRepository(db)
        self.appraisal_repo = AppraisalRepository(db)
        self.career_profile_repo = CareerProfileRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.skill_repo = SkillRepository(db)
        self.user_skill_repo = UserSkillRepository(db)
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

    def get_growth_summary(self, user_id: int) -> Dict[str, Any]:
        """Career growth summary: goals_tab (in-progress courses), skills_tab, achievements_tab, progress_pct, next_target_role."""
        enrollments = self.enrollment_repo.get_by_user(user_id)

        # Goals tab: courses started but not completed
        goals_tab = []
        for e in enrollments:
            if e.status != EnrollmentStatus.COMPLETED and e.progress_state != ProgressState.COMPLETED:
                goals_tab.append({
                    "enrollment_id": e.id,
                    "course_id": e.course_id,
                    "course_title": e.course.title if e.course else "",
                    "progress_state": e.progress_state.value if e.progress_state else "NOT_STARTED",
                })

        # Skills tab: existing, from completed courses, from certifications
        existing_skills = self.user_skill_repo.get_skills_for_user(user_id)
        from_courses = self.skill_repo.get_skills_for_user_from_completed_courses(user_id)
        from_certs = self.skill_repo.get_skills_for_user_from_certifications(user_id)
        skills_tab = {
            "existing": [{"id": s.id, "name": s.name, "category": s.category.value if hasattr(s.category, "value") else str(s.category)} for s in existing_skills],
            "from_courses": [{"id": s.id, "name": s.name, "category": s.category.value if hasattr(s.category, "value") else str(s.category)} for s in from_courses],
            "from_certs": [{"id": s.id, "name": s.name, "category": s.category.value if hasattr(s.category, "value") else str(s.category)} for s in from_certs],
        }

        # Achievements tab: only completed certifications (enrollment has certificate)
        achievements_tab = []
        for e in enrollments:
            if not e.certificate or not e.course:
                continue
            achievements_tab.append({
                "certification_name": e.course.title,
                "issuing_organization": e.course.provider_name or "Internal",
                "date_completed": e.certificate.uploaded_at.isoformat() if e.certificate.uploaded_at else None,
            })

        # Progress %: 40% skill match + 30% certs + 30% ongoing courses
        next_target_role = COMPANY_ROLES[0]["name"] if COMPANY_ROLES else None
        all_user_skill_names = set()
        for s in existing_skills:
            all_user_skill_names.add(s.name)
        for s in from_courses:
            all_user_skill_names.add(s.name)
        for s in from_certs:
            all_user_skill_names.add(s.name)

        required_for_role = []
        if next_target_role and COMPANY_ROLES:
            for r in COMPANY_ROLES:
                if r.get("name") == next_target_role:
                    required_for_role = list(r.get("required_skills", []))
                    break
        skill_match_pct = 0.0
        if required_for_role:
            matched = sum(1 for sk in required_for_role if sk in all_user_skill_names)
            skill_match_pct = (matched / len(required_for_role)) * 40.0
        else:
            skill_match_pct = 0.0

        cert_count = len(achievements_tab)
        cert_pct = min(1.0, cert_count / TARGET_CERT_COUNT_FOR_FULL) * 30.0

        ongoing = [e for e in enrollments if e.progress_state != ProgressState.COMPLETED]
        if ongoing:
            avg_progress = sum(PROGRESS_STATE_NUMERIC.get(e.progress_state, 0.0) for e in ongoing) / len(ongoing)
            ongoing_pct = avg_progress * 30.0
        else:
            ongoing_pct = 0.0

        progress_pct = round(skill_match_pct + cert_pct + ongoing_pct, 1)

        return {
            "goals_tab": goals_tab,
            "skills_tab": skills_tab,
            "achievements_tab": achievements_tab,
            "progress_pct": progress_pct,
            "next_target_role": next_target_role,
        }

    async def get_mentor_suggestions(self, user_id: int, user: User) -> Dict[str, str]:
        """AI career mentor: suggestions and skill gaps."""
        appraisals = self.appraisal_repo.get_by_user(user_id)
        latest_appraisal = appraisals[0] if appraisals else None
        performance_rating = latest_appraisal.performance_rating if (latest_appraisal and getattr(latest_appraisal, "performance_rating", None)) else "Not specified"

        existing_skills = self.user_skill_repo.get_skills_for_user(user_id)
        from_courses = self.skill_repo.get_skills_for_user_from_completed_courses(user_id)
        from_certs = self.skill_repo.get_skills_for_user_from_certifications(user_id)
        user_skills = list({s.name for s in existing_skills} | {s.name for s in from_courses} | {s.name for s in from_certs})

        user_profile = {
            "job_title": user.job_title or "Not specified",
            "performance_rating": performance_rating,
            "full_name": user.full_name or "",
        }
        return await openai_service.get_career_suggestions(user_profile, COMPANY_ROLES, user_skills)
