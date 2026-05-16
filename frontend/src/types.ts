export type ConcurrencyPolicy = "allow" | "forbid" | "replace"
export type ActionType = "http" | "shell"
export type TaskStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "final_failed"

export interface Job {
  id: string
  name: string
  cron_expression: string
  action_type: ActionType
  action_config: Record<string, unknown>
  enabled: boolean
  concurrency_policy: ConcurrencyPolicy
  max_retries: number
  next_fire_at: string
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  items: Job[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface JobListParams {
  page?: number
  page_size?: number
  enabled?: boolean
  action_type?: ActionType
  concurrency_policy?: ConcurrencyPolicy
  q?: string // search query for job name
}

export interface Task {
  id: string
  job_id: string
  status: TaskStatus
  trigger_type: "scheduled" | "manual"
  retry_count: number
  locked_by: string | null
  locked_until: string | null
  started_at: string | null
  finished_at: string | null
  stdout: string | null
  stderr: string | null
  created_at: string
}
