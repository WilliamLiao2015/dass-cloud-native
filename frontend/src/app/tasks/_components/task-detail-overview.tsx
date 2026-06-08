"use client"

import { formatDateTime } from "../../jobs/_lib/jobs-list.utils"

function formatValue(value: string | null) {
  return value ? value : "Not available"
}

export function TaskDetailOverview({
  createdAt,
  finishedAt,
  jobId,
  lockedBy,
  lockedUntil,
  startedAt,
}: {
  createdAt: string
  finishedAt: string | null
  jobId: string
  lockedBy: string | null
  lockedUntil: string | null
  startedAt: string | null
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Execution metadata
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Job
            </p>
            <p className="mt-2 font-mono text-sm text-fg">{jobId}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Created
            </p>
            <p className="mt-2 text-sm text-fg">{formatDateTime(createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Started
            </p>
            <p className="mt-2 text-sm text-fg">
              {startedAt ? formatDateTime(startedAt) : "Not started"}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Finished
            </p>
            <p className="mt-2 text-sm text-fg">
              {finishedAt ? formatDateTime(finishedAt) : "Not finished"}
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Lock state
        </h3>
        <div className="rounded-2xl border border-line bg-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Locked by
          </p>
          <p className="mt-2 text-sm text-fg">{formatValue(lockedBy)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Locked until
          </p>
          <p className="mt-2 text-sm text-fg">
            {lockedUntil ? formatDateTime(lockedUntil) : "Not locked"}
          </p>
        </div>
      </aside>
    </div>
  )
}
