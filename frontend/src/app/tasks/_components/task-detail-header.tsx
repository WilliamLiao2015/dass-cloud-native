"use client"

import Link from "next/link"

function DetailBadge({
  label,
  tone,
}: {
  label: string
  tone: "success" | "muted" | "danger"
}) {
  const toneClasses = {
    success: "bg-success/15 text-success ring-success/30",
    muted: "bg-panel-strong text-muted ring-line",
    danger: "bg-danger/15 text-danger ring-danger/30",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}

function getTaskStatusTone(status: string) {
  if (status === "success") return "success"
  if (status === "failed" || status === "final_failed") return "danger"
  return "muted"
}

export function TaskDetailHeader({
  taskId,
  jobId,
  status,
  triggerType,
  retryCount,
}: {
  taskId: string
  jobId: string
  status: string
  triggerType: string
  retryCount: number
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            Task Detail
          </p>
          <DetailBadge
            label={status.replace(/_/g, " ")}
            tone={getTaskStatusTone(status)}
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-fg">Execution {taskId}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Review the persisted execution metadata, logs, and final result for
            this task.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            {taskId}
          </span>
          <Link
            className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono transition hover:border-accent/40 hover:text-accent"
            href={`/jobs/${jobId}`}
          >
            {jobId}
          </Link>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            {triggerType}
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            retries {retryCount}
          </span>
        </div>
      </div>
    </div>
  )
}
