"""Docker-backed scaling helpers for api-server replicas."""
from __future__ import annotations

import logging
import os
from typing import List
from uuid import uuid4

logger = logging.getLogger(__name__)

try:
    import docker
    from docker.errors import DockerException, NotFound

    _DOCKER_IMPORT_OK = True
except ImportError:
    _DOCKER_IMPORT_OK = False
    docker = None  # type: ignore[assignment]


_PROJECT_LABEL = "com.dass.project=dass"
_SERVICE_LABEL = "com.dass.service=api-server"
_AUTOSCALED_LABEL = "com.dass.autoscaled=true"
_TEMPLATE_CONTAINER_NAME = os.environ.get("DASS_API_TEMPLATE", "dass-api-server-1")


class ApiService:
    """Manages the api-server container fleet."""

    def __init__(self) -> None:
        self._client = None
        self._mock_replicas: list[str] = []
        if not _DOCKER_IMPORT_OK:
            logger.warning("docker SDK not installed; ApiService in mock mode")
            return
        try:
            self._client = docker.from_env()
            self._client.ping()
            logger.info("ApiService connected to Docker daemon")
        except DockerException as exc:
            logger.warning("Docker not reachable (%s); ApiService in mock mode", exc)
            self._client = None

    def _list_replicas(self, autoscaled_only: bool = False):
        if self._client is None:
            return []
        labels = [_PROJECT_LABEL, _SERVICE_LABEL]
        if autoscaled_only:
            labels.append(_AUTOSCALED_LABEL)
        try:
            return self._client.containers.list(filters={"label": labels})
        except DockerException:
            logger.exception("docker list failed")
            return []

    def list_replicas(self):
        """Return the running api-server containers."""
        return self._list_replicas()

    def _template_container(self):
        if self._client is None:
            return None
        try:
            return self._client.containers.get(_TEMPLATE_CONTAINER_NAME)
        except NotFound:
            pass
        candidates = self._list_replicas()
        return candidates[0] if candidates else None

    def get_active_replicas(self) -> List[str]:
        if self._client is None:
            return list(self._mock_replicas)
        return [c.name for c in self._list_replicas()]

    def create_replicas(self, count: int) -> List[str]:
        if count <= 0:
            return []

        if self._client is None:
            new = [f"api-{uuid4().hex[:8]}" for _ in range(count)]
            self._mock_replicas.extend(new)
            logger.info("[mock] create_replicas(%d) -> %s", count, new)
            return new

        template = self._template_container()
        if template is None:
            logger.error("create_replicas: no template api-server container available")
            return []

        attrs = template.attrs
        image = attrs["Config"]["Image"]
        env_list = attrs["Config"].get("Env") or []
        cmd = attrs["Config"].get("Cmd")
        base_labels = dict(attrs["Config"].get("Labels") or {})
        networks = attrs.get("NetworkSettings", {}).get("Networks", {})
        network_name = next(iter(networks.keys()), "dass_dass-net")

        env_dict: dict[str, str] = {}
        for entry in env_list:
            key, _, value = entry.partition("=")
            if key:
                env_dict[key] = value

        created: list[str] = []
        for _ in range(count):
            suffix = uuid4().hex[:8]
            name = f"dass-api-server-autoscaled-{suffix}"
            env_dict["DASS_WORKER_ID"] = f"api-server-as-{suffix}"
            labels = dict(base_labels)
            labels.update(
                {
                    "com.dass.project": "dass",
                    "com.dass.service": "api-server",
                    "com.dass.autoscaled": "true",
                }
            )
            try:
                container = self._client.containers.run(
                    image,
                    command=cmd,
                    name=name,
                    detach=True,
                    environment=env_dict,
                    network=network_name,
                    labels=labels,
                    restart_policy={"Name": "unless-stopped"},
                )
                created.append(container.name)
                logger.info("✨ scaled up api container=%s", container.name)
            except DockerException:
                logger.exception("Failed to start api container=%s", name)
        return created

    def terminate_replicas(self, count: int) -> List[str]:
        if count <= 0:
            return []

        if self._client is None:
            removed: list[str] = []
            while count > 0 and self._mock_replicas:
                removed.append(self._mock_replicas.pop(0))
                count -= 1
            logger.info("[mock] terminate_replicas -> %s", removed)
            return removed

        autoscaled = self._list_replicas(autoscaled_only=True)
        autoscaled.sort(key=lambda c: c.attrs.get("Created", ""))
        victims = autoscaled[:count]

        terminated: list[str] = []
        for container in victims:
            try:
                container.stop(timeout=1)
                container.remove(force=False)
                terminated.append(container.name)
                logger.info("🗑  scaled down api container=%s", container.name)
            except DockerException:
                logger.exception("Failed to stop api container=%s", container.name)
        return terminated


api_service = ApiService()
