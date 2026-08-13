"""add learning content management

Revision ID: 2a7456d089ca
Revises: 00049b90b675
Create Date: 2026-08-13 15:30:00.000000

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '2a7456d089ca'
down_revision: str | Sequence[str] | None = '00049b90b675'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("create type content_type as enum ('learning_document', 'exercise', 'vocabulary')")
    op.execute(
        "create type content_status as enum "
        "('ready_for_review', 'validation_failed', 'published', 'failed')"
    )
    op.execute("create type source_format as enum ('docx', 'xlsx', 'pdf', 'csv')")
    op.execute(
        "create type question_type as enum ('multiple_choice', 'true_false', 'short_answer')"
    )

    op.execute(
        """
        create table public.learning_content (
            id uuid primary key default gen_random_uuid(),
            teacher_id uuid not null references auth.users (id) on delete cascade,
            type content_type not null,
            title text not null,
            description text,
            status content_status not null,
            source_file_path text,
            source_file_name text,
            source_format source_format,
            document_body text,
            validation_errors jsonb,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
        )
        """
    )

    op.execute(
        """
        create table public.exercise_questions (
            id uuid primary key default gen_random_uuid(),
            content_id uuid not null references public.learning_content (id) on delete cascade,
            position integer not null,
            question_text text not null,
            question_type question_type not null,
            options jsonb,
            correct_answer text not null
        )
        """
    )

    op.execute(
        """
        create table public.vocabulary_items (
            id uuid primary key default gen_random_uuid(),
            content_id uuid not null references public.learning_content (id) on delete cascade,
            position integer not null,
            word text not null,
            definition text not null,
            translation text,
            example text
        )
        """
    )

    op.execute(
        """
        create table public.content_assignments (
            id uuid primary key default gen_random_uuid(),
            content_id uuid not null references public.learning_content (id) on delete cascade,
            classroom_id uuid not null references public.classrooms (id) on delete cascade,
            assigned_by uuid not null references auth.users (id) on delete cascade,
            assigned_at timestamptz not null default now(),
            due_at timestamptz,
            unique (content_id, classroom_id)
        )
        """
    )

    for table in (
        "learning_content",
        "exercise_questions",
        "vocabulary_items",
        "content_assignments",
    ):
        op.execute(f"alter table public.{table} enable row level security")
        op.execute(f"revoke all on public.{table} from authenticated, anon, public")

    # Storage bucket for original uploaded files (private - never public).
    # Path convention: {teacher_id}/{content_id}/{filename}. Teachers upload
    # and read using their own forwarded session token, not a service key,
    # so the RLS-style storage.objects policies scope access to each
    # teacher's own folder.
    op.execute(
        "insert into storage.buckets (id, name, public) "
        "values ('learning-content', 'learning-content', false) "
        "on conflict (id) do nothing"
    )
    op.execute(
        """
        create policy "Teachers upload to their own folder"
        on storage.objects
        as permissive
        for insert
        to authenticated
        with check (
            bucket_id = 'learning-content'
            and (storage.foldername(name))[1] = auth.uid()::text
        )
        """
    )
    op.execute(
        """
        create policy "Teachers read their own folder"
        on storage.objects
        as permissive
        for select
        to authenticated
        using (
            bucket_id = 'learning-content'
            and (storage.foldername(name))[1] = auth.uid()::text
        )
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute('drop policy if exists "Teachers read their own folder" on storage.objects')
    op.execute('drop policy if exists "Teachers upload to their own folder" on storage.objects')
    op.execute("delete from storage.buckets where id = 'learning-content'")

    op.execute("drop table if exists public.content_assignments")
    op.execute("drop table if exists public.vocabulary_items")
    op.execute("drop table if exists public.exercise_questions")
    op.execute("drop table if exists public.learning_content")

    op.execute("drop type if exists question_type")
    op.execute("drop type if exists source_format")
    op.execute("drop type if exists content_status")
    op.execute("drop type if exists content_type")
