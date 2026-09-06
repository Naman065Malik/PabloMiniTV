# PabloMiniTV Assessment

This repository contains a full-stack media publishing assessment for a mini streaming platform, with a backend API, a CMS for content management, and a public viewer experience.

## Overview

PabloMiniTV was built to support:

- managing shows, seasons, and episodes
- uploading and validating artwork assets
- publishing catalog-ready content
- tracking publish validation issues and failures
- controlling admin/editor permissions
- serving a public catalog to the viewer front end

The solution spans three main applications:

- `apps/api` — FastAPI backend and business logic
- `apps/CMS` — admin/content management system
- `apps/Viewer` — public-facing streaming portal

## Architecture

### Backend
- FastAPI application with modular API routing
- SQLAlchemy models for shows, seasons, episodes, artwork, publish runs, and users
- JWT-based authentication and role-based authorization
- validation service for publish readiness and issue reporting
- public catalog endpoint that serves the latest generated catalogue JSON

### CMS
- React + TypeScript + Vite app
- content management for shows, episodes, and artwork
- publish dashboard and publish history
- validation report view for failed or blocked publishes
- admin-only management for creating editors and admins

### Viewer
- React + TypeScript + Vite app
- reads the public catalogue from the backend
- renders featured content, show rows, and marketing sections
- displays live catalog-driven show data instead of static mock content

## Key features implemented

- Artwork upload and validation for show/season/episode assets
- Editing and managing existing uploaded files on show and episode pages
- Publish workflow with validation-before-publish rules
- Failed publish issue detail reporting
- Latest catalog file generation and public catalog serving
- Admin-only user management panel for creating Editor/Admin users
- Editor restrictions so they can review validation/reporting but cannot publish
- Viewer data integration using the backend-driven catalogue
- Final UI polish and responsive browsing experience

## Project structure

```text
PabloMiniTV/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   ├── alembic/
│   │   ├── tests/
│   │   └── storage/
│   ├── CMS/
│   └── Viewer/
├── assets/
├── pabloMiniTV_design_pack/
├── README.md
├── seed_shows.json
└── seed_shows_corrected.json
```

## Getting started

### Run the full stack with Docker

From the repository root:

```bash
docker compose up --build
```

Open the applications at:

- CMS: `http://localhost:5173`
- Viewer: `http://localhost:5174`
- API docs: `http://localhost:8000/docs`

PostgreSQL is available to host tools on port `5433` by default. Override
`POSTGRES_PORT`, `CMS_PORT`, or `VIEWER_PORT` when those ports are already in use.
The Compose database reuses the existing `api_postgres_data` volume, so the
current PostgreSQL data is available to the API after startup.

Stop the stack with:

```bash
docker compose down
```

### 1. API

From `apps/api`:

```bash
uvicorn app.main:app --reload
```

The backend exposes admin and public routes for authentication, validation, publishing, and catalogue access.

### 2. CMS

From `apps/CMS`:

```bash
pnpm install
pnpm dev
```

### 3. Viewer

From `apps/Viewer`:

```bash
pnpm install
pnpm dev
```

## Role and access model

- Admin: full access to publish actions and user management
- Editor: can access validation reports and content management screens, but cannot publish
- Public viewer: reads published catalogue data via the public catalog API

## Catalog workflow

1. shows and episodes are created/edited in the CMS
2. validation checks confirm publish readiness
3. an admin triggers the publish action
4. the backend generates or updates the catalog file
5. the viewer reads the latest public catalog from the backend
6. published shows are surfaced in the front-end experience

## Assessment outcome

This assessment demonstrates a working end-to-end content publishing flow across:

- content administration
- validation and reporting
- permission controls
- publish automation
- public catalogue consumption

It is structured to reflect a realistic mini OTT platform workflow with content governance and operational controls.

## Notes

For deeper implementation details, follow the app-specific readmes in the subdirectories:

- `apps/api/README.md`
- `apps/CMS/README.md`
- `apps/Viewer/README.md`
