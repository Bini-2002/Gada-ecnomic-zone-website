"""
add likes_count and comments_count to posts

Revision ID: c1d2e3f4
Revises: e9e1a0d6e727
Create Date: 2025-08-28
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c1d2e3f4'
down_revision = 'b7c8d9e0f1a2'
branch_labels = None
depends_on = None

def column_exists(table, column):
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns(table)]
    return column in cols

def upgrade():
    if not column_exists('posts', 'likes_count'):
        # SQLite doesn't support ALTER COLUMN SET NOT NULL easily; keep nullable and initialize to 0
        op.add_column('posts', sa.Column('likes_count', sa.Integer(), nullable=True))
        op.execute("UPDATE posts SET likes_count = 0 WHERE likes_count IS NULL")
    if not column_exists('posts', 'comments_count'):
        op.add_column('posts', sa.Column('comments_count', sa.Integer(), nullable=True))
        op.execute("UPDATE posts SET comments_count = 0 WHERE comments_count IS NULL")

def downgrade():
    # safe drop if exists
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns('posts')]
    if 'likes_count' in cols:
        op.drop_column('posts', 'likes_count')
    if 'comments_count' in cols:
        op.drop_column('posts', 'comments_count')
