"use client"

import type { ActionTypeFilter, EnabledFilter } from "../_lib/jobs-list.types"

export function JobsListFilters({
  actionTypeFilter,
  enabledFilter,
  onActionTypeFilterChange,
  onEnabledFilterChange,
  onPageSizeChange,
  onQueryInputChange,
  onReset,
  onSubmit,
  pageSize,
  queryInput,
}: {
  actionTypeFilter: ActionTypeFilter
  enabledFilter: EnabledFilter
  onActionTypeFilterChange: (value: ActionTypeFilter) => void
  onEnabledFilterChange: (value: EnabledFilter) => void
  onPageSizeChange: (value: number) => void
  onQueryInputChange: (value: string) => void
  onReset: () => void
  onSubmit: () => void
  pageSize: number
  queryInput: string
}) {
  return (
    <form
      className="mt-6 grid gap-4 rounded-3xl border border-line bg-panel-strong/50 p-4 lg:grid-cols-[1.6fr_0.8fr_0.8fr_0.6fr_auto]"
      onSubmit={event => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="flex flex-col gap-2 text-sm text-muted">
        <span>Search</span>
        <input
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-fg outline-none transition placeholder:text-muted focus:border-accent/50"
          onChange={event => onQueryInputChange(event.target.value)}
          placeholder="Search by job name"
          value={queryInput}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-muted">
        <span>State</span>
        <select
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-fg outline-none transition focus:border-accent/50"
          onChange={event => {
            onEnabledFilterChange(event.target.value as EnabledFilter)
          }}
          value={enabledFilter}
        >
          <option value="all">All</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-muted">
        <span>Action type</span>
        <select
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-fg outline-none transition focus:border-accent/50"
          onChange={event => {
            onActionTypeFilterChange(event.target.value as ActionTypeFilter)
          }}
          value={actionTypeFilter}
        >
          <option value="all">All</option>
          <option value="http">HTTP</option>
          <option value="shell">Shell</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-muted">
        <span>Page size</span>
        <select
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-fg outline-none transition focus:border-accent/50"
          onChange={event => onPageSizeChange(Number(event.target.value))}
          value={pageSize}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
      <div className="flex items-end gap-3">
        <button
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm font-medium text-fg transition hover:border-accent/40 hover:bg-panel-strong"
          type="submit"
        >
          Apply
        </button>
        <button
          className="rounded-2xl border border-line bg-panel-strong px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-fg"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
