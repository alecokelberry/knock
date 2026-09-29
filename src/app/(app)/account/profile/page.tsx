import type { Metadata } from "next"

import { Profile } from "@/components/account/profile"

export const metadata: Metadata = { title: "Profile" }

/** Account → Profile */
export default function ProfilePage() {
  return <Profile />
}
