import type { Metadata } from "next"

import { GeneralSettings } from "@/components/settings/general"

export const metadata: Metadata = { title: "Settings" }

/** Settings → General */
export default function GeneralSettingsPage() {
  return <GeneralSettings />
}
