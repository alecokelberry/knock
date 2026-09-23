import type { Metadata } from "next"

import { Integrations } from "@/components/settings/integrations"

export const metadata: Metadata = { title: "Integrations" }

/** Settings → Integrations */
export default function IntegrationsPage() {
  return <Integrations />
}
