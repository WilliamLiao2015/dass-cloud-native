from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    UniqueConstraint,
    func,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID, JSONBCompat


job_dependencies = Table(
    "job_dependencies",
    Base.metadata,
    Column(
        "upstream_job_id",
        GUID(),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "downstream_job_id",
        GUID(),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("name", name="uq_jobs_name"),)

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="scheduled", index=True
    )  # 任務類型，預設為定時任務，並建立索引 (B+ 樹)
    cron_expression: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # 即時任務不需要 Cron，所以改為允許為空 (nullable=True)
    action_type: Mapped[str] = mapped_column(String(32), nullable=False)
    action_config: Mapped[dict] = mapped_column(JSONBCompat(), nullable=False)
    # S4: ContainerSpec 預先翻好的字典；JobService 在 create/update 時填入，worker 直接吃。
    runtime_spec: Mapped[dict | None] = mapped_column(JSONBCompat(), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    concurrency_policy: Mapped[str] = mapped_column(String(32), nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_fire_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )  # 即時任務不需要下次執行時間，改為允許為空，並建立時間排序索引 (B+ 樹)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    tasks = relationship("Task", back_populates="job", cascade="all, delete-orphan")

    # 定義「下游任務」 (這個 Job 跑完後，可能要觸發誰)
    downstream_jobs = relationship(
        "Job",
        secondary=job_dependencies,
        primaryjoin="Job.id == job_dependencies.c.upstream_job_id",
        secondaryjoin="Job.id == job_dependencies.c.downstream_job_id",
        back_populates="upstream_jobs",
    )
    # 定義「上游任務」 (這個 Job 要等哪些任務跑完)
    upstream_jobs = relationship(
        "Job",
        secondary=job_dependencies,
        primaryjoin="Job.id == job_dependencies.c.downstream_job_id",
        secondaryjoin="Job.id == job_dependencies.c.upstream_job_id",
        back_populates="downstream_jobs",
    )

    @property
    def upstream_job_ids(self) -> list[str]:
        return [str(job.id) for job in self.upstream_jobs]

    @property
    def downstream_job_ids(self) -> list[str]:
        return [str(job.id) for job in self.downstream_jobs]
