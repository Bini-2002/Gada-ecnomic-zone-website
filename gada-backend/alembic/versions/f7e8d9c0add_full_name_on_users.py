"""add full_name column on users

Revision ID: f7e8d9c0add
Revises: a1b2c3d4e5f6
Create Date: 2025-09-19 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f7e8d9c0add'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {col['name'] for col in inspector.get_columns('users')}
    if 'full_name' not in user_columns:
        op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {col['name'] for col in inspector.get_columns('users')}
    if 'full_name' in user_columns:
        op.drop_column('users', 'full_name')
