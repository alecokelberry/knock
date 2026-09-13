import type { Metadata } from "next"

import { Approvals } from "@/components/sales/approvals"

export const metadata: Metadata = { title: "Approvals" }

/** Sales → Approvals */
export default function ApprovalsPage() {
  return <Approvals />
}
