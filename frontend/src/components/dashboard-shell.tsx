"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`)
  return (
    <div className="min-h-full text-fg">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-line bg-panel px-5 py-4 shadow-glow backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">
              dass
            </p>
            <h1 className="text-xl font-semibold">
              Distributed Asynchronous Scheduling System
            </h1>
          </div>
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
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
