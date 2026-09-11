import type { Metadata } from "next"

import { Quotes } from "@/components/sales/quotes"

export const metadata: Metadata = { title: "Quotes" }

/** Sales → Quotes */
export default function QuotesPage() {
  return <Quotes />
}
