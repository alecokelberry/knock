import type { Metadata } from "next"

import { Territories } from "@/components/contacts/territories"

export const metadata: Metadata = { title: "Territories" }

/** Contacts → Territories */
export default function TerritoriesPage() {
  return <Territories />
}
