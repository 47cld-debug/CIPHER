"""Career growth: job_title, performance_rating, user_skills

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-01-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('job_title', sa.String(), nullable=True))
    op.add_column('appraisals', sa.Column('performance_rating', sa.String(), nullable=True))
    op.create_table(
        'user_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'skill_id', name='uq_user_skills_user_skill')
    )
    op.create_index(op.f('ix_user_skills_id'), 'user_skills', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_skills_id'), table_name='user_skills')
    op.drop_table('user_skills')
    op.drop_column('appraisals', 'performance_rating')
    op.drop_column('users', 'job_title')
