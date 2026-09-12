import type { Metadata } from "next"

import { NewQuote } from "@/components/sales/new-quote"

export const metadata: Metadata = { title: "New quote" }

/** Sales → Quotes → New quote */
export default function NewQuotePage() {
  return <NewQuote />
}
