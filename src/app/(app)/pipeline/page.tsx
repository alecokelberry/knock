import type { Metadata } from "next"

import { DealBoard } from "@/components/sales/deal-board"

export const metadata: Metadata = { title: "Pipeline" }

/** Pipeline → Pipeline: the board of households in play, from lead to serviced */
export default function PipelinePage() {
  return (
    <>
      <h1 className="sr-only">Pipeline board</h1>
      <DealBoard />
    </>
  )
}
