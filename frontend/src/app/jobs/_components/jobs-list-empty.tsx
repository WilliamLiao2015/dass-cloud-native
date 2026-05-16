"use client"

import Link from "next/link"

export function JobsListEmpty({
  filtersApplied,
  onClearFilters,
}: {
  filtersApplied: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-line bg-panel-strong/60 p-10 text-center">
      <h3 className="text-lg font-semibold">
        {filtersApplied ? "No matching jobs" : "No jobs yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
        {filtersApplied
          ? "Try widening the search or clearing the filters to see more results."
          : "Create your first scheduled job to start automating tasks on a cron schedule."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {filtersApplied ? (
          <button
            className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel"
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </button>
        ) : null}
        <Link
          className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          href="/jobs/new"
        >
          Create Job
        </Link>
      </div>
    </div>
  )
}
