import type { Metadata } from "next"

import { Attainment } from "@/components/home/attainment"

export const metadata: Metadata = { title: "Attainment" }

/** Home → Attainment */
export default function AttainmentPage() {
  return <Attainment />
}
