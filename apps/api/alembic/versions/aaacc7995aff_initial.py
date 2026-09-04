"""initial

Revision ID: aaacc7995aff
Revises:
Create Date: 2026-09-04 18:19:45.855959

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = 'aaacc7995aff'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create all base tables first, then the join/dependent tables.
    # We create publish_runs WITHOUT its FK to catalogue_versions, add
    # catalogue_versions, then add the FK back with ALTER TABLE.

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'editor', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'shows',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('section', sa.String(length=100), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='showstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index(op.f('ix_shows_slug'), 'shows', ['slug'], unique=True)
    op.create_index(op.f('ix_shows_status'), 'shows', ['status'], unique=False)
    op.create_index(op.f('ix_shows_section'), 'shows', ['section'], unique=False)

    op.create_table(
        'seasons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('show_id', sa.Integer(), nullable=False),
        sa.Column('season_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('season_number >= 0', name='ck_seasons_season_number_non_negative'),
        sa.ForeignKeyConstraint(['show_id'], ['shows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('show_id', 'season_number', name='uq_seasons_show_id_season_number'),
    )
    op.create_index(op.f('ix_seasons_show_id'), 'seasons', ['show_id'], unique=False)

    op.create_table(
        'episodes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('season_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('episode_number', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('content_group', sa.String(length=100), nullable=False),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='episodestatus'), nullable=False),
        sa.Column('video_storage_key', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('duration_seconds IS NULL OR duration_seconds > 0', name='ck_episodes_duration_positive'),
        sa.ForeignKeyConstraint(['season_id'], ['seasons.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('content_group', 'language', name='uq_episodes_content_group_language'),
    )
    op.create_index(op.f('ix_episodes_season_id'), 'episodes', ['season_id'], unique=False)
    op.create_index(op.f('ix_episodes_status'), 'episodes', ['status'], unique=False)
    op.create_index(op.f('ix_episodes_content_group'), 'episodes', ['content_group'], unique=False)
    op.create_index(op.f('ix_episodes_language'), 'episodes', ['language'], unique=False)

    op.create_table(
        'artworks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('show_id', sa.Integer(), nullable=True),
        sa.Column('episode_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.Enum('poster', 'banner', 'thumbnail', name='artworktype'), nullable=False),
        sa.Column('storage_key', sa.String(length=512), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint(
            '(show_id IS NOT NULL) OR (episode_id IS NOT NULL)',
            name='ck_artworks_belongs_to_show_or_episode',
        ),
        sa.CheckConstraint(
            'NOT (show_id IS NOT NULL AND episode_id IS NOT NULL)',
            name='ck_artworks_not_both_show_and_episode',
        ),
        sa.CheckConstraint('file_size_bytes >= 0', name='ck_artworks_file_size_non_negative'),
        sa.ForeignKeyConstraint(['episode_id'], ['episodes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['show_id'], ['shows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_artworks_show_id'), 'artworks', ['show_id'], unique=False)
    op.create_index(op.f('ix_artworks_episode_id'), 'artworks', ['episode_id'], unique=False)

    # Catalogue versions (no FK to publish_runs at create-time to break cycle)
    op.create_table(
        'catalogue_versions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('publish_run_id', sa.Integer(), nullable=True),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('storage_key', sa.String(length=512), nullable=False),
        sa.Column('checksum', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('version_number'),
    )

    # Publish runs (no FK to catalogue_versions at create-time to break cycle)
    op.create_table(
        'publish_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'queued', 'processing', 'success', 'failed', name='publishrunstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('catalogue_version_id', sa.Integer(), nullable=True),
        sa.Column('shows_count', sa.Integer(), nullable=True),
        sa.Column('episodes_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_publish_runs_status'), 'publish_runs', ['status'], unique=False)
    op.create_index(op.f('ix_publish_runs_created_at'), 'publish_runs', ['created_at'], unique=False)

    # Add the missing FKs now that both tables exist
    op.create_foreign_key(
        'fk_catalogue_versions_publish_run_id_publish_runs',
        'catalogue_versions',
        'publish_runs',
        ['publish_run_id'],
        ['id'],
        ondelete='SET NULL',
    )
    op.create_foreign_key(
        'fk_publish_runs_catalogue_version_id_catalogue_versions',
        'publish_runs',
        'catalogue_versions',
        ['catalogue_version_id'],
        ['id'],
    )

    op.create_table(
        'publish_run_shows',
        sa.Column('publish_run_id', sa.Integer(), nullable=False),
        sa.Column('show_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['publish_run_id'], ['publish_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['show_id'], ['shows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('publish_run_id', 'show_id'),
    )
    op.create_index(
        'ix_publish_run_shows_publish_run_id', 'publish_run_shows', ['publish_run_id'], unique=False
    )
    op.create_index(
        'ix_publish_run_shows_show_id', 'publish_run_shows', ['show_id'], unique=False
    )
    op.create_index(
        'uq_publish_run_shows_active_one_per_show',
        'publish_run_shows',
        ['show_id'],
        unique=True,
        postgresql_where="status IN ('queued', 'processing')",
    )

    op.create_table(
        'catalogue_state',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('current_version_id', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('id = 1', name='ck_catalogue_state_single_row'),
        sa.ForeignKeyConstraint(['current_version_id'], ['catalogue_versions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('catalogue_state')
    op.drop_index('uq_publish_run_shows_active_one_per_show', table_name='publish_run_shows', postgresql_where="status IN ('queued', 'processing')")
    op.drop_index('ix_publish_run_shows_show_id', table_name='publish_run_shows')
    op.drop_index('ix_publish_run_shows_publish_run_id', table_name='publish_run_shows')
    op.drop_table('publish_run_shows')
    op.drop_constraint('fk_publish_runs_catalogue_version_id_catalogue_versions', 'publish_runs', type_='foreignkey')
    op.drop_constraint('fk_catalogue_versions_publish_run_id_publish_runs', 'catalogue_versions', type_='foreignkey')
    op.drop_index('ix_publish_runs_created_at', table_name='publish_runs')
    op.drop_index('ix_publish_runs_status', table_name='publish_runs')
    op.drop_table('publish_runs')
    op.drop_table('catalogue_versions')
    op.drop_index('ix_artworks_episode_id', table_name='artworks')
    op.drop_index('ix_artworks_show_id', table_name='artworks')
    op.drop_table('artworks')
    op.drop_index('ix_episodes_language', table_name='episodes')
    op.drop_index('ix_episodes_content_group', table_name='episodes')
    op.drop_index('ix_episodes_status', table_name='episodes')
    op.drop_index('ix_episodes_season_id', table_name='episodes')
    op.drop_table('episodes')
    op.drop_index('ix_seasons_show_id', table_name='seasons')
    op.drop_table('seasons')
    op.drop_index('ix_shows_section', table_name='shows')
    op.drop_index('ix_shows_status', table_name='shows')
    op.drop_index('ix_shows_slug', table_name='shows')
    op.drop_table('shows')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
