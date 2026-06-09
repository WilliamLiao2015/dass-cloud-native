from __future__ import annotations

import logging
import math
from typing import Any

import httpx

from app.core.config import Settings
from app.services.api_service import api_service

logger = logging.getLogger(__name__)


MIN_REPLICAS = 1
MAX_REPLICAS = 8
INFLIGHT_PER_REPLICA = 6
REQUEST_TIMEOUT_SECONDS = 1.5


class APIAutoScaler:
    """Scale api-server containers from per-instance load snapshots."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.enabled = settings.execution_backend == "docker"
        if not self.enabled:
            logger.info(
                "APIAutoScaler disabled: execution_backend=%s", settings.execution_backend
            )

    def _container_metrics(self, container) -> dict[str, Any]:
        attrs = container.attrs
        networks = attrs.get("NetworkSettings", {}).get("Networks", {})
        network = next(iter(networks.values()), {})
        ip_address = network.get("IPAddress")
        if not ip_address:
            return {"name": container.name, "healthy": False}

        url = f"http://{ip_address}:{self.settings.api_port}/internal/instance-metrics"
        try:
            response = httpx.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
            response.raise_for_status()
            payload = response.json()
            return {
                "name": container.name,
                "healthy": True,
                "inflight": int(payload.get("inflight", 0)),
                "requests_total": int(payload.get("total_requests", 0)),
                "failed_requests": int(payload.get("failed_requests", 0)),
                "average_duration_ms": float(payload.get("average_duration_ms", 0.0)),
            }
        except Exception:
            logger.exception("Failed to read api metrics from container=%s", container.name)
            return {"name": container.name, "healthy": False}

    def _sample(self) -> tuple[list[dict[str, Any]], int]:
        containers = api_service.list_replicas()
        samples = [self._container_metrics(container) for container in containers]
        current = len(containers)
        return samples, current

    def decide(self) -> tuple[int, dict[str, Any]]:
        samples, current = self._sample()
        healthy_samples = [sample for sample in samples if sample.get("healthy", True)]
        if not healthy_samples:
            desired = max(MIN_REPLICAS, current or MIN_REPLICAS)
            snapshot = {
                "current": current,
                "desired": desired,
                "pressure": 0,
                "samples": [],
                "reason": "no_samples",
            }
            return desired, snapshot

        total_inflight = sum(int(sample.get("inflight", 0)) for sample in healthy_samples)
        pressure = math.ceil(total_inflight / INFLIGHT_PER_REPLICA) if total_inflight else 0
        desired = max(MIN_REPLICAS, min(MAX_REPLICAS, pressure or MIN_REPLICAS))

        snapshot = {
            "current": current,
            "desired": desired,
            "pressure": pressure,
            "samples": healthy_samples,
            "total_inflight": total_inflight,
        }
        return desired, snapshot

    def apply(self) -> None:
        if not self.enabled:
            return

        desired, snapshot = self.decide()
        current = len(api_service.get_active_replicas())
        diff = desired - current

        logger.info(
            "api-autoscale: current=%s desired=%s diff=%s snapshot=%s",
            current,
            desired,
            diff,
            snapshot,
        )

        if diff > 0:
            api_service.create_replicas(diff)
        elif diff < 0:
            api_service.terminate_replicas(-diff)
