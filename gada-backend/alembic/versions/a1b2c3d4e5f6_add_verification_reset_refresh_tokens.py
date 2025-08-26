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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Add columns to users table only if they don't already exist
    user_columns = {col['name'] for col in inspector.get_columns('users')}
    if 'email_verified' not in user_columns:
        op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default=sa.text('0'), nullable=False))
    if 'email_verification_token' not in user_columns:
        op.add_column('users', sa.Column('email_verification_token', sa.String(), nullable=True))
    if 'email_verification_sent_at' not in user_columns:
        op.add_column('users', sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True))
    if 'password_reset_token' not in user_columns:
        op.add_column('users', sa.Column('password_reset_token', sa.String(), nullable=True))
    if 'password_reset_sent_at' not in user_columns:
        op.add_column('users', sa.Column('password_reset_sent_at', sa.DateTime(), nullable=True))

    # Refresh tokens table - create only if not exists
    tables = set(inspector.get_table_names())
    if 'refresh_tokens' not in tables:
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
    else:
        # Ensure indexes exist (skip if already present)
        existing_indexes = {idx['name'] for idx in inspector.get_indexes('refresh_tokens')}
        if 'ix_refresh_tokens_user_id' not in existing_indexes:
            op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
        if 'ix_refresh_tokens_token' not in existing_indexes:
            op.create_index('ix_refresh_tokens_token', 'refresh_tokens', ['token'], unique=True)
        if 'ix_refresh_tokens_expires_at' not in existing_indexes:
            op.create_index('ix_refresh_tokens_expires_at', 'refresh_tokens', ['expires_at'])
        if 'ix_refresh_tokens_revoked' not in existing_indexes:
            op.create_index('ix_refresh_tokens_revoked', 'refresh_tokens', ['revoked'])

def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if 'refresh_tokens' in tables:
        op.drop_table('refresh_tokens')
    # Drop columns only if they exist
    user_columns = {col['name'] for col in inspector.get_columns('users')}
    if 'password_reset_sent_at' in user_columns:
        op.drop_column('users', 'password_reset_sent_at')
    if 'password_reset_token' in user_columns:
        op.drop_column('users', 'password_reset_token')
    if 'email_verification_sent_at' in user_columns:
        op.drop_column('users', 'email_verification_sent_at')
    if 'email_verification_token' in user_columns:
        op.drop_column('users', 'email_verification_token')
    if 'email_verified' in user_columns:
        op.drop_column('users', 'email_verified')
