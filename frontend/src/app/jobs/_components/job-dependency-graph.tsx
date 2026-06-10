"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"

import { useTheme } from "../../providers"
import type { Job } from "../../../types"

type GraphNodeKind = "current" | "upstream" | "downstream"

type JobFlowNodeData = {
  kind: GraphNodeKind
  label: string
  secondaryLabel: string
}

type JobFlowNode = Node<JobFlowNodeData, "job">

function getNodeTone(kind: GraphNodeKind) {
  if (kind === "current") {
    return {
      badge: "bg-accent/15 text-accent ring-accent/30",
      node: "border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]",
    }
  }

  if (kind === "upstream") {
    return {
      badge: "bg-success/15 text-success ring-success/30",
      node: "border-success/40 bg-success/10",
    }
  }

  return {
    badge: "bg-panel-strong text-muted ring-line",
    node: "border-line bg-panel",
  }
}

function JobFlowNodeView({ data, selected }: NodeProps<JobFlowNode>) {
  const tone = getNodeTone(data.kind)
  const isCurrent = data.kind === "current"

  return (
    <div
      className={[
        "rounded-3xl border px-4 py-3 text-left shadow-lg backdrop-blur-sm transition",
        "min-w-44",
        selected ? "ring-2 ring-accent/40" : "ring-0",
        isCurrent ? "min-w-56" : "",
        tone.node,
      ].join(" ")}
    >
      <Handle
        className="!border-0"
        position={Position.Left}
        style={{
          background: "var(--accent)",
          height: 12,
          width: 12,
        }}
        type="target"
      />
      <Handle
        className="!border-0"
        position={Position.Right}
        style={{
          background: "var(--accent)",
          height: 12,
          width: 12,
        }}
        type="source"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg">{data.label}</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ${tone.badge}`}
        >
          {data.kind}
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted">
        {data.secondaryLabel}
      </p>
    </div>
  )
}

const nodeTypes = {
  job: JobFlowNodeView,
}

function getNodeColor(kind: GraphNodeKind) {
  if (kind === "current") {
    return "rgba(56,189,248,0.9)"
  }

  if (kind === "upstream") {
    return "rgba(16,185,129,0.9)"
  }

  return "rgba(148,163,184,0.9)"
}

export function JobDependencyGraph({
  job,
  relatedJobs,
  isLoading,
  hasError,
}: {
  job: Job
  relatedJobs: Job[]
  isLoading: boolean
  hasError: boolean
}) {
  const { theme } = useTheme()
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<JobFlowNode, Edge> | null>(null)
  const [selectedId, setSelectedId] = useState(job.id)

  useEffect(() => {
    setSelectedId(job.id)
  }, [job.id])

  const jobMap = useMemo(() => {
    const map = new Map<string, Job>()
    map.set(job.id, job)
    for (const relatedJob of relatedJobs) {
      map.set(relatedJob.id, relatedJob)
    }
    return map
  }, [job, relatedJobs])

  const layout = useMemo(() => {
    const upstreamIds = job.upstream_job_ids.filter(
      upstreamId => upstreamId !== job.id
    )
    const downstreamIds = job.downstream_job_ids.filter(
      downstreamId => downstreamId !== job.id
    )
    const maxSiblings = Math.max(upstreamIds.length, downstreamIds.length, 1)
    const rowSpacing = 120
    const canvasHeight = Math.max(420, 180 + (maxSiblings - 1) * rowSpacing)
    const rootY = canvasHeight / 2
    const upstreamStart = rootY - ((upstreamIds.length - 1) * rowSpacing) / 2
    const downstreamStart = rootY - ((downstreamIds.length - 1) * rowSpacing) / 2

    const nodes: JobFlowNode[] = [
      ...upstreamIds.map((upstreamId, index) => {
        const relatedJob = jobMap.get(upstreamId)
        return {
          id: upstreamId,
          type: "job" as const,
          position: {
            x: 40,
            y: upstreamStart + index * rowSpacing,
          },
          selected: selectedId === upstreamId,
          data: {
            kind: "upstream",
            label: relatedJob?.name ?? "Loading job",
            secondaryLabel: upstreamId,
          },
        } satisfies JobFlowNode
      }),
      {
        id: job.id,
        type: "job" as const,
        position: {
          x: 340,
          y: rootY,
        },
        selected: selectedId === job.id,
          data: {
            kind: "current",
            label: job.name,
            secondaryLabel: job.id,
          },
      } satisfies JobFlowNode,
      ...downstreamIds.map((downstreamId, index) => {
        const relatedJob = jobMap.get(downstreamId)
        return {
          id: downstreamId,
          type: "job" as const,
          position: {
            x: 640,
            y: downstreamStart + index * rowSpacing,
          },
          selected: selectedId === downstreamId,
          data: {
            kind: "downstream",
            label: relatedJob?.name ?? "Loading job",
            secondaryLabel: downstreamId,
          },
        } satisfies JobFlowNode
      }),
    ]

    const edges: Edge[] = [
      ...upstreamIds.map(upstreamId => ({
        id: `${upstreamId}->${job.id}`,
        source: upstreamId,
        target: job.id,
        type: "smoothstep",
        animated: selectedId === upstreamId || selectedId === job.id,
        style: {
          stroke:
            selectedId === upstreamId || selectedId === job.id
              ? getNodeColor("upstream")
              : "rgba(86,106,141,0.55)",
          strokeWidth:
            selectedId === upstreamId || selectedId === job.id ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color:
            selectedId === upstreamId || selectedId === job.id
              ? getNodeColor("upstream")
              : "rgba(86,106,141,0.55)",
        },
      })),
      ...downstreamIds.map(downstreamId => ({
        id: `${job.id}->${downstreamId}`,
        source: job.id,
        target: downstreamId,
        type: "smoothstep",
        animated: selectedId === job.id || selectedId === downstreamId,
        style: {
          stroke:
            selectedId === job.id || selectedId === downstreamId
              ? getNodeColor("current")
              : "rgba(86,106,141,0.55)",
          strokeWidth:
            selectedId === job.id || selectedId === downstreamId ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color:
            selectedId === job.id || selectedId === downstreamId
              ? getNodeColor("current")
              : "rgba(86,106,141,0.55)",
        },
      })),
    ]

    return {
      canvasHeight,
      edges,
      nodes,
    }
  }, [job, jobMap, selectedId])

  const selectedJob =
    selectedId === job.id ? job : jobMap.get(selectedId)
  const selectedKind =
    selectedId === job.id
      ? "current"
      : job.upstream_job_ids.includes(selectedId)
        ? "upstream"
        : "downstream"

  return (
    <section className="space-y-4 border-t border-line pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Dependency graph</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Explore the direct upstream and downstream jobs connected to this
            job. Click any node to inspect it in the detail panel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            Upstream
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            Current
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-1 font-mono">
            Downstream
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div
          className={
            theme === "dark"
              ? "rounded-3xl border border-line bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%),linear-gradient(180deg,rgba(10,20,40,0.96),rgba(6,12,24,0.96))] p-4 shadow-glow"
              : "rounded-3xl border border-line bg-[radial-gradient(circle_at_top,rgba(2,132,199,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(233,238,248,0.96))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          }
        >
          <div className="relative overflow-hidden rounded-2xl border border-line bg-panel-strong/70">
            <div style={{ height: `${layout.canvasHeight}px`, width: "100%" }}>
              <ReactFlow
                colorMode={theme}
                elementsSelectable={false}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodes={layout.nodes}
                edges={layout.edges}
                nodeTypes={nodeTypes}
                nodesConnectable={false}
                nodesDraggable={false}
                onInit={setReactFlowInstance}
                onNodeClick={(_, node) => setSelectedId(node.id)}
                onPaneClick={() => setSelectedId(job.id)}
                proOptions={{ hideAttribution: true }}
                zoomOnDoubleClick={false}
                zoomOnPinch
              >
                <Controls showInteractive={false} />
                <Background
                  color={
                    theme === "dark"
                      ? "rgba(86,106,141,0.25)"
                      : "rgba(148,163,184,0.28)"
                  }
                  gap={20}
                  size={1}
                  variant={BackgroundVariant.Dots}
                />
              </ReactFlow>
            </div>

            {isLoading ? (
              <div className="absolute left-4 top-4 rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted shadow-sm">
                Loading linked jobs...
              </div>
            ) : null}

            {hasError ? (
              <div className="absolute right-4 top-4 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger shadow-sm">
                Some linked jobs could not be loaded.
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-line bg-panel-strong/70 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Selected node
            </p>
            <h4 className="mt-2 text-xl font-semibold text-fg">
              {selectedJob?.name ?? "Loading job"}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Job ID
              </p>
              <p className="mt-2 break-all font-mono text-sm text-fg">
                {selectedId}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Relationship
              </p>
              <p className="mt-2 text-sm text-fg">
                {selectedKind === "current"
                  ? "This is the current job."
                  : selectedKind === "upstream"
                    ? "This job feeds into the current job."
                    : "This job depends on the current job."}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Linked state
              </p>
              <p className="mt-2 text-sm text-fg">
                {selectedJob
                  ? `${selectedJob.enabled ? "Enabled" : "Disabled"} · ${selectedJob.action_type} · ${selectedJob.concurrency_policy}`
                  : "Metadata is still loading for this job."}
              </p>
            </div>
            {selectedJob ? (
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Schedule
                </p>
                <p className="mt-2 font-mono text-sm text-fg">
                  {selectedJob.cron_expression ?? "No schedule"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent/40 hover:bg-panel-strong"
              onClick={() => {
                setSelectedId(job.id)
                void reactFlowInstance?.fitView({
                  duration: 500,
                  nodes: [{ id: job.id }],
                  padding: 0.45,
                })
              }}
              type="button"
            >
              Focus current job
            </button>
            <Link
              className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15"
              href={`/jobs/${selectedId}`}
            >
              Open job
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
