"use client"

// TODO: implement job detail view with task list, trigger, edit, delete
export default function JobDetailPage({ jobId }: { jobId: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-lg font-semibold">Job Detail</h2>
      <p className="mt-2 text-sm text-slate-400">
        Detail view for job{" "}
        <code className="rounded-sm bg-white/10 px-1.5 py-0.5 text-xs text-sky-300">
          {jobId}
        </code>{" "}
        is not yet implemented.
      </p>
    </div>
  )
}
