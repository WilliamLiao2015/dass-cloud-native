"use client"

function LogPanel({
  title,
  content,
}: {
  title: string
  content: string | null
}) {
  const hasContent = Boolean(content && content.trim())

  return (
    <div className="rounded-2xl border border-line bg-panel-strong p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{title}</p>
      <pre className="mt-3 max-h-[28rem] overflow-auto rounded-2xl border border-line bg-panel p-4 text-xs leading-6 text-fg whitespace-pre-wrap">
        {hasContent ? content : "No output was stored for this field."}
      </pre>
    </div>
  )
}

export function TaskDetailLogs({
  stdout,
  stderr,
}: {
  stdout: string | null
  stderr: string | null
}) {
  return (
    <section className="space-y-4 border-t border-line pt-6">
      <div>
        <h3 className="text-lg font-semibold">Execution logs</h3>
        <p className="mt-1 text-sm text-muted">
          These are the log results persisted in the database by the worker.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LogPanel
          content={stdout}
          title="Stdout"
        />
        <LogPanel
          content={stderr}
          title="Stderr"
        />
      </div>
    </section>
  )
}
