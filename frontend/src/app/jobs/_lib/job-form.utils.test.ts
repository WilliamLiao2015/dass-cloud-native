import { describe, expect, it } from "vitest"

import { normalizeCronExpression } from "./job-form.utils"

describe("normalizeCronExpression", () => {
  it("returns null for blank values", () => {
    expect(normalizeCronExpression("")).toBeNull()
    expect(normalizeCronExpression("   ")).toBeNull()
  })

  it("trims and preserves a cron expression", () => {
    expect(normalizeCronExpression("  */5 * * * *  ")).toBe("*/5 * * * *")
  })
})

