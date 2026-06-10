"use client"

import { useMemo, useState } from "react"

import type { Job } from "../../../types"

type JobDependencyComboboxProps = {
  description: string
  error?: string
  isLoading?: boolean
  loadingLabel?: string
  label: string
  options: Job[]
  selectedIds: string[]
  currentJobId?: string
  onChange: (selectedIds: string[]) => void
}

export function JobDependencyCombobox({
  description,
  error,
  isLoading,
  loadingLabel = "Loading jobs...",
  label,
  options,
  selectedIds,
  currentJobId,
  onChange,
}: JobDependencyComboboxProps) {
  const [query, setQuery] = useState("")

  const optionMap = useMemo(
    () => new Map(options.map(job => [job.id, job])),
    [options]
  )

  const selectedJobs = selectedIds
    .map(id => optionMap.get(id))
    .filter((job): job is Job => Boolean(job))

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return options
      .filter(job => job.id !== currentJobId)
      .filter(job => !selectedIds.includes(job.id))
      .filter(job => {
        if (!normalizedQuery) {
          return true
        }

        return (
          job.name.toLowerCase().includes(normalizedQuery) ||
          job.id.toLowerCase().includes(normalizedQuery)
        )
      })
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [currentJobId, options, query, selectedIds])

  const addJob = (jobId: string) => {
    onChange([...selectedIds, jobId])
    setQuery("")
  }

  const removeJob = (jobId: string) => {
    onChange(selectedIds.filter(id => id !== jobId))
  }

  return (
    <section className="space-y-4 rounded-3xl border border-line bg-panel-strong/50 p-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          {label}
        </h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>

      <div className="space-y-3">
        <label className="flex flex-col gap-2 text-sm text-muted">
          <span>Selected jobs</span>
          <div className="rounded-2xl border border-line bg-panel px-3 py-3">
            {selectedJobs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedJobs.map(job => (
                  <div
                    className="flex items-center gap-2 rounded-full border border-line bg-panel-strong px-3 py-1.5 text-xs text-fg"
                    key={job.id}
                  >
                    <span className="font-medium">{job.name}</span>
                    <span className="font-mono text-muted">{job.id}</span>
                    <button
                      className="text-muted transition hover:text-danger"
                      onClick={() => removeJob(job.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No jobs selected yet.</p>
            )}
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted">
          <span>Search jobs</span>
          <input
            className="rounded-2xl border border-line bg-panel px-4 py-2.5 font-medium text-fg outline-none transition placeholder:text-muted/45 focus:border-accent/50"
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by job name or ID"
            value={query}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-line bg-panel px-3 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Available jobs
          </p>
          <p className="text-xs text-muted">{filteredOptions.length} results</p>
        </div>
        <div className="max-h-64 space-y-2 overflow-auto pr-1">
          {isLoading ? (
            <p className="px-1 py-3 text-sm text-muted">{loadingLabel}</p>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map(job => (
              <button
                className="flex w-full flex-col gap-1 rounded-2xl border border-line bg-panel-strong px-4 py-3 text-left transition hover:border-accent/40 hover:bg-panel"
                key={job.id}
                onClick={() => addJob(job.id)}
                type="button"
              >
                <span className="text-sm font-semibold text-fg">
                  {job.name}
                </span>
                <span className="font-mono text-xs text-muted">{job.id}</span>
              </button>
            ))
          ) : (
            <p className="px-1 py-3 text-sm text-muted">
              {options.length === 0
                ? "No jobs available to select."
                : "No matching jobs found."}
            </p>
          )}
        </div>
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </section>
  )
}
