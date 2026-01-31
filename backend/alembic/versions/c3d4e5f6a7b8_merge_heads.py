"""merge_heads

Revision ID: c3d4e5f6a7b8
Revises: 721fa548863b, b2c3d4e5f6a7
Create Date: 2026-01-31

Merges multiple alembic heads into one so 'alembic upgrade head' works.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = ('721fa548863b', 'b2c3d4e5f6a7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
