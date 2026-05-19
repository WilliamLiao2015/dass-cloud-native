import { afterEach, describe, expect, it, vi } from "vitest"

import type { Job } from "../../../types"
import {
  formatActionConfig,
  formatDateTime,
  getJobsRange,
} from "./jobs-list.utils"

const baseJob: Job = {
  id: "job-1",
  name: "Nightly backup",
  cron_expression: "0 2 * * *",
  action_type: "shell",
  action_config: {},
  enabled: true,
  concurrency_policy: "forbid",
  max_retries: 3,
  next_fire_at: "2025-05-20T00:00:00Z",
  created_at: "2025-05-19T00:00:00Z",
  updated_at: "2025-05-19T00:00:00Z",
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("formatDateTime", () => {
  it("returns the original value when the input is not a valid date", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date")
  })

  it("formats valid dates using the requested locale settings", () => {
    const format = vi.fn(() => "May 20, 2025, 8:00 AM")
    const dateTimeFormatSpy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(function () {
        return { format } as unknown as Intl.DateTimeFormat
      } as typeof Intl.DateTimeFormat)

    expect(formatDateTime("2025-05-20T00:00:00Z")).toBe("May 20, 2025, 8:00 AM")
    expect(dateTimeFormatSpy).toHaveBeenCalledWith("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  })
})

describe("formatActionConfig", () => {
  it("returns a fallback message when the config is empty", () => {
    expect(formatActionConfig(baseJob)).toBe("No config")
  })

  it("pretty prints the action config when present", () => {
    expect(
      formatActionConfig({
        ...baseJob,
        action_config: {
          command: "echo hello",
          retries: 2,
        },
      })
    ).toBe(`{
  "command": "echo hello",
  "retries": 2
}`)
  })
})

describe("getJobsRange", () => {
  it("returns zeros when there are no jobs", () => {
    expect(
      getJobsRange({
        jobsLength: 0,
        page: 1,
        pageSize: 10,
        total: 0,
      })
    ).toEqual({ firstItem: 0, lastItem: 0 })
  })

  it("calculates the visible range for a populated page", () => {
    expect(
      getJobsRange({
        jobsLength: 7,
        page: 3,
        pageSize: 10,
        total: 27,
      })
    ).toEqual({ firstItem: 21, lastItem: 27 })
  })
})
