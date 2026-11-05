"""tournaments groups playoff

Revision ID: 4e1b8f6a2c7d
Revises: 7a2f4c9d1b3e
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '4e1b8f6a2c7d'
down_revision: Union[str, None] = '7a2f4c9d1b3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'tournaments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('format', sa.String(length=255), nullable=True),
        sa.Column('prize_pool', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('UPCOMING', 'ONGOING', 'FINISHED', name='tournamentstatus'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('banner_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_tournaments_name'), 'tournaments', ['name'], unique=True)

    op.create_table(
        'tournament_teams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tournament_id', sa.UUID(), nullable=False),
        sa.Column('team_id', sa.UUID(), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tournament_id', 'team_id', name='uq_tournament_team'),
    )

    op.create_table(
        'tournament_groups',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tournament_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'tournament_group_teams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('team_id', sa.UUID(), nullable=False),
        sa.Column('wins', sa.Integer(), nullable=False),
        sa.Column('losses', sa.Integer(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['tournament_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'team_id', name='uq_group_team'),
    )

    op.create_table(
        'playoff_matches',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tournament_id', sa.UUID(), nullable=False),
        sa.Column('round', sa.Integer(), nullable=False),
        sa.Column('slot', sa.Integer(), nullable=False),
        sa.Column('team1_id', sa.UUID(), nullable=True),
        sa.Column('team2_id', sa.UUID(), nullable=True),
        sa.Column('team1_score', sa.Integer(), nullable=True),
        sa.Column('team2_score', sa.Integer(), nullable=True),
        sa.Column('winner_id', sa.UUID(), nullable=True),
        sa.Column('next_match_id', sa.UUID(), nullable=True),
        sa.Column('next_match_slot', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team1_id'], ['teams.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['team2_id'], ['teams.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['winner_id'], ['teams.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['next_match_id'], ['playoff_matches.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('playoff_matches')
    op.drop_table('tournament_group_teams')
    op.drop_table('tournament_groups')
    op.drop_table('tournament_teams')
    op.drop_index(op.f('ix_tournaments_name'), table_name='tournaments')
    op.drop_table('tournaments')
    postgresql.ENUM(name='tournamentstatus').drop(op.get_bind(), checkfirst=True)
