import type { Job, JobListParams, JobListResponse, Task } from "../types"

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const requestHeaders = Object.fromEntries(
    new Headers(init?.headers ?? undefined)
  )

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...requestHeaders,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

function withQuery(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (!params) {
    return path
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue
    }
    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  listJobs: (params: JobListParams = {}) =>
    request<JobListResponse>(
      withQuery("/api/v1/jobs", {
        page: params.page,
        page_size: params.page_size,
        enabled: params.enabled,
        action_type: params.action_type,
        concurrency_policy: params.concurrency_policy,
        q: params.q,
      })
    ),
  getJob: (id: string) => request<Job>(`/api/v1/jobs/${id}`),
  createJob: (payload: unknown) =>
    request<Job>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateJob: (id: string, payload: unknown) =>
    request<Job>(`/api/v1/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteJob: (id: string) =>
    request<{ ok: boolean }>(`/api/v1/jobs/${id}`, { method: "DELETE" }),
  triggerJob: (id: string) =>
    request<{ task_id: string; status: string }>(`/api/v1/jobs/${id}/trigger`, {
      method: "POST",
    }),
  listJobTasks: (id: string) => request<Task[]>(`/api/v1/jobs/${id}/tasks`),
  retryTask: (id: string) =>
    request<{ task_id: string; retry_task_id: string; status: string }>(
      `/api/v1/tasks/${id}/retry`,
      { method: "POST" }
    ),
}
