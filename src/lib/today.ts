// Home → Today's New meeting form: what's missing, and the line the toast says once it's scheduled.

export type MeetingDraft = {
  title: string
  account: string
  type: string
  date: string
  start: string
  duration: string
  attendees: string[]
  location: string
  agenda: string
}
export type MeetingErrors = Partial<Record<"title" | "date" | "start", string>>

/** The three required fields and what each says */
export function meetingErrors(
  d: Pick<MeetingDraft, "title" | "date" | "start">
): MeetingErrors {
  const errors: MeetingErrors = {}
  if (!d.title.trim()) errors.title = "Enter a meeting name"
  if (!d.date.trim()) errors.date = "Enter a date"
  if (!d.start.trim()) errors.start = "Enter a start time"
  return errors
}

/** "Discovery · 30 min · 2 attendees" */
export function scheduledLine(
  d: Pick<MeetingDraft, "type" | "duration" | "attendees">
): string {
  const n = d.attendees.length
  return `${d.type} · ${d.duration} · ${n} ${n === 1 ? "attendee" : "attendees"}`
}
