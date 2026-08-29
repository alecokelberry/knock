import type { Metadata } from "next"

import { QuickStats } from "@/components/home/quick-stats"

export const metadata: Metadata = { title: "Quick Stats" }

/** Home → Quick Stats */
export default function QuickStatsPage() {
  return <QuickStats />
}
