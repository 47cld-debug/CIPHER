"""Career profile and goal progress

Revision ID: b2c3d4e5f6a7
Revises: 44d2aecc9845
Create Date: 2026-01-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = '44d2aecc9845'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('goals', sa.Column('progress', sa.Integer(), nullable=True))
    op.create_table(
        'career_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_level', sa.String(), nullable=True),
        sa.Column('next_level', sa.String(), nullable=True),
        sa.Column('progress_pct', sa.Integer(), nullable=True),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('company_years', sa.Integer(), nullable=True),
        sa.Column('level_badge', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_career_profiles_id'), 'career_profiles', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_career_profiles_id'), table_name='career_profiles')
    op.drop_table('career_profiles')
    op.drop_column('goals', 'progress')
