"use client"

// TODO: implement job create/edit form with validation
export default function JobFormPage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-lg font-semibold">Create Job</h2>
      <p className="mt-2 text-sm text-slate-400">
        Job creation form is not yet implemented. You can create jobs via the
        API at{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-sky-300">
          POST /api/v1/jobs
        </code>
        .
      </p>
    </div>
  )
}
