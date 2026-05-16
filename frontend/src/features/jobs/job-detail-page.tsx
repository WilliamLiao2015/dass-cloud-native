"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { api } from "../../api/client"
import { useToast } from "../../hooks/use-toast"
import { JobDetailHeader } from "./job-detail-header"
import { JobDetailOverview } from "./job-detail-overview"
import { JobTaskList } from "./job-task-list"

export default function JobDetailPage({ jobId }: { jobId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { push: pushToast } = useToast()

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.getJob(jobId),
  })

  const tasksQuery = useQuery({
    queryKey: ["job-tasks", jobId],
    queryFn: () => api.listJobTasks(jobId),
  })

  const triggerMutation = useMutation({
    mutationFn: () => api.triggerJob(jobId),
    onSuccess: result => {
      pushToast({
        title: "Job triggered",
        description: `Task ${result.task_id} is now ${result.status}.`,
        tone: "success",
      })
      void queryClient.invalidateQueries({ queryKey: ["job-tasks", jobId] })
    },
    onError: error => {
      pushToast({
        title: "Trigger failed",
        description:
          error instanceof Error ? error.message : "Unable to trigger the job.",
        tone: "error",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteJob(jobId),
    onSuccess: () => {
      pushToast({
        title: "Job deleted",
        description: "The job was removed successfully.",
        tone: "success",
      })
      void queryClient.invalidateQueries({ queryKey: ["jobs"] })
      router.push("/jobs")
    },
    onError: error => {
      pushToast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Unable to delete the job.",
        tone: "error",
      })
    },
  })

  const job = jobQuery.data
  const tasks = tasksQuery.data ?? []

  if (jobQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-line bg-panel p-8 shadow-glow backdrop-blur-sm">
        <p className="text-sm text-muted">Loading job details...</p>
      </div>
    )
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="rounded-3xl border border-line bg-panel p-8 shadow-glow backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Could not load job</h2>
        <p className="mt-2 text-sm text-muted">
          {(jobQuery.error as Error)?.message ||
            "The job detail view could not be loaded."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-2xl border border-line bg-panel-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel"
            onClick={() => jobQuery.refetch()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-3xl border border-line bg-panel p-6 shadow-glow backdrop-blur-sm sm:p-8">
      <JobDetailHeader
        actionType={job.action_type}
        concurrencyPolicy={job.concurrency_policy}
        enabled={job.enabled}
        isDeleting={deleteMutation.isPending}
        isTriggering={triggerMutation.isPending}
        jobId={job.id}
        jobName={job.name}
        onDelete={() => {
          if (
            window.confirm(
              `Delete job "${job.name}"? This action cannot be undone.`
            )
          ) {
            deleteMutation.mutate()
          }
        }}
        onTrigger={() => triggerMutation.mutate()}
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
        errorMessage={
          (tasksQuery.error as Error)?.message ||
          "The task list could not be loaded."
        }
        isError={tasksQuery.isError}
        isFetching={tasksQuery.isFetching}
        isLoading={tasksQuery.isLoading}
        onRefresh={() => tasksQuery.refetch()}
        tasks={tasks}
      />
    </div>
  )
}
