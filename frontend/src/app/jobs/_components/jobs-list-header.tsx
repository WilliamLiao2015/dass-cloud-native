"use client"

import Link from "next/link"

export function JobsListHeader({
  isLoading,
  onRefresh,
  total,
}: {
  isLoading: boolean
  onRefresh: () => void
  total: number
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Jobs</p>
        <h2 className="mt-2 text-2xl font-semibold">Scheduled jobs</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Browse all scheduled jobs, inspect their cron expressions and runtime
          settings, and jump into creation when you need a new one.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm text-muted">
          {isLoading ? "Loading..." : `${total} jobs`}
        </div>
        <button
          className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm font-medium text-fg transition hover:border-accent/40 hover:bg-panel"
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
        <Link
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          href="/jobs/new"
        >
          Create Job
        </Link>
      </div>
    </div>
  )
}
