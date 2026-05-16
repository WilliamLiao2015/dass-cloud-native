import React from "react"

import type { TaskStatus } from "../types"

const tone: Record<TaskStatus, string> = {
  pending: "bg-panel-strong text-muted",
  running: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  failed: "bg-amber-500/15 text-amber-600",
  final_failed: "bg-danger/15 text-danger",
}

export function StatusPill({ status }: { status: TaskStatus | string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[status as TaskStatus] ?? "bg-panel-strong text-fg"}`}
    >
      {status}
    </span>
  )
}
