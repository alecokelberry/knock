import type { Metadata } from "next"

import { Notifications } from "@/components/account/notifications"

export const metadata: Metadata = { title: "Notifications" }

/** Account → Notifications */
export default function NotificationsPage() {
  return <Notifications />
}
