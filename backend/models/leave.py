from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class LeaveType(str, enum.Enum):
    EARNED_LEAVE = "EARNED_LEAVE"
    CASUAL_LEAVE = "CASUAL_LEAVE"
    SICK_LEAVE = "SICK_LEAVE"
    OPTIONAL_HOLIDAY = "OPTIONAL_HOLIDAY"
    REGIONAL_HOLIDAY = "REGIONAL_HOLIDAY"
    LEAVE_WITHOUT_PAY = "LEAVE_WITHOUT_PAY"
    PATERNITY_LEAVE = "PATERNITY_LEAVE"
    MATERNITY_LEAVE = "MATERNITY_LEAVE"
    COMPENSATORY_LEAVE = "COMPENSATORY_LEAVE"
    DEATH_LEAVE = "DEATH_LEAVE"
    ELECTION_LEAVE = "ELECTION_LEAVE"


class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    number_of_days = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING, nullable=False)
    applied_at = Column(Date, server_default=func.current_date(), nullable=False)
    approved_at = Column(Date, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="leaves")
    approver = relationship("User", foreign_keys=[approved_by])


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    total_allocated = Column(Float, default=0, nullable=False)
    used = Column(Float, default=0, nullable=False)
    pending = Column(Float, default=0, nullable=False)
    year = Column(Integer, nullable=False)  # e.g., 2024

    # Relationships
    user = relationship("User", back_populates="leave_balances")
