"""add user roles

Revision ID: 14a5d4a93b50
Revises:
Create Date: 2026-08-13 13:00:13.965073

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '14a5d4a93b50'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("create type user_role as enum ('admin', 'teacher', 'student')")

    op.execute(
        """
        create table public.profiles (
            id uuid primary key references auth.users (id) on delete cascade,
            role user_role not null default 'student',
            created_at timestamptz not null default now()
        )
        """
    )

    # Defense in depth: RLS stays on with zero policies, and grants to the
    # Data API roles are revoked. Nothing reaches this table except our own
    # backend (connects as `postgres`, bypasses RLS) and the auth hook below
    # (explicitly granted select as `supabase_auth_admin`).
    op.execute("alter table public.profiles enable row level security")
    op.execute("revoke all on public.profiles from authenticated, anon, public")

    # Populates a profiles row (default role) whenever a new auth.users row
    # is created. security definer because the inserting session has no
    # grant on public.profiles; deliberately ignores raw_user_meta_data,
    # which is client-writable and must never determine role.
    op.execute(
        """
        create function public.handle_new_user()
        returns trigger
        language plpgsql
        security definer set search_path = ''
        as $$
        begin
          insert into public.profiles (id) values (new.id);
          return new;
        end;
        $$
        """
    )
    op.execute(
        """
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute procedure public.handle_new_user()
        """
    )

    # Copies profiles.role into the JWT's app_metadata at token-issue time,
    # so FastAPI can read role from the verified token with no DB call.
    # Must be enabled manually in Dashboard > Authentication > Hooks.
    op.execute(
        """
        create function public.custom_access_token_hook(event jsonb)
        returns jsonb
        language plpgsql
        set search_path = ''
        as $$
        declare
          claims jsonb;
          user_role text;
        begin
          select role into user_role
          from public.profiles
          where id = (event->>'user_id')::uuid;

          claims := event->'claims';

          if jsonb_typeof(claims->'app_metadata') is null then
            claims := jsonb_set(claims, '{app_metadata}', '{}');
          end if;

          claims := jsonb_set(
            claims, '{app_metadata,role}', to_jsonb(coalesce(user_role, 'student'))
          );

          event := jsonb_set(event, '{claims}', claims);
          return event;
        end;
        $$
        """
    )
    op.execute("grant select on public.profiles to supabase_auth_admin")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("revoke select on public.profiles from supabase_auth_admin")
    op.execute("drop function if exists public.custom_access_token_hook(jsonb)")
    op.execute("drop trigger if exists on_auth_user_created on auth.users")
    op.execute("drop function if exists public.handle_new_user()")
    op.execute("drop table if exists public.profiles")
    op.execute("drop type if exists user_role")
