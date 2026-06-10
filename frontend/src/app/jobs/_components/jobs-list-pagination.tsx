"use client"

import { useEffect, useState } from "react"

export function JobsListPagination({
  firstItem,
  isFetching,
  lastItem,
  onNext,
  onPrevious,
  onPageChange,
  page,
  total,
  totalPages,
}: {
  firstItem: number
  isFetching: boolean
  lastItem: number
  onNext: () => void
  onPrevious: () => void
  onPageChange: (page: number) => void
  page: number
  total: number
  totalPages: number
}) {
  const [pageInput, setPageInput] = useState(String(page))

  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  const handlePageSubmit = () => {
    const parsedPage = Number(pageInput)

    if (!Number.isInteger(parsedPage)) {
      setPageInput(String(page))
      return
    }

    const nextPage = Math.min(Math.max(parsedPage, 1), Math.max(totalPages, 1))
    setPageInput(String(nextPage))
    onPageChange(nextPage)
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-line bg-panel-strong/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted">
        Showing {firstItem}-{lastItem} of {total} jobs
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <form
          className="flex items-center gap-2"
          onSubmit={event => {
            event.preventDefault()
            handlePageSubmit()
          }}
        >
          <label className="flex items-center gap-2 text-sm text-muted">
            <span>Go to</span>
            <input
              className="w-20 rounded-2xl border border-line bg-panel px-3 py-2 text-fg outline-none transition placeholder:text-muted focus:border-accent/50"
              inputMode="numeric"
              min={1}
              onChange={event => setPageInput(event.target.value)}
              placeholder="Page"
              type="number"
              value={pageInput}
            />
          </label>
          <button
            className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm font-medium text-fg transition disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isFetching || totalPages <= 1}
            type="submit"
          >
            Jump
          </button>
        </form>
      </div>
    </div>
  )
}
