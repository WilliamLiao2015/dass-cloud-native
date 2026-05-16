"use client"

export function JobsListError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mt-6 rounded-3xl border border-danger/30 bg-danger/10 p-6 text-danger">
      <h3 className="text-base font-semibold">Could not load jobs</h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <button
        className="mt-4 rounded-2xl border border-danger/30 bg-panel-strong px-4 py-2 text-sm font-medium text-fg transition hover:bg-panel"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </div>
  )
}
