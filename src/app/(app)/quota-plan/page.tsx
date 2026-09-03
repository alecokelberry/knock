import type { Metadata } from "next"

import { QuotaPlan } from "@/components/home/quota-plan"

export const metadata: Metadata = { title: "Quota Plan" }

/** Home → Quota Plan */
export default function QuotaPlanPage() {
  return <QuotaPlan />
}
