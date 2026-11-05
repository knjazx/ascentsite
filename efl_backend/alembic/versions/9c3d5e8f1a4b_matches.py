"""matches

Revision ID: 9c3d5e8f1a4b
Revises: 4e1b8f6a2c7d
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '9c3d5e8f1a4b'
down_revision: Union[str, None] = '4e1b8f6a2c7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'matches',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tournament_id', sa.UUID(), nullable=True),
        sa.Column('group_id', sa.UUID(), nullable=True),
        sa.Column('team1_id', sa.UUID(), nullable=True),
        sa.Column('team2_id', sa.UUID(), nullable=True),
        sa.Column('team1_score', sa.Integer(), nullable=True),
        sa.Column('team2_score', sa.Integer(), nullable=True),
        sa.Column('winner_id', sa.UUID(), nullable=True),
        sa.Column('best_of', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('SCHEDULED', 'LIVE', 'FINISHED', name='matchstatus'), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['group_id'], ['tournament_groups.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['team1_id'], ['teams.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['team2_id'], ['teams.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['winner_id'], ['teams.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_matches_scheduled_at'), 'matches', ['scheduled_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_matches_scheduled_at'), table_name='matches')
    op.drop_table('matches')
    postgresql.ENUM(name='matchstatus').drop(op.get_bind(), checkfirst=True)
