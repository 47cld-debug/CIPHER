"""
Seed Leave and Payroll dummy data.
Requires existing users - run seed_employees.py or seed_all_data.py first.
From backend directory: python scripts/seed_leave_payroll_data.py
"""
import sys
from pathlib import Path
from datetime import date, timedelta
from calendar import monthrange

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from models.user import User
from models.leave import Leave, LeaveBalance, LeaveType, LeaveStatus
from models.payroll import Payroll, PayrollStatus

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()


def seed_leave_balances():
    """Seed leave balances for all users"""
    users = db.query(User).all()
    current_year = date.today().year
    
    leave_allocations = {
        LeaveType.EARNED_LEAVE: 15.0,
        LeaveType.CASUAL_LEAVE: 12.0,
        LeaveType.SICK_LEAVE: 10.0,
        LeaveType.OPTIONAL_HOLIDAY: 2.0,
        LeaveType.REGIONAL_HOLIDAY: 2.0,
        LeaveType.LEAVE_WITHOUT_PAY: 0.0,
        LeaveType.PATERNITY_LEAVE: 5.0,
        LeaveType.MATERNITY_LEAVE: 180.0,
        LeaveType.COMPENSATORY_LEAVE: 0.0,
        LeaveType.DEATH_LEAVE: 3.0,
        LeaveType.ELECTION_LEAVE: 1.0,
    }
    
    for user in users:
        for leave_type, allocated in leave_allocations.items():
            # Check if balance already exists
            existing = db.query(LeaveBalance).filter(
                LeaveBalance.user_id == user.id,
                LeaveBalance.leave_type == leave_type,
                LeaveBalance.year == current_year
            ).first()
            
            if not existing:
                # Calculate used and pending based on existing leaves
                from sqlalchemy import extract
                used_leaves = db.query(Leave).filter(
                    Leave.user_id == user.id,
                    Leave.leave_type == leave_type,
                    Leave.status == LeaveStatus.APPROVED,
                    extract('year', Leave.start_date) == current_year
                ).all()
                used = sum(leave.number_of_days for leave in used_leaves)
                
                pending_leaves = db.query(Leave).filter(
                    Leave.user_id == user.id,
                    Leave.leave_type == leave_type,
                    Leave.status == LeaveStatus.PENDING,
                    extract('year', Leave.start_date) == current_year
                ).all()
                pending = sum(leave.number_of_days for leave in pending_leaves)
                
                balance = LeaveBalance(
                    user_id=user.id,
                    leave_type=leave_type,
                    total_allocated=allocated,
                    used=min(used, allocated),
                    pending=min(pending, allocated - used),
                    year=current_year
                )
                db.add(balance)
    
    db.commit()
    print(f"[OK] Seeded leave balances for {len(users)} users")


def seed_leaves():
    """Seed sample leave requests"""
    users = db.query(User).limit(5).all()  # Seed for first 5 users
    
    if not users:
        print("[ERROR] No users found. Please run seed_employees.py first.")
        return
    
    base_date = date.today()
    
    leaves_data = [
        {
            "leave_type": LeaveType.EARNED_LEAVE,
            "start_date": base_date - timedelta(days=30),
            "end_date": base_date - timedelta(days=28),
            "number_of_days": 3.0,
            "reason": "Family vacation",
            "status": LeaveStatus.APPROVED,
        },
        {
            "leave_type": LeaveType.SICK_LEAVE,
            "start_date": base_date - timedelta(days=15),
            "end_date": base_date - timedelta(days=15),
            "number_of_days": 1.0,
            "reason": "Fever",
            "status": LeaveStatus.APPROVED,
        },
        {
            "leave_type": LeaveType.CASUAL_LEAVE,
            "start_date": base_date + timedelta(days=5),
            "end_date": base_date + timedelta(days=5),
            "number_of_days": 1.0,
            "reason": "Personal work",
            "status": LeaveStatus.PENDING,
        },
        {
            "leave_type": LeaveType.EARNED_LEAVE,
            "start_date": base_date + timedelta(days=20),
            "end_date": base_date + timedelta(days=22),
            "number_of_days": 3.0,
            "reason": "Weekend trip",
            "status": LeaveStatus.PENDING,
        },
    ]
    
    for user in users:
        for leave_data in leaves_data:
            # Check if leave already exists
            existing = db.query(Leave).filter(
                Leave.user_id == user.id,
                Leave.start_date == leave_data["start_date"],
                Leave.leave_type == leave_data["leave_type"]
            ).first()
            
            if not existing:
                leave = Leave(
                    user_id=user.id,
                    **leave_data,
                    applied_at=base_date - timedelta(days=10)
                )
                db.add(leave)
    
    db.commit()
    print(f"[OK] Seeded sample leaves for {len(users)} users")


def seed_payrolls():
    """Seed payroll data for all users"""
    users = db.query(User).all()
    current_year = date.today().year
    current_month = date.today().month
    
    # Generate payslips for current year and next year
    for user in users:
        # Generate for current year (all months up to current month)
        for month in range(1, current_month + 1):
            year = current_year
            
            # Check if payroll already exists
            existing = db.query(Payroll).filter(
                Payroll.user_id == user.id,
                Payroll.month == month,
                Payroll.year == year
            ).first()
            
            if existing:
                continue
            
            # Calculate pay period dates
            pay_period_start = date(year, month, 1)
            # Get last day of month using calendar.monthrange
            last_day = monthrange(year, month)[1]
            pay_period_end = date(year, month, last_day)
            
            # Base salary (dummy values - adjust as needed)
            base_salary = 50000.0
            
            # Earnings
            basic_salary = base_salary * 0.5
            house_rent_allowance = base_salary * 0.2
            leave_travel_allowance = base_salary * 0.1
            city_allowance = base_salary * 0.05
            performance_pay = base_salary * 0.1 if month % 2 == 0 else 0  # Every other month
            night_shift_allowance = base_salary * 0.05 if month % 3 == 0 else 0  # Every 3rd month
            miscellaneous = base_salary * 0.02
            
            total_earnings = (
                basic_salary + house_rent_allowance + leave_travel_allowance +
                city_allowance + performance_pay + night_shift_allowance + miscellaneous
            )
            
            # Deductions
            provident_fund = total_earnings * 0.12
            professional_tax = 200.0
            es_is_deduction = total_earnings * 0.01
            
            total_deductions = provident_fund + professional_tax + es_is_deduction
            net_salary = total_earnings - total_deductions
            
            payroll = Payroll(
                user_id=user.id,
                month=month,
                year=year,
                pay_period_start=pay_period_start,
                pay_period_end=pay_period_end,
                basic_salary=basic_salary,
                house_rent_allowance=house_rent_allowance,
                leave_travel_allowance=leave_travel_allowance,
                city_allowance=city_allowance,
                performance_pay=performance_pay,
                night_shift_allowance=night_shift_allowance,
                miscellaneous=miscellaneous,
                provident_fund=provident_fund,
                professional_tax=professional_tax,
                es_is_deduction=es_is_deduction,
                total_earnings=total_earnings,
                total_deductions=total_deductions,
                net_salary=net_salary,
                status=PayrollStatus.PAID if month < current_month else PayrollStatus.PROCESSED,
                generated_at=pay_period_end
            )
            db.add(payroll)
        
        # Also generate for next year (first 3 months as sample)
        next_year = current_year + 1
        for month in range(1, 4):  # First 3 months of next year
            
            # Check if payroll already exists
            existing = db.query(Payroll).filter(
                Payroll.user_id == user.id,
                Payroll.month == month,
                Payroll.year == next_year
            ).first()
            
            if existing:
                continue
            
            # Calculate pay period dates
            pay_period_start = date(next_year, month, 1)
            # Get last day of month using calendar.monthrange
            last_day = monthrange(next_year, month)[1]
            pay_period_end = date(next_year, month, last_day)
            
            # Base salary (dummy values - adjust as needed)
            base_salary = 50000.0
            
            # Earnings
            basic_salary = base_salary * 0.5
            house_rent_allowance = base_salary * 0.2
            leave_travel_allowance = base_salary * 0.1
            city_allowance = base_salary * 0.05
            performance_pay = base_salary * 0.1 if month % 2 == 0 else 0  # Every other month
            night_shift_allowance = base_salary * 0.05 if month % 3 == 0 else 0  # Every 3rd month
            miscellaneous = base_salary * 0.02
            
            total_earnings = (
                basic_salary + house_rent_allowance + leave_travel_allowance +
                city_allowance + performance_pay + night_shift_allowance + miscellaneous
            )
            
            # Deductions
            provident_fund = total_earnings * 0.12
            professional_tax = 200.0
            es_is_deduction = total_earnings * 0.01
            
            total_deductions = provident_fund + professional_tax + es_is_deduction
            net_salary = total_earnings - total_deductions
            
            payroll = Payroll(
                user_id=user.id,
                month=month,
                year=next_year,
                pay_period_start=pay_period_start,
                pay_period_end=pay_period_end,
                basic_salary=basic_salary,
                house_rent_allowance=house_rent_allowance,
                leave_travel_allowance=leave_travel_allowance,
                city_allowance=city_allowance,
                performance_pay=performance_pay,
                night_shift_allowance=night_shift_allowance,
                miscellaneous=miscellaneous,
                provident_fund=provident_fund,
                professional_tax=professional_tax,
                es_is_deduction=es_is_deduction,
                total_earnings=total_earnings,
                total_deductions=total_deductions,
                net_salary=net_salary,
                status=PayrollStatus.DRAFT,  # Future months are draft
                generated_at=pay_period_end
            )
            db.add(payroll)
    
    db.commit()
    print(f"[OK] Seeded payroll data for {len(users)} users")


def main():
    try:
        print("Seeding Leave and Payroll data...")
        seed_leave_balances()
        seed_leaves()
        seed_payrolls()
        print("\n[SUCCESS] Leave and Payroll data seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
