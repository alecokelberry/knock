import type { Metadata } from "next"

import { Billing } from "@/components/settings/billing"

export const metadata: Metadata = { title: "Billing" }

/** Settings → Billing */
export default function BillingPage() {
  return <Billing />
}
