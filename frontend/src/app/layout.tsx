import type { Metadata } from "next"
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
    <html lang="en">
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  )
}
