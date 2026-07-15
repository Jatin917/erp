# ERPbyJatin

School ERP: backend (Express/Prisma), frontend (React/Vite), worker (BullMQ).

Docs: docs/ENGINEERING_WORKFLOW.md
Setup: docs/onboarding/local-setup.md

## Docker Compose

Full stack: `db`, `redis`, `backend`, `worker` (email), `frontend`.

```bash
# If you already started standalone erp/redis containers:
docker stop erp redis

cp .env.docker.example .env   # optional overrides
docker compose up --build -d
```

| Service  | URL / port        |
|----------|-------------------|
| Frontend | http://localhost:3001 |
| Backend  | http://localhost:3000 |
| Postgres | localhost:5433 (`erp` / `erp_user`) |
| Redis    | localhost:6379 |

Notes:
- Compose creates a **new** Postgres volume (`erp_pgdata`); it does not use your existing `erp` / `erp_clean` data unless you change config.
- Frontend is built from `./frontend` (local checkout; gitignored from this repo).
- First API login bootstraps SuperAdmin from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.
