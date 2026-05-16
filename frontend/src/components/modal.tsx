export function Modal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--page-fg)_16%,transparent)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-panel p-6 shadow-glow">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border border-line bg-panel-strong px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-fg"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
