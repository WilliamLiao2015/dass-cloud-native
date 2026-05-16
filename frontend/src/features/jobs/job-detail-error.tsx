"use client"

import type { ReactNode } from "react"

export function JobDetailError({
  message,
  onRetry,
  secondaryAction,
}: {
  message: string
  onRetry: () => void
  secondaryAction?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-line bg-panel p-8 shadow-glow backdrop-blur-sm">
      <h2 className="text-lg font-semibold">Could not load job</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
        {secondaryAction}
      </div>
    </div>
  )
}
