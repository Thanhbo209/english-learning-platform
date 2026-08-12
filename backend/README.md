# Backend

FastAPI service for EnglishEveryday. Managed with [uv](https://docs.astral.sh/uv/).

## Setup

```bash
cp .env.example .env
uv sync
```

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
