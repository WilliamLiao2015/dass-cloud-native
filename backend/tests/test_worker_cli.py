from __future__ import annotations

import asyncio
from contextlib import contextmanager
from types import SimpleNamespace

import pytest

from app.cli import _run_dedicated_pool_async
from app.queue.base import QueueMessage


class _FakeQueue:
    def __init__(self) -> None:
        self.receive_calls: list[int] = []
        self.messages = [
            QueueMessage(body=f'{{"task_id":"task-{i}"}}', receipt_handle=f"rh-{i}")
            for i in range(10)
        ]

    def receive_tasks(self, max_messages: int = 1, wait_time_seconds: int = 10):
        self.receive_calls.append(max_messages)
        batch = self.messages[:max_messages]
        self.messages = self.messages[max_messages:]
        return batch

    def delete_message(self, receipt_handle: str) -> None:
        pass

    def change_message_visibility(self, receipt_handle: str, visibility_seconds: int) -> None:
        pass


@contextmanager
def _fake_session():
    yield object()


@pytest.mark.asyncio
async def test_worker_pool_does_not_overfetch_when_slots_are_full(monkeypatch):
    """The worker should only receive messages when local execution capacity exists."""
    started = 0
    release = asyncio.Event()

    class _FakeWorkerService:
        def __init__(self, **kwargs) -> None:
            pass

        async def process_task_id_async(self, task_id: str, extend_visibility=None) -> bool:
            nonlocal started
            started += 1
            await release.wait()
            return True

    monkeypatch.setattr("app.cli.SessionLocal", _fake_session)
    monkeypatch.setattr("app.cli.WorkerService", _FakeWorkerService)

    queue = _FakeQueue()
    settings = SimpleNamespace(worker_id="worker-test", worker_visibility_timeout_seconds=30)
    pool_task = asyncio.create_task(
        _run_dedicated_pool_async(queue, "normal", max_concurrent=2, settings=settings, retry_queue=queue)
    )

    try:
        for _ in range(20):
            if started == 2:
                break
            await asyncio.sleep(0.01)

        assert started == 2
        assert queue.receive_calls == [2]
    finally:
        release.set()
        pool_task.cancel()
        await pool_task
