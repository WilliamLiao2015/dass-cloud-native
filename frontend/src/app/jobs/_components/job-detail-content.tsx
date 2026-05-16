"use client"

import type { Job } from "../../../types"
import { JobDetailHeader } from "./job-detail-header"
import { JobDetailOverview } from "./job-detail-overview"
import { JobTaskList } from "./job-task-list"

export function JobDetailContent({
  job,
  tasks,
  tasksErrorMessage,
  tasksFetching,
  tasksLoading,
  onRefreshTasks,
  onDelete,
  onTrigger,
  isDeleting,
  isTriggering,
  isTasksError,
}: {
  job: Job
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
  tasksErrorMessage: string
  tasksFetching: boolean
  tasksLoading: boolean
  onRefreshTasks: () => void
  onDelete: () => void
  onTrigger: () => void
  isDeleting: boolean
  isTriggering: boolean
  isTasksError: boolean
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-line bg-panel p-6 shadow-glow backdrop-blur-sm sm:p-8">
      <JobDetailHeader
        actionType={job.action_type}
        concurrencyPolicy={job.concurrency_policy}
        enabled={job.enabled}
        isDeleting={isDeleting}
        isTriggering={isTriggering}
        jobId={job.id}
        jobName={job.name}
        onDelete={onDelete}
        onTrigger={onTrigger}
      />

      <JobDetailOverview
        actionConfig={job.action_config}
        createdAt={job.created_at}
        cronExpression={job.cron_expression}
        maxRetries={job.max_retries}
        nextFireAt={job.next_fire_at}
        tasksCount={tasks.length}
        updatedAt={job.updated_at}
      />

      <JobTaskList
        errorMessage={tasksErrorMessage}
        isError={isTasksError}
        isFetching={tasksFetching}
        isLoading={tasksLoading}
        onRefresh={onRefreshTasks}
        tasks={tasks}
      />
    </div>
  )
}
