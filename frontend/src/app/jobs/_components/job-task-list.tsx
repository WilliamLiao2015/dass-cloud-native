"use client"

import { formatDateTime } from "../_lib/jobs-list.utils"

function TaskBadge({
  label,
  tone,
}: {
  label: string
  tone: "success" | "muted" | "danger"
}) {
  const toneClasses = {
    success: "bg-success/15 text-success ring-success/30",
    muted: "bg-panel-strong text-muted ring-line",
    danger: "bg-danger/15 text-danger ring-danger/30",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}

function getTaskStatusTone(status: string) {
  if (status === "success") return "success"
  if (status === "failed" || status === "final_failed") return "danger"
  return "muted"
}

export function JobTaskList({
  isFetching,
  isLoading,
  isError,
  errorMessage,
  tasks,
  onRefresh,
}: {
  isFetching: boolean
  isLoading: boolean
  isError: boolean
  errorMessage: string
  tasks: Array<{
    id: string
    job_id: string
    status: string
    trigger_type: string
    retry_count: number
    started_at: string | null
    finished_at: string | null
    created_at: string
  }>
  onRefresh: () => void
}) {
  return (
    <section className="space-y-4 border-t border-line pt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Task list</h3>
          <p className="mt-1 text-sm text-muted">
            Recent executions created by manual triggers or the scheduler.
          </p>
        </div>
        <button
          className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isFetching}
          onClick={onRefresh}
          type="button"
        >
          {isFetching ? "Refreshing..." : "Refresh tasks"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-line bg-panel-strong p-6 text-sm text-muted">
          Loading tasks...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-line bg-panel-strong p-6">
          <p className="font-semibold text-fg">Could not load tasks</p>
          <p className="mt-2 text-sm text-muted">{errorMessage}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel-strong/60 p-8 text-sm text-muted">
          No tasks have been created for this job yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left">
              <thead className="bg-panel-strong text-xs uppercase tracking-[0.24em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Trigger</th>
                  <th className="px-4 py-3 font-medium">Retries</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel">
                {tasks.map(task => (
                  <tr
                    key={task.id}
                    className="align-top"
                  >
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="font-mono text-sm text-fg">
                          {task.id}
                        </div>
                        <div className="text-xs text-muted">{task.job_id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <TaskBadge
                        label={task.status.replace(/_/g, " ")}
                        tone={getTaskStatusTone(task.status)}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {task.trigger_type}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {task.retry_count}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {formatDateTime(task.created_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {task.started_at
                        ? formatDateTime(task.started_at)
                        : "Not started"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {task.finished_at
                        ? formatDateTime(task.finished_at)
                        : "Not finished"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
