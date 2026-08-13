"""add classrooms and enrollments

Revision ID: 00049b90b675
Revises: 0cbaa0eea7ec
Create Date: 2026-08-13 14:25:46.152102

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '00049b90b675'
down_revision: str | Sequence[str] | None = '0cbaa0eea7ec'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        create table public.classrooms (
            id uuid primary key default gen_random_uuid(),
            name text not null,
            description text,
            teacher_id uuid not null references auth.users (id) on delete cascade,
            join_token text not null unique,
            is_archived boolean not null default false,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
        )
        """
    )

    op.execute(
        """
        create table public.classroom_enrollments (
            id uuid primary key default gen_random_uuid(),
            classroom_id uuid not null references public.classrooms (id) on delete cascade,
            student_id uuid not null references auth.users (id) on delete cascade,
            joined_at timestamptz not null default now(),
            unique (classroom_id, student_id)
        )
        """
    )

    # Defense in depth, same pattern as public.profiles (migration 0cbaa0eea7ec):
    # only our backend's postgres-owner connection touches these tables, so RLS
    # stays on with zero policies and the Data API roles get nothing.
    op.execute("alter table public.classrooms enable row level security")
    op.execute("alter table public.classroom_enrollments enable row level security")
    op.execute("revoke all on public.classrooms from authenticated, anon, public")
    op.execute("revoke all on public.classroom_enrollments from authenticated, anon, public")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("drop table if exists public.classroom_enrollments")
    op.execute("drop table if exists public.classrooms")
