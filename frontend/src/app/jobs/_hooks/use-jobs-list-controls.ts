"use client"

import { useState } from "react"

import { DEFAULT_JOB_LIST_PAGE_SIZE } from "../_lib/jobs-list.types"
import type { ActionTypeFilter, EnabledFilter } from "../_lib/jobs-list.types"

export function useJobsListControls() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_JOB_LIST_PAGE_SIZE)
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>("all")
  const [actionTypeFilter, setActionTypeFilter] =
    useState<ActionTypeFilter>("all")
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")

  const enabled =
    enabledFilter === "all" ? undefined : enabledFilter === "enabled"
  const actionType = actionTypeFilter === "all" ? undefined : actionTypeFilter
  const filtersApplied =
    enabledFilter !== "all" || actionTypeFilter !== "all" || query.trim() !== ""

  const runSearch = () => {
    setPage(1)
    setQuery(queryInput.trim())
  }

  const resetFilters = () => {
    setPage(1)
    setPageSize(DEFAULT_JOB_LIST_PAGE_SIZE)
    setEnabledFilter("all")
    setActionTypeFilter("all")
    setQueryInput("")
    setQuery("")
  }

  return {
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
  }
}
