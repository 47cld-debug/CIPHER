"""merge_learning_and_wellness_migrations

Revision ID: 721fa548863b
Revises: 44d2aecc9845, a1b2c3d4e5f6
Create Date: 2026-01-31 03:16:57.410355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '721fa548863b'
down_revision: Union[str, None] = ('44d2aecc9845', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
