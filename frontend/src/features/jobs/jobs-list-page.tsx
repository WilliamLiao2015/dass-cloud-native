"use client"

// TODO: implement full job list UI with TanStack Query + api.listJobs()
export default function JobsListPage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-lg font-semibold">Jobs</h2>
      <p className="mt-2 text-sm text-slate-400">
        Job list UI is not yet implemented. The API is available at{" "}
        <code className="rounded-sm bg-white/10 px-1.5 py-0.5 text-xs text-sky-300">
          /api/v1/jobs
        </code>
        .
      </p>
    </div>
  )
}
