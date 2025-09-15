"""add investor_proposals table

Revision ID: f0a1b2c3d4e5
Revises: d4e5f6a7
Create Date: 2025-09-15
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f0a1b2c3d4e5'
down_revision = 'd4e5f6a7'
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not table_exists('investor_proposals'):
        op.create_table(
            'investor_proposals',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('name', sa.String(), nullable=True),
            sa.Column('email', sa.String(), nullable=True),
            sa.Column('sector', sa.String(), nullable=True),
            sa.Column('phone', sa.String(), nullable=True),
            sa.Column('proposal_filename', sa.String(), nullable=True),
            sa.Column('status', sa.String(), nullable=True, server_default='submitted'),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )

    # Ensure indexes exist (id has implicit PK index)
    existing_indexes = set()
    if table_exists('investor_proposals'):
        try:
            # Prefer PRAGMA for SQLite to list indexes reliably
            if bind.dialect.name == 'sqlite':
                result = bind.exec_driver_sql("PRAGMA index_list('investor_proposals')")
                existing_indexes = {row[1] for row in result.fetchall()}
            else:
                existing_indexes = {idx['name'] for idx in inspector.get_indexes('investor_proposals')}
        except Exception:
            existing_indexes = {idx['name'] for idx in inspector.get_indexes('investor_proposals')}

    if table_exists('investor_proposals') and 'ix_investor_proposals_name' not in existing_indexes:
        op.create_index('ix_investor_proposals_name', 'investor_proposals', ['name'])
    if table_exists('investor_proposals') and 'ix_investor_proposals_email' not in existing_indexes:
        op.create_index('ix_investor_proposals_email', 'investor_proposals', ['email'])
    if table_exists('investor_proposals') and 'ix_investor_proposals_sector' not in existing_indexes:
        op.create_index('ix_investor_proposals_sector', 'investor_proposals', ['sector'])
    if table_exists('investor_proposals') and 'ix_investor_proposals_phone' not in existing_indexes:
        op.create_index('ix_investor_proposals_phone', 'investor_proposals', ['phone'])
    if table_exists('investor_proposals') and 'ix_investor_proposals_status' not in existing_indexes:
        op.create_index('ix_investor_proposals_status', 'investor_proposals', ['status'])


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if 'investor_proposals' in tables:
        # Drop indexes first (skip if missing)
        try:
            op.drop_index('ix_investor_proposals_name', table_name='investor_proposals')
        except Exception:
            pass
        try:
            op.drop_index('ix_investor_proposals_email', table_name='investor_proposals')
        except Exception:
            pass
        try:
            op.drop_index('ix_investor_proposals_sector', table_name='investor_proposals')
        except Exception:
            pass
        try:
            op.drop_index('ix_investor_proposals_phone', table_name='investor_proposals')
        except Exception:
            pass
        try:
            op.drop_index('ix_investor_proposals_status', table_name='investor_proposals')
        except Exception:
            pass
        op.drop_table('investor_proposals')
