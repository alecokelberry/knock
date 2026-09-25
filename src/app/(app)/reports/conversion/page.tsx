import type { Metadata } from "next"

import { ReportsConversion } from "@/components/reports/conversion"

export const metadata: Metadata = { title: "Conversion" }

/** Reports → Conversion */
export default function ConversionPage() {
  return <ReportsConversion />
}
