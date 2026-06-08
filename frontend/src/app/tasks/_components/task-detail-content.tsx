"use client"

import type { Task } from "../../../types"
import { TaskDetailHeader } from "./task-detail-header"
import { TaskDetailLogs } from "./task-detail-logs"
import { TaskDetailOverview } from "./task-detail-overview"

export function TaskDetailContent({
  task,
}: {
  task: Task
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-line bg-panel p-6 shadow-glow backdrop-blur-sm sm:p-8">
      <TaskDetailHeader
        jobId={task.job_id}
        retryCount={task.retry_count}
        status={task.status}
        taskId={task.id}
        triggerType={task.trigger_type}
      />

      <TaskDetailOverview
        createdAt={task.created_at}
        finishedAt={task.finished_at}
        jobId={task.job_id}
        lockedBy={task.locked_by}
        lockedUntil={task.locked_until}
        startedAt={task.started_at}
      />

      <TaskDetailLogs stderr={task.stderr} stdout={task.stdout} />
    </div>
  )
}
