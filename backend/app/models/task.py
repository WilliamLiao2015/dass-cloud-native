from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, Index
from sqlalchemy import text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_job_id", "job_id"),
        Index("ix_tasks_status", "status"),
        Index(
            "ix_tasks_locked_until_running",
            "locked_until",
            postgresql_where=text("status = 'running'"),
        ),
    )

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=uuid4)
    job_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(32), nullable=False)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    locked_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    stdout: Mapped[str | None] = mapped_column(Text, nullable=True)
    stderr: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    processed_for_chaining: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    job = relationship("Job", back_populates="tasks")
