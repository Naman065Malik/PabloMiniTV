"""Add structured validation reports to publish runs.

Revision ID: b7f9d5d2c4e1
Revises: aaacc7995aff
"""

from alembic import op
import sqlalchemy as sa


revision = "b7f9d5d2c4e1"
down_revision = "aaacc7995aff"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("publish_runs", sa.Column("validation_report", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("publish_runs", "validation_report")
