from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import date
from models.user import User
from models.learning import Enrollment, Course, ProgressState
from models.career import Goal, GoalStatus
from models.compliance import Reminder
from models.wellness import Initiative, Session as WellnessSessionModel
from repositories.dashboard_repository import UserWidgetRepository
from repositories.learning_repository import EnrollmentRepository, CourseRepository
from repositories.career_repository import GoalRepository
from repositories.compliance_repository import ReminderRepository
from repositories.wellness_repository import InitiativeRepository, SessionRepository
from app.dashboard.schemas import (
    LearningProgressData,
    UpcomingCoursesData,
    CareerGoalsData,
    ComplianceRemindersData,
    WellnessInitiativesData
)


class DashboardService:
    def __init__(self, db: Session):
        self.user_widget_repo = UserWidgetRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.course_repo = CourseRepository(db)
        self.goal_repo = GoalRepository(db)
        self.reminder_repo = ReminderRepository(db)
        self.initiative_repo = InitiativeRepository(db)
        self.wellness_session_repo = SessionRepository(db)
        self.db = db

    def get_user_widgets(self, user_id: int) -> List:
        """Get user's dashboard widgets with real data"""
        user_widgets = self.user_widget_repo.get_by_user(user_id)
        
        # Enrich each widget with its data
        enriched_widgets = []
        for user_widget in user_widgets:
            widget_data = self._get_widget_data(user_widget.widget.type, user_id, user_widget.widget.config)
            enriched_widgets.append({
                "id": user_widget.id,
                "widget_id": user_widget.widget_id,
                "position": user_widget.position,
                "enabled": user_widget.enabled,
                "widget": {
                    "id": user_widget.widget.id,
                    "name": user_widget.widget.name,
                    "type": user_widget.widget.type,
                    "config": user_widget.widget.config
                },
                "data": widget_data
            })
        
        return enriched_widgets

    def _get_widget_data(self, widget_type: str, user_id: int, config: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Get data for a specific widget type"""
        if widget_type == "learning_progress":
            return self._get_learning_progress_data(user_id, config)
        elif widget_type == "upcoming_courses":
            return self._get_upcoming_courses_data(user_id, config)
        elif widget_type == "career_goals":
            return self._get_career_goals_data(user_id, config)
        elif widget_type == "compliance_reminders":
            return self._get_compliance_reminders_data(user_id, config)
        elif widget_type == "wellness_initiatives":
            return self._get_wellness_initiatives_data(user_id, config)
        return None

    def _get_learning_progress_data(self, user_id: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get learning progress data for widget"""
        enrollments = self.enrollment_repo.get_by_user(user_id)
        
        completed = sum(1 for e in enrollments if e.progress_state == ProgressState.COMPLETED)
        in_progress = sum(1 for e in enrollments if e.progress_state in [ProgressState.LOW, ProgressState.MEDIUM, ProgressState.HIGH])
        not_started = sum(1 for e in enrollments if e.progress_state == ProgressState.NOT_STARTED)
        total = len(enrollments)
        
        # Get recent courses (limit from config or default 5)
        limit = config.get("limit", 5) if config else 5
        recent_courses = []
        for enrollment in enrollments[:limit]:
            course = enrollment.course
            recent_courses.append({
                "id": course.id,
                "title": course.title,
                "progress": enrollment.progress_state.value,
                "category": course.category
            })
        
        return {
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "total": total,
            "recent_courses": recent_courses
        }

    def _get_upcoming_courses_data(self, user_id: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get upcoming/recommended courses for widget"""
        # Get all enrollments to find courses user hasn't enrolled in
        enrollments = self.enrollment_repo.get_by_user(user_id)
        enrolled_course_ids = {e.course_id for e in enrollments}
        
        # Get courses not enrolled in
        all_courses = self.course_repo.get_all()
        upcoming_courses = [c for c in all_courses if c.id not in enrolled_course_ids]
        
        limit = config.get("limit", 3) if config else 3
        courses_data = []
        for course in upcoming_courses[:limit]:
            courses_data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "category": course.category,
                "course_type": course.course_type.value,
                "provider_name": course.provider_name,
                "duration": course.duration
            })
        
        return {"courses": courses_data}

    def _get_career_goals_data(self, user_id: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get career goals data for widget"""
        all_goals = self.goal_repo.get_by_user(user_id)
        
        # Filter based on config
        if config and config.get("show_active_only"):
            goals = [g for g in all_goals if g.status in [GoalStatus.PENDING, GoalStatus.IN_PROGRESS]]
        else:
            goals = all_goals
        
        active_goals = sum(1 for g in goals if g.status in [GoalStatus.PENDING, GoalStatus.IN_PROGRESS])
        completed_goals = sum(1 for g in goals if g.status == GoalStatus.COMPLETED)
        
        limit = config.get("limit", 3) if config else 3
        goals_data = []
        for goal in goals[:limit]:
            goals_data.append({
                "id": goal.id,
                "title": goal.title,
                "description": goal.description,
                "status": goal.status.value,
                "target_date": goal.target_date.isoformat() if goal.target_date else None
            })
        
        return {
            "active_goals": active_goals,
            "completed_goals": completed_goals,
            "goals": goals_data
        }

    def _get_compliance_reminders_data(self, user_id: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get compliance reminders data for widget"""
        reminders = self.reminder_repo.get_by_user(user_id)
        
        # Filter pending if config says so
        if config and config.get("show_pending"):
            reminders = [r for r in reminders if not r.completed]
        
        pending = sum(1 for r in reminders if not r.completed)
        
        limit = config.get("limit", 3) if config else 3
        reminders_data = []
        for reminder in reminders[:limit]:
            reminders_data.append({
                "id": reminder.id,
                "type": reminder.type,
                "message": reminder.message,
                "due_date": reminder.due_date.isoformat() if reminder.due_date else None,
                "completed": reminder.completed
            })
        
        return {
            "pending": pending,
            "reminders": reminders_data
        }

    def _get_wellness_initiatives_data(self, user_id: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get wellness initiatives data for widget"""
        all_initiatives = self.initiative_repo.get_all()
        
        # Filter to available/upcoming initiatives
        today = date.today()
        available_initiatives = [
            i for i in all_initiatives
            if (i.start_date is None or i.start_date <= today) and (i.end_date is None or i.end_date >= today)
        ]
        
        limit = config.get("limit", 3) if config else 3
        initiatives_data = []
        for initiative in available_initiatives[:limit]:
            initiatives_data.append({
                "id": initiative.id,
                "title": initiative.title,
                "description": initiative.description,
                "category": initiative.category,
                "start_date": initiative.start_date.isoformat() if initiative.start_date else None,
                "end_date": initiative.end_date.isoformat() if initiative.end_date else None
            })
        
        return {
            "available": len(available_initiatives),
            "initiatives": initiatives_data
        }
