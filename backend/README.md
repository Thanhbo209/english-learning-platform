# Backend

FastAPI service for EnglishEveryday. Managed with [uv](https://docs.astral.sh/uv/).

## Setup

```bash
cp .env.example .env
uv sync
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `ENVIRONMENT` | `development` / `production`. |
| `DATABASE_URL` | SQLAlchemy connection string. |
| `SUPABASE_URL` | Supabase project URL. Used to fetch the public JWKS for verifying Auth tokens — no secret key required. |
| `SUPABASE_PUBLISHABLE_KEY` | Same public/non-secret key the frontend uses. Required as the `apikey` header for Storage REST calls (uploads use the calling teacher's own forwarded session token, never a service key). |
| `FRONTEND_URL` | Origin allowed to call this API from the browser (CORS). |

## Run

```bash
uv run uvicorn app.main:app --reload
```

## Test / Lint

```bash
uv run pytest
uv run ruff check .
```

## Migrations

```bash
uv run alembic revision --autogenerate -m "message"
uv run alembic upgrade head
```
