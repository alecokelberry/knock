import type { Metadata } from "next"

import { Dashboard } from "@/components/home/dashboard"

export const metadata: Metadata = { title: "Home" }

/** Home → Dashboard */
export default function DashboardPage() {
  return <Dashboard />
}
