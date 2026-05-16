import { afterEach, describe, expect, it, vi } from "vitest"

import { api, request } from "./client"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("request", () => {
  it("returns parsed json for successful requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ status: "ok" }),
      }))
    )

    await expect(request<{ status: string }>("/health")).resolves.toEqual({
      status: "ok",
    })
  })

  it("returns undefined for no-content responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 204,
        json: async () => {
          throw new Error("json should not be called")
        },
      }))
    )

    await expect(
      request<void>("/api/v1/jobs/1", { method: "DELETE" })
    ).resolves.toBeUndefined()
  })

  it("throws the response body on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        text: async () => "backend exploded",
      }))
    )

    await expect(request("/api/v1/jobs")).rejects.toThrow("backend exploded")
  })
})

describe("api", () => {
  it("sends json payloads for mutating requests", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: "job-1" }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    await api.createJob({ name: "job-a" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/jobs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "job-a" }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    )
  })
})
