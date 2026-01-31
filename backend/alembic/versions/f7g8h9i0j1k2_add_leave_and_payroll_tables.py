"""add_leave_and_payroll_tables

Revision ID: f7g8h9i0j1k2
Revises: e5f6a7b8c9d0
Create Date: 2026-01-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'f7g8h9i0j1k2'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create LeaveType enum (only if it doesn't exist)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE leavetype AS ENUM ('EARNED_LEAVE', 'CASUAL_LEAVE', 'SICK_LEAVE', 'OPTIONAL_HOLIDAY', 'REGIONAL_HOLIDAY', 'LEAVE_WITHOUT_PAY', 'PATERNITY_LEAVE', 'MATERNITY_LEAVE', 'COMPENSATORY_LEAVE', 'DEATH_LEAVE', 'ELECTION_LEAVE');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Create LeaveStatus enum (only if it doesn't exist)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE leavestatus AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Create enum types for use in columns
    leavetype_enum = postgresql.ENUM('EARNED_LEAVE', 'CASUAL_LEAVE', 'SICK_LEAVE', 'OPTIONAL_HOLIDAY', 'REGIONAL_HOLIDAY', 'LEAVE_WITHOUT_PAY', 'PATERNITY_LEAVE', 'MATERNITY_LEAVE', 'COMPENSATORY_LEAVE', 'DEATH_LEAVE', 'ELECTION_LEAVE', name='leavetype', create_type=False)
    leavestatus_enum = postgresql.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', name='leavestatus', create_type=False)
    
    # Create leaves table
    op.create_table('leaves',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('leave_type', leavetype_enum, nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('number_of_days', sa.Float(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', leavestatus_enum, nullable=False),
        sa.Column('applied_at', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('approved_at', sa.Date(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leaves_id'), 'leaves', ['id'], unique=False)
    
    # Create leave_balances table
    op.create_table('leave_balances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('leave_type', leavetype_enum, nullable=False),
        sa.Column('total_allocated', sa.Float(), nullable=False),
        sa.Column('used', sa.Float(), nullable=False),
        sa.Column('pending', sa.Float(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leave_balances_id'), 'leave_balances', ['id'], unique=False)
    
    # Create PayrollStatus enum (only if it doesn't exist)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE payrollstatus AS ENUM ('DRAFT', 'PROCESSED', 'PAID');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Create enum type for payroll status
    payrollstatus_enum = postgresql.ENUM('DRAFT', 'PROCESSED', 'PAID', name='payrollstatus', create_type=False)
    
    # Create payrolls table
    op.create_table('payrolls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('pay_period_start', sa.Date(), nullable=False),
        sa.Column('pay_period_end', sa.Date(), nullable=False),
        sa.Column('basic_salary', sa.Float(), nullable=False),
        sa.Column('house_rent_allowance', sa.Float(), nullable=False),
        sa.Column('leave_travel_allowance', sa.Float(), nullable=False),
        sa.Column('city_allowance', sa.Float(), nullable=False),
        sa.Column('performance_pay', sa.Float(), nullable=False),
        sa.Column('night_shift_allowance', sa.Float(), nullable=False),
        sa.Column('miscellaneous', sa.Float(), nullable=False),
        sa.Column('provident_fund', sa.Float(), nullable=False),
        sa.Column('professional_tax', sa.Float(), nullable=False),
        sa.Column('es_is_deduction', sa.Float(), nullable=False),
        sa.Column('total_earnings', sa.Float(), nullable=False),
        sa.Column('total_deductions', sa.Float(), nullable=False),
        sa.Column('net_salary', sa.Float(), nullable=False),
        sa.Column('status', payrollstatus_enum, nullable=False),
        sa.Column('generated_at', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('file_url', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payrolls_id'), 'payrolls', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_payrolls_id'), table_name='payrolls')
    op.drop_table('payrolls')
    op.execute("DROP TYPE payrollstatus")
    
    op.drop_index(op.f('ix_leave_balances_id'), table_name='leave_balances')
    op.drop_table('leave_balances')
    
    op.drop_index(op.f('ix_leaves_id'), table_name='leaves')
    op.drop_table('leaves')
    op.execute("DROP TYPE leavestatus")
    op.execute("DROP TYPE leavetype")
