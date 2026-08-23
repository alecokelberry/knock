import type { Metadata } from "next"

import { ActivityFeed } from "@/components/home/activity-feed"

export const metadata: Metadata = { title: "Activity Feed" }

/** Home → Activity Feed */
export default function ActivityFeedPage() {
  return <ActivityFeed />
}
