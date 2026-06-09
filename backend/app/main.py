from __future__ import annotations

import threading
import time

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.jobs import router as jobs_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.vms import router as vms_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import SessionLocal

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title="dass API", version="0.1.0")
DEFAULT_TLS_ORIGINS = {"https://localhost:8443", "https://127.0.0.1:8443"}
DEFAULT_HTTP_ORIGINS = {"http://localhost", "http://127.0.0.1", "http://localhost:3000", "http://127.0.0.1:3000"}
_METRICS_EXCLUDED_PREFIXES = ("/health", "/metrics", "/docs", "/redoc", "/openapi.json", "/internal/")

app.state.request_metrics = {
    "inflight": 0,
    "total_requests": 0,
    "failed_requests": 0,
    "total_duration_seconds": 0.0,
    "last_duration_seconds": 0.0,
}
app.state.request_metrics_lock = threading.Lock()


def _normalize_cors_origins(raw: str) -> list[str]:
    if raw == "*":
        return ["*"]

    origins: list[str] = []
    seen: set[str] = set()
    for origin in [origin.strip() for origin in raw.split(",")]:
        if not origin or origin in seen:
            continue
        origins.append(origin)
        seen.add(origin)

    for origin in [*DEFAULT_HTTP_ORIGINS, *DEFAULT_TLS_ORIGINS]:
        if origin not in seen:
            origins.append(origin)
            seen.add(origin)

    return origins


origins = _normalize_cors_origins(settings.cors_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(tasks_router)
app.include_router(vms_router)


@app.middleware("http")
async def record_request_metrics(request: Request, call_next):
    path = request.url.path
    if path.startswith(_METRICS_EXCLUDED_PREFIXES):
        return await call_next(request)

    metrics = app.state.request_metrics
    lock = app.state.request_metrics_lock
    started = time.perf_counter()

    with lock:
        metrics["inflight"] += 1

    try:
        response = await call_next(request)
        return response
    except Exception:
        with lock:
            metrics["failed_requests"] += 1
        raise
    finally:
        elapsed = time.perf_counter() - started
        with lock:
            metrics["inflight"] -= 1
            metrics["total_requests"] += 1
            metrics["total_duration_seconds"] += elapsed
            metrics["last_duration_seconds"] = elapsed


@app.get("/health")
def health():
    """Health check endpoint：確認 DB 連線正常。
    #   1. 用 SessionLocal() 開 session
    #   2. 執行 SELECT 1 確認 DB 連線
    #   3. 回傳 {"status": "ok", "service": "dass"}
    """
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "dass"}

@app.get("/metrics")
def metrics():
    """回傳 Job 和 Task 的統計數字。
    #   1. 用 SessionLocal() 開 session
    #   2. SELECT count(*) FROM jobs
    #   3. SELECT count(*) FROM tasks
    #   4. 回傳 {"jobs": int, "tasks": int}
    """
    with SessionLocal() as db:
        num_jobs = db.execute(text("SELECT count(*) FROM jobs")).scalar()
        num_tasks = db.execute(text("SELECT count(*) FROM tasks")).scalar()
    return {"jobs": num_jobs, "tasks": num_tasks}


@app.get("/internal/instance-metrics")
def instance_metrics():
    """Return per-container load data for the API autoscaler."""
    metrics = app.state.request_metrics
    lock = app.state.request_metrics_lock
    with lock:
        total_requests = metrics["total_requests"]
        total_duration_seconds = metrics["total_duration_seconds"]
        average_duration_seconds = (
            total_duration_seconds / total_requests if total_requests else 0.0
        )
        return {
            "inflight": metrics["inflight"],
            "total_requests": total_requests,
            "failed_requests": metrics["failed_requests"],
            "average_duration_ms": round(average_duration_seconds * 1000, 3),
            "last_duration_ms": round(metrics["last_duration_seconds"] * 1000, 3),
        }
