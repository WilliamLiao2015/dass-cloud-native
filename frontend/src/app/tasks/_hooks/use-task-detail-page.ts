"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "../../../api/client"

export function useTaskDetailPage(taskId: string) {
  const taskQuery = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => api.getTask(taskId),
  })

  return {
    task: taskQuery.data,
    taskQuery,
  }
}
