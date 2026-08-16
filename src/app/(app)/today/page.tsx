import type { Metadata } from "next"

import { Today } from "@/components/home/today"

export const metadata: Metadata = { title: "Today" }

/** Home → Today */
export default function TodayPage() {
  return <Today />
}
