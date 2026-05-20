# Docker

Run the full stack (Next.js frontend + FastAPI backend + SQLite on a volume) with Docker Compose.

## Prerequisites

- Docker Engine 24+ and Docker Compose v2

## Quick start

From the repository root:

```bash
cp .env.docker.example .env
# Edit .env and set SECRET_KEY to a long random string (32+ characters).

docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000  
- API docs: http://localhost:8000/docs  

Persistent data (SQLite database and RSA keys) is stored in the `backend_data` Docker volume at `/data` inside the backend container.

## Environment variables

| Variable | Service | Description |
|----------|---------|-------------|
| `SECRET_KEY` | backend | Required. Signs JWT access tokens. |
| `CORS_ORIGINS` | backend | Comma-separated browser origins (default `http://localhost:3000`). |
| `NEXT_PUBLIC_API_URL` | frontend (build + runtime) | URL the browser uses for API calls. Must match how you expose port 8000 on the host. |
| `DATA_DIR` | backend | Set automatically in Compose to `/data` for volume persistence. |

`NEXT_PUBLIC_API_URL` is baked into the frontend image at **build** time. If you change it, rebuild:

```bash
docker compose build frontend
docker compose up -d
```

## Commands

```bash
# Detached
docker compose up -d --build

# Stop
docker compose down

# Stop and remove persisted DB/keys volume
docker compose down -v
```

## Images

- `backend/Dockerfile` — Python 3.12, Uvicorn on port 8000  
- `frontend/Dockerfile` — multi-stage Next.js `standalone` build on port 3000  

## Local development without Docker

Continue using `uvicorn` and `npm run dev` as before. Set `DATA_DIR` only if you want a custom data directory; otherwise files remain under `backend/`.
