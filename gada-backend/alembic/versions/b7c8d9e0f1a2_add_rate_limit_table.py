"""add rate limit table

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2025-08-18 13:05:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b7c8d9e0f1a2'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if 'rate_limits' not in tables:
        op.create_table(
            'rate_limits',
            sa.Column('id', sa.Integer, primary_key=True),
            sa.Column('scope', sa.String, index=True),
            sa.Column('identifier', sa.String, index=True),
            sa.Column('window_start', sa.DateTime, index=True),
            sa.Column('count', sa.Integer, default=0)
        )
        # Create indexes explicitly
        op.create_index('ix_rate_limits_scope', 'rate_limits', ['scope'])
        op.create_index('ix_rate_limits_identifier', 'rate_limits', ['identifier'])
        op.create_index('ix_rate_limits_window_start', 'rate_limits', ['window_start'])
    else:
        # Use SQLite PRAGMA to get reliable index list
        try:
            result = bind.exec_driver_sql("PRAGMA index_list('rate_limits')")
            existing_indexes = {row[1] for row in result.fetchall()}
        except Exception:
            # Fallback to SQLAlchemy inspector
            existing_indexes = {idx['name'] for idx in inspector.get_indexes('rate_limits')}

        if 'ix_rate_limits_scope' not in existing_indexes:
            op.create_index('ix_rate_limits_scope', 'rate_limits', ['scope'])
        if 'ix_rate_limits_identifier' not in existing_indexes:
            op.create_index('ix_rate_limits_identifier', 'rate_limits', ['identifier'])
        if 'ix_rate_limits_window_start' not in existing_indexes:
            op.create_index('ix_rate_limits_window_start', 'rate_limits', ['window_start'])

def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'rate_limits' in set(inspector.get_table_names()):
        op.drop_table('rate_limits')
