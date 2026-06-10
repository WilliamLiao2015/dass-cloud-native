"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { ToastProvider } from "../hooks/use-toast"

const THEME_STORAGE_KEY = "dass-theme"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): Theme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }

  return "light"
}

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark"
  }

  const theme = document.documentElement.dataset.theme
  if (theme === "light" || theme === "dark") {
    return theme
  }

  return getSystemTheme()
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeState(storedTheme)
        return
      }
    } catch {
      setThemeState(getSystemTheme())
      return
    }

    setThemeState(getSystemTheme())
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore storage failures and keep the in-memory theme active.
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => {
        setThemeState(currentTheme =>
          currentTheme === "dark" ? "light" : "dark"
        )
      },
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
