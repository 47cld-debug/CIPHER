from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class GoalStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class AppraisalStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    REVIEWED = "REVIEWED"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(Date, nullable=True)
    status = Column(Enum(GoalStatus), default=GoalStatus.PENDING, nullable=False)
    progress = Column(Integer, nullable=True)  # 0-100 percentage
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="goals")


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    current_level = Column(String, nullable=True)  # e.g. "Senior Developer"
    next_level = Column(String, nullable=True)   # e.g. "Team Lead"
    progress_pct = Column(Integer, nullable=True)  # 0-100 towards next level
    years_experience = Column(Integer, nullable=True)
    company_years = Column(Integer, nullable=True)
    level_badge = Column(String, nullable=True)    # e.g. "Level 5"

    # Relationships
    user = relationship("User", back_populates="career_profile")


class Appraisal(Base):
    __tablename__ = "appraisals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period = Column(String, nullable=False)
    self_review = Column(Text, nullable=True)
    manager_feedback = Column(Text, nullable=True)
    status = Column(Enum(AppraisalStatus), default=AppraisalStatus.DRAFT, nullable=False)

    # Relationships
    user = relationship("User", back_populates="appraisals")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    ai_suggestions = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="feedbacks")
