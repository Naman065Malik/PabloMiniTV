# Peblo TV Mini — Backend API

FastAPI backend for the Peblo TV Mini take-home challenge.

Stack: Python 3.12+, FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, Pydantic v2, pytest, Ruff.

## Start PostgreSQL

```bash
docker compose up -d postgres
```

## Create virtual environment

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

## Install dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Or install directly:

```bash
python -m pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic-settings python-multipart pytest httpx ruff Pillow passlib python-jose
```

## Set environment

```bash
cp .env.example .env
```

Edit `.env` for local values. Never commit `.env`.

## Start FastAPI

```bash
uvicorn app.main:app --reload
```

Then open Swagger at `http://localhost:8000/docs`.

## Run migrations

```bash
alembic upgrade head
```

## Run tests

```bash
pytest tests/ -q
```

## Lint / format

```bash
ruff check app tests
ruff format app tests
```

## Health check

```bash
curl http://localhost:8000/health
```

## Login (development users created automatically)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peblo.local","password":"admin-password"}'
```

## Catalogue / search (public, no auth required)

```bash
curl http://localhost:8000/api/catalog
curl "http://localhost:8000/api/catalog/search?q=crime&section=Featured"
```

## Schema evolution / scale note

The published catalogue is a static immutable read model (JSON snapshot). Search operates server-side against that snapshot rather than editable PostgreSQL state. If the catalogue grows large, the approach should evolve to an indexed representation (PostgreSQL JSONB with GIN indexes, or a dedicated search index such as OpenSearch/Elasticsearch) rather than scanning the full file in memory.
