"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "../../../api/client"
import { useJobsListControls } from "../_hooks/use-jobs-list-controls"
import { getJobsRange } from "../_lib/jobs-list.utils"
import { JobsListEmpty } from "./jobs-list-empty"
import { JobsListError } from "./jobs-list-error"
import { JobsListFilters } from "./jobs-list-filters"
import { JobsListHeader } from "./jobs-list-header"
import { JobsListLoading } from "./jobs-list-loading"
import { JobsListPagination } from "./jobs-list-pagination"
import { JobsListTable } from "./jobs-list-table"

export default function JobsListPage() {
  const {
    actionType,
    actionTypeFilter,
    enabled,
    enabledFilter,
    filtersApplied,
    page,
    pageSize,
    query,
    queryInput,
    resetFilters,
    runSearch,
    setActionTypeFilter,
    setEnabledFilter,
    setPage,
    setPageSize,
    setQueryInput,
  } = useJobsListControls()

  const jobsQuery = useQuery({
    queryKey: ["jobs", page, pageSize, enabled, actionType, query],
    queryFn: () =>
      api.listJobs({
        page,
        page_size: pageSize,
        enabled,
        action_type: actionType,
        q: query || undefined,
      }),
  })

  const jobs = jobsQuery.data?.items ?? []
  const total = jobsQuery.data?.total ?? 0
  const totalPages = jobsQuery.data?.total_pages ?? 1
  const { firstItem, lastItem } = getJobsRange({
    jobsLength: jobs.length,
    page,
    pageSize,
    total,
  })

  return (
    <div className="rounded-3xl border border-line bg-panel p-6 shadow-glow backdrop-blur-sm sm:p-8">
      <JobsListHeader
        isLoading={jobsQuery.isLoading}
        onRefresh={() => jobsQuery.refetch()}
        total={total}
      />

      <JobsListFilters
        actionTypeFilter={actionTypeFilter}
        enabledFilter={enabledFilter}
        onActionTypeFilterChange={value => {
          setPage(1)
          setActionTypeFilter(value)
        }}
        onEnabledFilterChange={value => {
          setPage(1)
          setEnabledFilter(value)
        }}
        onPageSizeChange={value => {
          setPage(1)
          setPageSize(value)
        }}
        onQueryInputChange={setQueryInput}
        onReset={resetFilters}
        onSubmit={runSearch}
        pageSize={pageSize}
        queryInput={queryInput}
      />

      {jobsQuery.isLoading ? (
        <JobsListLoading />
      ) : jobsQuery.isError ? (
        <JobsListError
          message={
            (jobsQuery.error as Error)?.message ||
            "An unexpected error occurred while fetching the job list."
          }
          onRetry={() => jobsQuery.refetch()}
        />
      ) : jobs.length === 0 ? (
        <JobsListEmpty
          filtersApplied={filtersApplied}
          onClearFilters={resetFilters}
        />
      ) : (
        <>
          <JobsListTable jobs={jobs} />
          <JobsListPagination
            firstItem={firstItem}
            isFetching={jobsQuery.isFetching}
            lastItem={lastItem}
            onNext={() =>
              setPage(current => Math.min(current + 1, Math.max(totalPages, 1)))
            }
            onPrevious={() => setPage(current => Math.max(current - 1, 1))}
            page={page}
            total={total}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  )
}
