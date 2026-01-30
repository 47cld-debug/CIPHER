"""Add wellness initiative session fields

Revision ID: a1b2c3d4e5f6
Revises: 4c9477d6108b
Create Date: 2026-01-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '4c9477d6108b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('initiatives', sa.Column('session_date', sa.Date(), nullable=True))
    op.add_column('initiatives', sa.Column('session_time', sa.String(), nullable=True))
    op.add_column('initiatives', sa.Column('trainer_name', sa.String(), nullable=True))
    op.add_column('initiatives', sa.Column('total_slots', sa.Integer(), nullable=True))
    op.add_column('initiatives', sa.Column('location', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('initiatives', 'location')
    op.drop_column('initiatives', 'total_slots')
    op.drop_column('initiatives', 'trainer_name')
    op.drop_column('initiatives', 'session_time')
    op.drop_column('initiatives', 'session_date')
