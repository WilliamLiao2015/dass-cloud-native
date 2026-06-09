import type { Metadata } from "next"
import Script from "next/script"
import type { ReactNode } from "react"

import { DashboardShell } from "../components/dashboard-shell"
import "../styles.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "dass",
  description: "Distributed Asynchronous Scheduling System",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (() => {
            try {
              const storedTheme = window.localStorage.getItem("dass-theme")
              const theme =
                storedTheme === "light" || storedTheme === "dark"
                  ? storedTheme
                  : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"

              document.documentElement.dataset.theme = theme
              document.documentElement.style.colorScheme = theme
            } catch {
              document.documentElement.dataset.theme = "dark"
              document.documentElement.style.colorScheme = "dark"
            }
          })()
        `}</Script>
      </head>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  )
}
