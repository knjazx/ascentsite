"""news

Revision ID: 1f7a9b3c6d0e
Revises: 9c3d5e8f1a4b
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '1f7a9b3c6d0e'
down_revision: Union[str, None] = '9c3d5e8f1a4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'news',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=220), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column(
            'category',
            sa.Enum('ANNOUNCEMENTS', 'TOURNAMENTS', 'MATCHES', 'LEAGUE', 'UPDATES', name='newscategory'),
            nullable=False,
        ),
        sa.Column('cover_image_url', sa.String(length=500), nullable=True),
        sa.Column('is_featured', sa.Boolean(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_news_slug'), 'news', ['slug'], unique=True)
    op.create_index(op.f('ix_news_published_at'), 'news', ['published_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_news_published_at'), table_name='news')
    op.drop_index(op.f('ix_news_slug'), table_name='news')
    op.drop_table('news')
    postgresql.ENUM(name='newscategory').drop(op.get_bind(), checkfirst=True)
