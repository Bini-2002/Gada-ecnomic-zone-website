"""
create comments and post_likes tables

Revision ID: d4e5f6a7
Revises: c1d2e3f4
Create Date: 2025-08-28
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd4e5f6a7'
down_revision = 'c1d2e3f4'
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not table_exists('comments'):
        op.create_table(
            'comments',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('post_id', sa.Integer(), index=True, nullable=False),
            sa.Column('user_id', sa.Integer(), index=True, nullable=False),
            sa.Column('content', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
    # create indexes if missing
    existing_idx = {idx['name'] for idx in inspector.get_indexes('comments')} if table_exists('comments') else set()
    if 'ix_comments_post_id' not in existing_idx and table_exists('comments'):
        op.create_index('ix_comments_post_id', 'comments', ['post_id'])
    if 'ix_comments_user_id' not in existing_idx and table_exists('comments'):
        op.create_index('ix_comments_user_id', 'comments', ['user_id'])

    if not table_exists('post_likes'):
        op.create_table(
            'post_likes',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('post_id', sa.Integer(), index=True, nullable=False),
            sa.Column('user_id', sa.Integer(), index=True, nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.UniqueConstraint('post_id', 'user_id', name='uq_post_like_user')
        )
    existing_idx2 = {idx['name'] for idx in inspector.get_indexes('post_likes')} if table_exists('post_likes') else set()
    if 'ix_post_likes_post_id' not in existing_idx2 and table_exists('post_likes'):
        op.create_index('ix_post_likes_post_id', 'post_likes', ['post_id'])
    if 'ix_post_likes_user_id' not in existing_idx2 and table_exists('post_likes'):
        op.create_index('ix_post_likes_user_id', 'post_likes', ['user_id'])


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'post_likes' in inspector.get_table_names():
        op.drop_index('ix_post_likes_post_id', table_name='post_likes')
        op.drop_index('ix_post_likes_user_id', table_name='post_likes')
        op.drop_table('post_likes')
    if 'comments' in inspector.get_table_names():
        op.drop_index('ix_comments_post_id', table_name='comments')
        op.drop_index('ix_comments_user_id', table_name='comments')
        op.drop_table('comments')
