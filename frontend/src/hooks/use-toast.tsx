"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

type Toast = {
  id: string
  title: string
  description?: string
  tone?: "success" | "error" | "info"
}

const ToastContext = createContext<{
  toasts: Toast[]
  push: (toast: Omit<Toast, "id">) => void
  remove: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = (toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts(current => [...current, { id, ...toast }])
    window.setTimeout(
      () => setToasts(current => current.filter(item => item.id !== id)),
      3500
    )
  }
  const remove = (id: string) =>
    setToasts(current => current.filter(item => item.id !== id))
  const value = useMemo(() => ({ toasts, push, remove }), [toasts])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="w-80 rounded-2xl border border-line bg-panel p-4 shadow-glow backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-fg">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="text-muted"
                onClick={() => remove(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }
  return context
}
