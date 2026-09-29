import type { Metadata } from "next"

import { Preferences } from "@/components/account/preferences"

export const metadata: Metadata = { title: "Preferences" }

/** Account → Preferences */
export default function PreferencesPage() {
  return <Preferences />
}
