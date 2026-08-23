// Home → Activity Feed: the recent moves across the three offices (the households on the board and in Activities), the
// range menu, and the Add follow-up form's choices.

type Tone = "info" | "secondary" | "destructive" | "outline"

export type FeedItem = {
  id: string
  /** A person's face, or an icon in a ring */
  lead: { person: string } | { icon: "calendar-clock" | "triangle-alert" }
  actor: string
  verb: string
  object: string
  body?: string
  files?: { name: string; size: string }[]
  attendees?: { names: string[]; more: number }
  event?: { day: string; time: string }
  mention?: string
  badges?: {
    icon: "phone" | "target"
    label: string
    tone: "warning" | "outline"
  }[]
  progress?: number
  time: string
  tag: { label: string; value: string; tone: Tone }
}

export const FEED: FeedItem[] = [
  {
    id: "activity-1",
    lead: { person: "Darnell Brooks" },
    actor: "Darnell Brooks",
    verb: "shared",
    object: "Margaret Doyle's signed agreement",
    body: "Quarterly Pest with Termite Monitoring, signed on the tablet. The cancellation notice went out with it.",
    files: [
      { name: "Doyle-Agreement.pdf", size: "412 KB" },
      { name: "Doyle-Cancellation-Notice.pdf", size: "96 KB" },
    ],
    time: "12 min ago",
    tag: { label: "Files", value: "2", tone: "info" },
  },
  {
    id: "activity-2",
    lead: { icon: "calendar-clock" },
    actor: "Rafael Lima",
    verb: "scheduled",
    object: "the Raleigh area drop in Wakefield Glen",
    body: "Meera and Toby take the north loop; Ayesha works the cul-de-sacs off Glen Laurel Drive.",
    attendees: {
      names: ["Ayesha Malik", "Toby Marsh", "Meera Iyer"],
      more: 1,
    },
    event: { day: "Today", time: "12:00 - 12:30 PM" },
    time: "40 min ago",
    tag: { label: "Area", value: "Drop", tone: "info" },
  },
  {
    id: "activity-3",
    lead: { person: "Haruka Mori" },
    actor: "Haruka Mori",
    verb: "mentioned you in",
    object: "Valentina Ospina's price override",
    mention:
      "@Tessa, she's holding a lower quote from another company. Can I go to 22% before tomorrow's callback?",
    time: "2 hours ago",
    tag: { label: "Thread", value: "Open", tone: "secondary" },
  },
  {
    id: "activity-4",
    lead: { icon: "triangle-alert" },
    actor: "Cancellation Alerts",
    verb: "flagged",
    object: "Joon Park",
    body: "He asked how cancelling works, one day before his three-day window closes. The odds of service dropped to 72%.",
    time: "Yesterday",
    tag: { label: "Risk", value: "Cancel", tone: "destructive" },
  },
  {
    id: "activity-5",
    lead: { person: "Grant Lowell" },
    actor: "Grant Lowell",
    verb: "moved",
    object: "Johan Lindberg to Serviced",
    body: "Ridgeline's file shows the initial service and fourteen termite stations in. It counts for Ayesha this week.",
    badges: [
      { icon: "phone", label: "2 Calls Logged", tone: "warning" },
      { icon: "target", label: "Serviced", tone: "outline" },
    ],
    progress: 100,
    time: "Last week",
    tag: { label: "Stage", value: "Serviced", tone: "outline" },
  },
]

export const FEED_RANGES = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const

/** Add follow-up's due choices; Tomorrow is picked first */
export const FOLLOW_UP_DUE = [
  "Today",
  "Tomorrow",
  "This week",
  "Next week",
] as const
