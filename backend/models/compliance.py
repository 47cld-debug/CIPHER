from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    version = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    faqs = relationship("FAQ", back_populates="policy")


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)

    # Relationships
    policy = relationship("Policy", back_populates="faqs")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reminders")


class ComplianceDocument(Base):
    __tablename__ = "compliance_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    category = Column(String, nullable=False)  # HR, IT, BOTH
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    chunk_count = Column(Integer, default=0, nullable=False)
    chromadb_collection = Column(String, nullable=True)  # "hr_policies" or "it_policies" or both
    file_size = Column(Integer, nullable=True)  # Size in bytes

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by])
