"use client"

export function JobsListPagination({
  firstItem,
  isFetching,
  lastItem,
  onNext,
  onPrevious,
  page,
  total,
  totalPages,
}: {
  firstItem: number
  isFetching: boolean
  lastItem: number
  onNext: () => void
  onPrevious: () => void
  page: number
  total: number
  totalPages: number
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-line bg-panel-strong/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted">
        Showing {firstItem}-{lastItem} of {total} jobs
      </div>
      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm font-medium text-fg transition disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1 || isFetching}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </button>
        <div className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm text-muted">
          Page {page} of {totalPages}
        </div>
        <button
          className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm font-medium text-fg transition disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages || isFetching}
          onClick={onNext}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}
