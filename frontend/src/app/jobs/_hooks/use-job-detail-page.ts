"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { api } from "../../../api/client"
import { useToast } from "../../../hooks/use-toast"

export function useJobDetailPage(jobId: string) {
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

  return {
    deleteMutation,
    job: jobQuery.data,
    jobQuery,
    tasks: tasksQuery.data ?? [],
    tasksQuery,
    triggerMutation,
  }
}
