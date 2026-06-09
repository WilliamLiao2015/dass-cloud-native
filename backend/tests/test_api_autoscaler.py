from __future__ import annotations

from unittest.mock import MagicMock

from app.services.api_autoscaler_service import (
    APIAutoScaler,
    INFLIGHT_PER_REPLICA,
    MAX_REPLICAS,
    MIN_REPLICAS,
)


def _make_settings():
    settings = MagicMock()
    settings.execution_backend = "docker"
    settings.api_port = 8000
    return settings


def _make_scaler():
    scaler = APIAutoScaler(_make_settings())
    scaler._sample = lambda: ([], 1)
    return scaler


class TestAPIAutoScalerDecide:
    def test_idle_returns_min_replicas(self):
        scaler = _make_scaler()
        scaler._sample = lambda: ([{"name": "api-1", "inflight": 0, "requests_total": 10}], 1)

        desired, snapshot = scaler.decide()

        assert desired == MIN_REPLICAS
        assert snapshot["pressure"] == 0
        assert snapshot["total_inflight"] == 0

    def test_inflight_drives_scale_up(self):
        scaler = _make_scaler()
        scaler._sample = lambda: (
            [
                {"name": "api-1", "inflight": 7, "requests_total": 10},
                {"name": "api-2", "inflight": 6, "requests_total": 8},
            ],
            2,
        )

        desired, snapshot = scaler.decide()

        assert snapshot["total_inflight"] == 13
        assert snapshot["pressure"] == 3
        assert desired == 3

    def test_clamps_to_max_replicas(self):
        scaler = _make_scaler()
        scaler._sample = lambda: ([{"name": "api-1", "inflight": 1000, "requests_total": 10}], 1)

        desired, _ = scaler.decide()

        assert desired == MAX_REPLICAS

    def test_handles_no_samples_without_thrash(self):
        scaler = _make_scaler()
        scaler._sample = lambda: ([], 4)

        desired, snapshot = scaler.decide()

        assert desired == 4
        assert snapshot["reason"] == "no_samples"

    def test_partial_capacity_rounds_up(self):
        scaler = _make_scaler()
        scaler._sample = lambda: ([{"name": "api-1", "inflight": INFLIGHT_PER_REPLICA + 1, "requests_total": 10}], 1)

        desired, snapshot = scaler.decide()

        assert snapshot["pressure"] == 2
        assert desired == 2
