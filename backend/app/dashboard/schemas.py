from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union


class WidgetResponse(BaseModel):
    id: int
    name: str
    type: str
    config: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class LearningProgressData(BaseModel):
    completed: int
    in_progress: int
    not_started: int
    total: int
    recent_courses: List[Dict[str, Any]] = []


class UpcomingCoursesData(BaseModel):
    courses: List[Dict[str, Any]] = []


class CareerGoalsData(BaseModel):
    active_goals: int
    completed_goals: int
    goals: List[Dict[str, Any]] = []


class ComplianceRemindersData(BaseModel):
    pending: int
    reminders: List[Dict[str, Any]] = []


class WellnessInitiativesData(BaseModel):
    available: int
    initiatives: List[Dict[str, Any]] = []


WidgetData = Union[
    LearningProgressData,
    UpcomingCoursesData,
    CareerGoalsData,
    ComplianceRemindersData,
    WellnessInitiativesData,
    Dict[str, Any]
]


class UserWidgetResponse(BaseModel):
    id: int
    widget_id: int
    position: Optional[int] = None
    enabled: bool
    widget: WidgetResponse
    data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    widgets: List[UserWidgetResponse]
