from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class SessionStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


class Initiative(Base):
    __tablename__ = "initiatives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    # Session-level fields for bookable slot display
    session_date = Column(Date, nullable=True)
    session_time = Column(String, nullable=True)  # e.g. "10:00 AM - 11:00 AM"
    trainer_name = Column(String, nullable=True)
    total_slots = Column(Integer, nullable=True, default=20)
    location = Column(String, nullable=True)

    # Relationships
    sessions = relationship("Session", back_populates="initiative")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING, nullable=False)

    # Relationships
    initiative = relationship("Initiative", back_populates="sessions")
    user = relationship("User", back_populates="sessions")
