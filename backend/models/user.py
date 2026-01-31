from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"
    


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    job_title = Column(String, nullable=True)  # Current job role for career mentor
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    appraisals = relationship("Appraisal", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    user_widgets = relationship("UserWidget", back_populates="user")
    career_profile = relationship("CareerProfile", back_populates="user", uselist=False)
    user_skills = relationship("UserSkill", back_populates="user")
