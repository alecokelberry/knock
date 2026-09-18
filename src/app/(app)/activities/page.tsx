import type { Metadata } from "next"

import { ActivityTimeline } from "@/components/activities/activity-timeline"

export const metadata: Metadata = { title: "Activities" }

/** Activities → All Activities: the timeline of calls, emails, meetings and notes */
export default function ActivitiesPage() {
  return <ActivityTimeline />
}
