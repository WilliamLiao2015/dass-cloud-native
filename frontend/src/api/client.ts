import type { Job, Task } from "../types"

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
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

export const api = {
  health: () => request<{ status: string }>("/health"),
  listJobs: () => request<Job[]>("/api/v1/jobs"),
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
