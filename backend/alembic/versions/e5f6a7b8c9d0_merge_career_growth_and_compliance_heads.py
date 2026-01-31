"""Merge career growth and compliance heads

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9, bbc188af9377
Create Date: 2026-01-31

Merges d4e5f6a7b8c9 (career growth) and bbc188af9377 (compliance documents) into one head.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = ('d4e5f6a7b8c9', 'bbc188af9377')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
