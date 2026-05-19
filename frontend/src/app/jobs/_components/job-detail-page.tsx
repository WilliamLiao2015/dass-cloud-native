"use client"

import { useJobDetailPage } from "../_hooks/use-job-detail-page"
import { JobDetailContent } from "./job-detail-content"
import { JobDetailError } from "./job-detail-error"
import { JobDetailLoading } from "./job-detail-loading"

export default function JobDetailPage({ jobId }: { jobId: string }) {
  const { deleteMutation, job, jobQuery, tasks, tasksQuery, triggerMutation } =
    useJobDetailPage(jobId)

  if (jobQuery.isLoading) {
    return <JobDetailLoading />
  }

  if (jobQuery.isError || !job) {
    return (
      <JobDetailError
        message={
          (jobQuery.error as Error)?.message ||
          "The job detail view could not be loaded."
        }
        onRetry={() => jobQuery.refetch()}
        secondaryAction={null}
      />
    )
  }

  return (
    <JobDetailContent
      isDeleting={deleteMutation.isPending}
      isTriggering={triggerMutation.isPending}
      isTasksError={tasksQuery.isError}
      job={job}
      onDelete={() => {
        if (
          window.confirm(
            `Delete job "${job.name}"? This action cannot be undone.`
          )
        ) {
          deleteMutation.mutate()
        }
      }}
      onRefreshTasks={() => tasksQuery.refetch()}
      onTrigger={() => triggerMutation.mutate()}
      tasks={tasks}
      tasksErrorMessage={
        (tasksQuery.error as Error)?.message ||
        "The task list could not be loaded."
      }
      tasksFetching={tasksQuery.isFetching}
      tasksLoading={tasksQuery.isLoading}
    />
  )
}
