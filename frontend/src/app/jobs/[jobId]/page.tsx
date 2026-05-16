import { Suspense } from "react"

import JobDetailPage from "../_components/job-detail-page"
import JobFormPage from "../_components/job-form-page"

export default async function JobDetailRoute({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  if (jobId === "new") {
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

  return <JobDetailPage jobId={jobId} />
}
