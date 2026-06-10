"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { useTheme } from "../app/providers"

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`)

  const themeLabel = mounted
    ? theme === "dark"
      ? "Light mode"
      : "Dark mode"
    : "Theme"

  return (
    <div className="min-h-full text-fg">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-line bg-panel px-5 py-4 shadow-glow backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">
              dass
            </p>
            <h1 className="text-xl font-semibold">
              Distributed Asynchronous Scheduling System
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <nav className="flex gap-4 text-sm text-muted">
              <Link
                className={isActive("/jobs") ? "text-fg" : ""}
                href="/jobs"
              >
                Jobs
              </Link>
              <Link
                className={isActive("/jobs/new") ? "text-fg" : ""}
                href="/jobs/new"
              >
                Create Job
              </Link>
            </nav>
            <button
              className="inline-flex min-w-28 items-center justify-center rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-medium text-fg transition hover:border-accent/70 hover:text-accent"
              onClick={toggleTheme}
              type="button"
            >
              {themeLabel}
            </button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
