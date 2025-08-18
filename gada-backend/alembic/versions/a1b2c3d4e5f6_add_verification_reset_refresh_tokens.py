"""add verification & reset columns and refresh tokens table

Revision ID: a1b2c3d4e5f6
Revises: 351bbc3affca
Create Date: 2025-08-18 12:10:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '351bbc3affca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # New user columns (nullable except email_verified) so SQLite simple add_column works
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('email_verification_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('password_reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('password_reset_sent_at', sa.DateTime(), nullable=True))
    # Refresh tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, index=True),
        sa.Column('token', sa.String(), unique=True, index=True),
        sa.Column('expires_at', sa.DateTime(), index=True),
        sa.Column('revoked', sa.Boolean(), default=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    # Explicit indexes
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_token', 'refresh_tokens', ['token'], unique=True)
    op.create_index('ix_refresh_tokens_expires_at', 'refresh_tokens', ['expires_at'])
    op.create_index('ix_refresh_tokens_revoked', 'refresh_tokens', ['revoked'])

def downgrade() -> None:
    op.drop_table('refresh_tokens')
    op.drop_column('users', 'password_reset_sent_at')
    op.drop_column('users', 'password_reset_token')
    op.drop_column('users', 'email_verification_sent_at')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verified')
