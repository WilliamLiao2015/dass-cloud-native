"use client"

import Link from "next/link"

import type { Job } from "../../../types"
import { formatActionConfig, formatDateTime } from "../_lib/jobs-list.utils"

function JobBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled
          ? "bg-success/15 text-success ring-1 ring-success/30"
          : "bg-panel-strong text-muted ring-1 ring-line"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  )
}

export function JobsListTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-panel-strong text-xs uppercase tracking-[0.24em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">Next fire</th>
              <th className="px-4 py-3 font-medium">Retries</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Config</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {jobs.map(job => (
              <tr
                key={job.id}
                className="align-top"
              >
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-fg">
                        <Link
                          className="transition hover:text-accent"
                          href={`/jobs/${job.id}`}
                        >
                          {job.name}
                        </Link>
                      </h3>
                      <JobBadge enabled={job.enabled} />
                    </div>
                    <div className="text-xs text-muted">
                      <span className="font-mono">{job.id}</span>
                    </div>
                    <Link
                      className="inline-flex text-xs font-medium text-accent transition hover:brightness-110"
                      href={`/jobs/${job.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  <div className="font-mono text-fg">{job.cron_expression}</div>
                  <div className="mt-1 text-xs text-muted">
                    Concurrency: {job.concurrency_policy}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  <div className="font-medium capitalize text-fg">
                    {job.action_type}
                  </div>
                  <div className="mt-1 max-w-xs wrap-break-words text-xs text-muted">
                    {formatActionConfig(job)}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  <JobBadge enabled={job.enabled} />
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  {formatDateTime(job.next_fire_at)}
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  {job.max_retries}
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  {formatDateTime(job.updated_at)}
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  <div className="max-w-sm wrap-break-words rounded-2xl border border-line bg-panel-strong p-3 font-mono text-xs text-fg">
                    {formatActionConfig(job)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
