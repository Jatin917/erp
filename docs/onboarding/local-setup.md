# Local Setup

## Option A — Docker Compose (recommended for full stack)

From repo root:

```bash
docker stop erp redis   # if those containers already bind 5433/6379
cp .env.docker.example .env
docker compose up --build -d
```

- UI: http://localhost:3001  
- API: http://localhost:3000  
- See root `README.md` for ports and notes.

## Option B — Manual

```bash
cd backend && npm i && npx prisma generate && npm run dev
cd frontend && pnpm i && pnpm dev
cd worker && npm i && npm run build && npm run email-worker
```

Need PostgreSQL + Redis (or Docker services `db` / `redis` only).
