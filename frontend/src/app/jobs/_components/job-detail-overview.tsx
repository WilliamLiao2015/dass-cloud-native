"use client"

import { formatDateTime } from "../_lib/jobs-list.utils"

function formatActionConfig(actionConfig: Record<string, unknown>) {
  const entries = Object.entries(actionConfig ?? {})

  if (entries.length === 0) {
    return "No config"
  }

  return JSON.stringify(actionConfig, null, 2)
}

export function JobDetailOverview({
  createdAt,
  cronExpression,
  maxRetries,
  nextFireAt,
  tasksCount,
  updatedAt,
  actionConfig,
}: {
  createdAt: string
  cronExpression: string
  maxRetries: number
  nextFireAt: string
  tasksCount: number
  updatedAt: string
  actionConfig: Record<string, unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Schedule and action
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Cron
            </p>
            <p className="mt-2 font-mono text-sm text-fg">{cronExpression}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Next fire
            </p>
            <p className="mt-2 text-sm text-fg">{formatDateTime(nextFireAt)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Max retries
            </p>
            <p className="mt-2 text-sm text-fg">{maxRetries}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-strong p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Updated
            </p>
            <p className="mt-2 text-sm text-fg">{formatDateTime(updatedAt)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Action config
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-line bg-panel p-4 text-xs text-fg">
            {formatActionConfig(actionConfig)}
          </pre>
        </div>
      </section>

      <aside className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Activity
        </h3>
        <div className="rounded-2xl border border-line bg-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Created
          </p>
          <p className="mt-2 text-sm text-fg">{formatDateTime(createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Task count
          </p>
          <p className="mt-2 text-sm text-fg">{tasksCount}</p>
        </div>
      </aside>
    </div>
  )
}
