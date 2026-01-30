from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: str
    progress: Optional[int] = None  # 0-100
    created_at: datetime

    class Config:
        from_attributes = True


class AppraisalResponse(BaseModel):
    id: int
    period: str
    self_review: Optional[str] = None
    manager_feedback: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class CareerSummaryResponse(BaseModel):
    path_label: str  # e.g. "Senior Developer → Team Lead → Engineering Manager"
    current_level: Optional[str] = None
    next_level: Optional[str] = None
    progress_pct: Optional[int] = None  # 0-100 towards next level
    level_badge: Optional[str] = None
    years_experience: Optional[int] = None
    company_years: Optional[int] = None
    achievements_count: int
    achievements_this_year: int


class SkillResponse(BaseModel):
    id: int
    name: str
    category: str  # TECHNICAL | SOFT


class AchievementItem(BaseModel):
    title: str
    date: Optional[str] = None
    type: str  # "goal" | "course"
