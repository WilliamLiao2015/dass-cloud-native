import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { StatusPill } from "./status-pill"

describe("StatusPill", () => {
  it("renders the expected tone for known statuses", () => {
    const markup = renderToStaticMarkup(<StatusPill status="success" />)

    expect(markup).toContain("success")
    expect(markup).toContain("bg-success/15")
    expect(markup).toContain("text-success")
  })

  it("falls back to the default tone for unknown statuses", () => {
    const markup = renderToStaticMarkup(<StatusPill status="mystery" />)

    expect(markup).toContain("mystery")
    expect(markup).toContain("bg-panel-strong")
    expect(markup).toContain("text-fg")
  })
})
