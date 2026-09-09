import type { Metadata } from "next"

import { Forecast } from "@/components/sales/forecast"

export const metadata: Metadata = { title: "Forecast" }

/** Sales → Forecast */
export default function ForecastPage() {
  return <Forecast />
}
