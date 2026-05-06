# DASS

`DASS` is a Distributed Asynchronous Scheduling System: a production-style MVP for creating, scheduling, dispatching, and observing internal jobs.

## Stack

- Backend: Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic, Pydantic, boto3, httpx, croniter
- Frontend: Next.js, React, TypeScript, TanStack Query, Tailwind CSS
- Database: PostgreSQL
- Queue: AWS SQS, with LocalStack for local development

## Architecture

```mermaid
flowchart LR
  Browser[Browser]
  Frontend[Next.js Frontend\n:3000]
  API[FastAPI API Server\n:8000]
  Scheduler[Scheduler Worker]
  Worker[Job Worker]
  DB[(PostgreSQL)]
  Queue[(AWS SQS / LocalStack)]

  Browser --> Frontend
  Frontend -->|API requests and rewrites| API
  API --> DB
  API --> Queue
  Scheduler --> DB
  Scheduler --> Queue
  Worker --> DB
  Worker --> Queue
  Queue --> Worker
```

The frontend serves the UI and proxies API calls to the backend. The backend owns persistence in PostgreSQL, and scheduling/worker processes coordinate job dispatch and execution through the queue.

## Top-Level Structure

```text
dass/
  backend/       # FastAPI app, scheduler, worker, models, services
  frontend/      # Next.js dashboard (placeholder UI, to be implemented)
  infra/         # LocalStack init scripts
  docker-compose.yml
  docker-compose.local.yml
  .env.example
  README.md
```

## Quick Start (Docker Compose)

This is the **only** way you need to run the full stack. All services (DB, queue, backend, frontend) are brought up together.

```bash
# 1. Copy the environment file
cp .env.example .env

# 2. Build and start everything
docker compose up --build

# 3. Wait for all services to be healthy, then open:
#    - Frontend:   http://localhost:3000
#    - API:        http://localhost:8000
#    - API docs:   http://localhost:8000/docs
#    - LocalStack: http://localhost:4566
```

### Verify Services Are Running

```bash
# Backend health check
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"dass"}

# Metrics
curl http://localhost:8000/metrics
# Expected: {"jobs":0,"tasks":0}
```

### Seed Example Data

```bash
docker compose exec api-server python scripts/seed.py
```

### Stop

```bash
docker compose down
```

### Rebuild From Scratch (including database)

```bash
docker compose down -v
docker compose up --build
```

## Viewing Logs

```bash
# All services at once (recommended)
docker compose logs -f

# Individual services
docker compose logs -f api-server
docker compose logs -f scheduler
docker compose logs -f worker
docker compose logs -f frontend
```

To enable verbose logging, edit `.env` and set `DASS_LOG_LEVEL=DEBUG`, then restart:

```bash
docker compose up --build
```

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `connection refused` on port 8000 | API server still starting or crashed | Check `docker compose logs api-server` |
| API server restarts repeatedly | Database or LocalStack not ready yet | Wait — Docker healthchecks handle ordering. If persistent, run `docker compose down -v && docker compose up --build` |
| Frontend shows blank page | Frontend container still building | Check `docker compose logs frontend` — Next.js build takes a moment |

## Database Migrations

Migrations run automatically when the API server starts (`entrypoint.sh` runs `alembic upgrade head`). To run manually:

```bash
docker compose exec api-server alembic upgrade head
```

## Worker Scaling

Workers are horizontally scalable:

```bash
docker compose up --scale worker=3
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/jobs` | Create a job |
| `GET` | `/api/v1/jobs` | List all jobs |
| `GET` | `/api/v1/jobs/{id}` | Get a single job |
| `PUT` | `/api/v1/jobs/{id}` | Update a job |
| `DELETE` | `/api/v1/jobs/{id}` | Delete a job |
| `POST` | `/api/v1/jobs/{id}/trigger` | Manually trigger a job |
| `GET` | `/api/v1/jobs/{id}/tasks` | List tasks for a job |
| `POST` | `/api/v1/tasks/{id}/retry` | Retry a failed task |
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Job and task counts |

Interactive API documentation is available at `http://localhost:8000/docs` when the server is running.

## Development Workflow (Optional)

If you want **hot reload** for backend or frontend code while all infrastructure (DB, LocalStack) stays in Docker, use the local override file:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

This mounts `backend/` and `frontend/` source into the containers so code changes take effect immediately without rebuilding images.

### Running Backend or Frontend Outside Docker

If you prefer to run the backend or frontend directly on your host (e.g. for debugger support), you can stop the corresponding Docker service and run it locally instead. **You still need the Docker services for PostgreSQL and LocalStack.**

```bash
# Keep infra running
docker compose up postgres localstack -d

# Backend (from backend/)
cd backend
uv sync --extra dev
DASS_DATABASE_URL=postgresql+psycopg://dass:dass@localhost:5432/dass \
DASS_SQS_ENDPOINT_URL=http://localhost:4566 \
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (from frontend/)
cd frontend
npm install
npm run dev
```

Note: when running outside Docker, the database URL must use `localhost` instead of `postgres`, and the SQS endpoint must use `localhost` instead of `localstack`.

## Implementation Status

This repository is a scaffold — the architecture, interfaces, models, schemas, tests, and infrastructure are all in place, but the business logic has been hollowed out for the team to implement.

The frontend dashboard also shows placeholder pages — the three interactive views (jobs-list-page, job-detail-page, job-form-page) are scaffolded but not yet implemented.

The provided test suite (tests/) serves as the acceptance criteria. Once your implementations replace the NotImplementedError stubs, the tests should pass.

## Notes

- PostgreSQL is the source of truth.
- SQS is used only as a delivery mechanism.
- The Next.js frontend proxies API requests to the backend through rewrites, so the browser stays on one origin and avoids CORS issues.
- The scheduler runs every 5 seconds and is responsible for deciding when work should be dispatched.
- Workers claim tasks atomically and report results back to PostgreSQL.
- Shell execution is supported for local and internal use, but it is dangerous in production and should be restricted carefully.
