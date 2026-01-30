from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class CourseType(str, enum.Enum):
    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"


class ProgressState(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    COMPLETED = "COMPLETED"


class EnrollmentStatus(str, enum.Enum):
    ENROLLED = "ENROLLED"
    COMPLETED = "COMPLETED"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class SkillCategory(str, enum.Enum):
    TECHNICAL = "TECHNICAL"
    SOFT = "SOFT"


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    skill_level = Column(String, nullable=True)
    duration = Column(Float, nullable=True)  # in hours
    course_type = Column(Enum(CourseType), nullable=False)
    provider_name = Column(String, nullable=True)  # For external courses
    external_url = Column(String, nullable=True)  # For external courses
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    enrollments = relationship("Enrollment", back_populates="course")
    course_skills = relationship("CourseSkill", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED, nullable=False)
    progress_state = Column(Enum(ProgressState), default=ProgressState.NOT_STARTED, nullable=False)
    auto_enrolled = Column(Boolean, default=False, nullable=False)  # True if enrolled from AI chatbot
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    certificate = relationship("Certificate", back_populates="enrollment", uselist=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False, unique=True)
    file_url = Column(String, nullable=False)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    enrollment = relationship("Enrollment", back_populates="certificate")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(Enum(SkillCategory), nullable=False)

    # Relationships
    course_skills = relationship("CourseSkill", back_populates="skill")


class CourseSkill(Base):
    __tablename__ = "course_skills"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)

    # Relationships
    course = relationship("Course", back_populates="course_skills")
    skill = relationship("Skill", back_populates="course_skills")
