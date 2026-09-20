import type { Metadata } from "next"

import { TeamMembers } from "@/components/settings/team"

export const metadata: Metadata = { title: "Team Members" }

/** Settings → Team Members */
export default function TeamMembersPage() {
  return <TeamMembers />
}
