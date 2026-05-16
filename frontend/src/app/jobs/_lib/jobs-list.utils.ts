import type { Job } from "../../../types"

export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatActionConfig(job: Job) {
  const entries = Object.entries(job.action_config ?? {})

  if (entries.length === 0) {
    return "No config"
  }

  return JSON.stringify(job.action_config ?? {}, null, 2)
}

export function getJobsRange({
  jobsLength,
  page,
  pageSize,
  total,
}: {
  jobsLength: number
  page: number
  pageSize: number
  total: number
}) {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = total === 0 ? 0 : (page - 1) * pageSize + jobsLength

  return { firstItem, lastItem }
}
