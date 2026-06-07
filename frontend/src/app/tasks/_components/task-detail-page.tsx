"use client"

import { useTaskDetailPage } from "../_hooks/use-task-detail-page"
import { TaskDetailContent } from "./task-detail-content"
import { TaskDetailError } from "./task-detail-error"
import { TaskDetailLoading } from "./task-detail-loading"

export default function TaskDetailPage({ taskId }: { taskId: string }) {
  const { task, taskQuery } = useTaskDetailPage(taskId)

  if (taskQuery.isLoading) {
    return <TaskDetailLoading />
  }

  if (taskQuery.isError || !task) {
    return (
      <TaskDetailError
        message={
          (taskQuery.error as Error)?.message ||
          "The task detail view could not be loaded."
        }
        onRetry={() => taskQuery.refetch()}
        secondaryAction={null}
      />
    )
  }

  return <TaskDetailContent task={task} />
}
