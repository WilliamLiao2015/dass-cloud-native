"use client"

export function JobsListLoading() {
  return (
    <div className="mt-6 grid gap-4">
      {[0, 1, 2].map(index => (
        <div
          key={index}
          className="rounded-3xl border border-line bg-panel-strong p-5"
        >
          <div className="h-4 w-40 animate-pulse rounded bg-line/40" />
          <div className="mt-4 h-3 w-3/4 animate-pulse rounded bg-line/40" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-line/40" />
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-line/40" />
        </div>
      ))}
    </div>
  )
}
