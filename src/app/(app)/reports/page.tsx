import type { Metadata } from "next"

import { ReportsOverview } from "@/components/reports/overview"

export const metadata: Metadata = { title: "Reports" }

/** Reports → Overview */
export default function ReportsPage() {
  return <ReportsOverview />
}
