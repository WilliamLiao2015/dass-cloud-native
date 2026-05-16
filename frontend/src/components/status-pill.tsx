import React from "react"

import type { TaskStatus } from "../types"

const tone: Record<TaskStatus, string> = {
  pending: "bg-slate-500/20 text-slate-200",
  running: "bg-sky-500/20 text-sky-200",
  success: "bg-emerald-500/20 text-emerald-200",
  failed: "bg-amber-500/20 text-amber-200",
  final_failed: "bg-rose-500/20 text-rose-200",
}

export function StatusPill({ status }: { status: TaskStatus | string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[status as TaskStatus] ?? "bg-white/10 text-white"}`}
    >
      {status}
    </span>
  )
}
