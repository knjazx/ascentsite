"""audit log and tier rework

Revision ID: 2a6c9f0d3e5b
Revises: 1f7a9b3c6d0e
Create Date: 2026-07-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2a6c9f0d3e5b'
down_revision: Union[str, None] = '1f7a9b3c6d0e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('admin_id', sa.UUID(), nullable=True),
        sa.Column('admin_username', sa.String(length=50), nullable=True),
        sa.Column('method', sa.String(length=10), nullable=False),
        sa.Column('path', sa.String(length=500), nullable=False),
        sa.Column('status_code', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)

    op.execute("CREATE TYPE tier AS ENUM ('Tier 1', 'Tier 2', 'Tier 3')")

    op.execute("ALTER TABLE teams ALTER COLUMN tier DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE teams ALTER COLUMN tier TYPE tier USING (
            CASE teams.tier::text
                WHEN 'S' THEN 'Tier 1'
                WHEN 'A' THEN 'Tier 1'
                WHEN 'B' THEN 'Tier 2'
                WHEN 'C' THEN 'Tier 3'
                WHEN 'D' THEN 'Tier 3'
            END
        )::tier
        """
    )
    op.execute("ALTER TABLE teams ALTER COLUMN tier SET DEFAULT 'Tier 3'")
    op.execute("DROP TYPE teamtier")

    op.add_column(
        'players',
        sa.Column('tier', sa.Enum('Tier 1', 'Tier 2', 'Tier 3', name='tier'), nullable=False, server_default='Tier 3'),
    )
    op.alter_column('players', 'tier', server_default=None)


def downgrade() -> None:
    op.drop_column('players', 'tier')

    op.execute("CREATE TYPE teamtier AS ENUM ('S', 'A', 'B', 'C', 'D')")
    op.execute("ALTER TABLE teams ALTER COLUMN tier DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE teams ALTER COLUMN tier TYPE teamtier USING (
            CASE teams.tier::text
                WHEN 'Tier 1' THEN 'A'
                WHEN 'Tier 2' THEN 'B'
                WHEN 'Tier 3' THEN 'D'
            END
        )::teamtier
        """
    )
    op.execute("ALTER TABLE teams ALTER COLUMN tier SET DEFAULT 'D'")
    op.execute("DROP TYPE tier")

    op.drop_index(op.f('ix_audit_logs_created_at'), table_name='audit_logs')
    op.drop_table('audit_logs')
