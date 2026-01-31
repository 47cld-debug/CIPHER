from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date
from models.payroll import PayrollStatus


class PayrollResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    pay_period_start: date
    pay_period_end: date
    
    # Earnings
    basic_salary: float
    house_rent_allowance: float
    leave_travel_allowance: float
    city_allowance: float
    performance_pay: float
    night_shift_allowance: float
    miscellaneous: float
    
    # Deductions
    provident_fund: float
    professional_tax: float
    es_is_deduction: float
    
    # Totals
    total_earnings: float
    total_deductions: float
    net_salary: float
    
    status: PayrollStatus
    generated_at: date
    file_url: Optional[str] = None

    class Config:
        from_attributes = True


class PayrollSummaryResponse(BaseModel):
    payrolls: List[PayrollResponse]
    latest_payroll: Optional[PayrollResponse] = None
    total_earnings_ytd: float = 0.0
    total_deductions_ytd: float = 0.0
    net_salary_ytd: float = 0.0
