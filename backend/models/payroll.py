from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class PayrollStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PROCESSED = "PROCESSED"
    PAID = "PAID"


class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    
    # Earnings
    basic_salary = Column(Float, default=0, nullable=False)
    house_rent_allowance = Column(Float, default=0, nullable=False)
    leave_travel_allowance = Column(Float, default=0, nullable=False)
    city_allowance = Column(Float, default=0, nullable=False)
    performance_pay = Column(Float, default=0, nullable=False)
    night_shift_allowance = Column(Float, default=0, nullable=False)
    miscellaneous = Column(Float, default=0, nullable=False)
    
    # Deductions
    provident_fund = Column(Float, default=0, nullable=False)
    professional_tax = Column(Float, default=0, nullable=False)
    es_is_deduction = Column(Float, default=0, nullable=False)  # ES/IS deduction
    
    # Calculated fields
    total_earnings = Column(Float, default=0, nullable=False)
    total_deductions = Column(Float, default=0, nullable=False)
    net_salary = Column(Float, default=0, nullable=False)
    
    status = Column(Enum(PayrollStatus), default=PayrollStatus.PROCESSED, nullable=False)
    generated_at = Column(Date, server_default=func.current_date(), nullable=False)
    file_url = Column(String, nullable=True)  # URL to PDF payslip if generated

    # Relationships
    user = relationship("User", back_populates="payrolls")
