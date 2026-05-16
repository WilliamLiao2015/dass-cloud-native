import { Suspense } from "react"

import JobFormPage from "../_components/job-form-page"

export default function NewJobRoute() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-line bg-panel p-8 shadow-glow backdrop-blur-sm">
          <p className="text-sm text-muted">Loading job form...</p>
        </div>
      }
    >
      <JobFormPage />
    </Suspense>
  )
}
