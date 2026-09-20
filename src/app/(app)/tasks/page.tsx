import type { Metadata } from "next"

import { Tasks } from "@/components/activities/tasks"

export const metadata: Metadata = { title: "Tasks" }

/** Activities → Tasks: follow-ups and to-dos with their sub-tasks */
export default function TasksPage() {
  return <Tasks />
}
