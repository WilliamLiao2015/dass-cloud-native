"use client"

import Link from "next/link"

function DetailBadge({
  label,
  tone,
}: {
  label: string
  tone: "success" | "muted"
}) {
  const toneClasses = {
    success: "bg-success/15 text-success ring-success/30",
    muted: "bg-panel-strong text-muted ring-line",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}

export function JobDetailHeader({
  jobId,
  jobName,
  enabled,
  actionType,
  concurrencyPolicy,
  isTriggering,
  isDeleting,
  onTrigger,
  onDelete,
}: {
  jobId: string
  jobName: string
  enabled: boolean
  actionType: string
  concurrencyPolicy: string
  isTriggering: boolean
  isDeleting: boolean
  onTrigger: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            Job Detail
          </p>
          <DetailBadge
            label={enabled ? "Enabled" : "Disabled"}
            tone={enabled ? "success" : "muted"}
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-fg">{jobName}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Inspect the schedule, review the action payload, trigger it
            manually, or remove the job if it is no longer needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            {jobId}
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            {actionType}
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            {concurrencyPolicy}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel"
          href={`/jobs/new?jobId=${jobId}`}
        >
          Edit
        </Link>
        <button
          className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTriggering}
          onClick={onTrigger}
          type="button"
        >
          {isTriggering ? "Triggering..." : "Trigger now"}
        </button>
        <button
          className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={onDelete}
          type="button"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  )
}
