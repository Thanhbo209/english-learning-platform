"""allow auth admin to read profiles for hook

Revision ID: 0cbaa0eea7ec
Revises: 14a5d4a93b50
Create Date: 2026-08-13 13:39:07.039025

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '0cbaa0eea7ec'
down_revision: str | Sequence[str] | None = '14a5d4a93b50'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # The earlier migration granted SELECT on public.profiles to
    # supabase_auth_admin, but RLS is enabled with zero policies, and a
    # GRANT alone does not bypass RLS. custom_access_token_hook runs as
    # supabase_auth_admin (not the table owner), so without this policy its
    # lookup silently sees no rows and falls back to the default role.
    op.execute(
        """
        create policy "Allow auth admin to read profiles"
        on public.profiles
        as permissive
        for select
        to supabase_auth_admin
        using (true)
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute('drop policy if exists "Allow auth admin to read profiles" on public.profiles')
