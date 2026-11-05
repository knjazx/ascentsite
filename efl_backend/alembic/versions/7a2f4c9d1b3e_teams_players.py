"""teams and players

Revision ID: 7a2f4c9d1b3e
Revises: 51d361e4fe57
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '7a2f4c9d1b3e'
down_revision: Union[str, None] = '51d361e4fe57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'teams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('tag', sa.String(length=10), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('tier', sa.Enum('S', 'A', 'B', 'C', 'D', name='teamtier'), nullable=False),
        sa.Column('efl_rating', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_teams_name'), 'teams', ['name'], unique=True)

    op.create_table(
        'players',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('nickname', sa.String(length=50), nullable=False),
        sa.Column('real_name', sa.String(length=100), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('team_id', sa.UUID(), nullable=True),
        sa.Column('kills', sa.Integer(), nullable=False),
        sa.Column('deaths', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_players_nickname'), 'players', ['nickname'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_players_nickname'), table_name='players')
    op.drop_table('players')
    op.drop_index(op.f('ix_teams_name'), table_name='teams')
    op.drop_table('teams')
    postgresql.ENUM(name='teamtier').drop(op.get_bind(), checkfirst=True)
