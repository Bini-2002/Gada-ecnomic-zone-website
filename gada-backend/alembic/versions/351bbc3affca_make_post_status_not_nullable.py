
"""make_post_status_not_nullable

Revision ID: 351bbc3affca
Revises: e9e1a0d6e727
Create Date: 2025-08-18 11:37:41.388652
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '351bbc3affca'
down_revision: Union[str, None] = 'e9e1a0d6e727'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """SQLite doesn't support simple ALTER COLUMN SET NOT NULL; recreate table."""
    bind = op.get_bind()
    if bind.dialect.name != 'sqlite':
        op.alter_column('posts', 'status', existing_type=sa.VARCHAR(), nullable=False)
        return
    # Create new table with NOT NULL constraint on status
    op.create_table(
        'posts_new',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('title', sa.String),
        sa.Column('date', sa.String),
        sa.Column('details', sa.String),
        sa.Column('image', sa.String),
        sa.Column('created_at', sa.DateTime),
        sa.Column('status', sa.String, nullable=False, server_default='draft'),
        sa.Column('publish_at', sa.DateTime)
    )
    # Copy data, coalescing NULL status to 'draft'
    op.execute("INSERT INTO posts_new (id, title, date, details, image, created_at, status, publish_at) SELECT id, title, date, details, image, created_at, COALESCE(status, 'draft'), publish_at FROM posts")
    # Drop old indexes/table
    op.drop_index('ix_posts_id', table_name='posts')
    op.drop_table('posts')
    # Rename new table
    op.rename_table('posts_new', 'posts')
    # Recreate index
    op.create_index('ix_posts_id', 'posts', ['id'])

def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != 'sqlite':
        op.alter_column('posts', 'status', existing_type=sa.VARCHAR(), nullable=True)
        return
    # Recreate with nullable status
    op.create_table(
        'posts_old',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('title', sa.String),
        sa.Column('date', sa.String),
        sa.Column('details', sa.String),
        sa.Column('image', sa.String),
        sa.Column('created_at', sa.DateTime),
        sa.Column('status', sa.String, nullable=True),
        sa.Column('publish_at', sa.DateTime)
    )
    op.execute("INSERT INTO posts_old (id, title, date, details, image, created_at, status, publish_at) SELECT id, title, date, details, image, created_at, status, publish_at FROM posts")
    op.drop_index('ix_posts_id', table_name='posts')
    op.drop_table('posts')
    op.rename_table('posts_old', 'posts')
    op.create_index('ix_posts_id', 'posts', ['id'])
