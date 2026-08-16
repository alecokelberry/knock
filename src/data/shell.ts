// What the shell shows around the pages: Knock's tip cards at the foot of Home's sidebar, Tessa's notifications, the
// Pipeline foot's season quota, the live metrics under Activities and Contacts, and the Settings foot.

import { CURRENT_WEEK, SEASON_WEEKS } from "./season"

/** Home's stacked tip cards, front first: what's new in Knock. `art` is the card's gradient. */
export const TIPS = [
  {
    id: "forecast",
    title: "Forecast rolls up by rep",
    body: "Scheduled, signed and priced accounts now total per rep, beside the season call.",
    href: "/forecast",
    art: "radial-gradient(90% 80% at 20% 20%, #f97316 0%, transparent 55%), radial-gradient(80% 90% at 85% 15%, #c026d3 0%, transparent 60%), radial-gradient(90% 70% at 10% 95%, #0ea5e9 0%, transparent 60%), radial-gradient(80% 80% at 90% 90%, #6d28d9 0%, transparent 60%), linear-gradient(135deg, #db2777, #7c3aed)",
  },
  {
    id: "quotes",
    title: "Prices at the door",
    body: "Price a home line by line from the partner's plans, and text it to the homeowner.",
    href: "/quotes/new",
    art: "radial-gradient(80% 90% at 5% 30%, #f472b6 0%, transparent 55%), radial-gradient(70% 70% at 55% 10%, #fde68a 0%, transparent 60%), radial-gradient(80% 80% at 60% 70%, #99f6e4 0%, transparent 60%), radial-gradient(80% 90% at 100% 80%, #60a5fa 0%, transparent 60%), linear-gradient(135deg, #f9a8d4, #a5b4fc)",
  },
  {
    id: "approvals",
    title: "Approvals route by rule",
    body: "Price overrides past the ceiling and big back-end advances reach the regional director on their own.",
    href: "/approvals",
    art: "radial-gradient(90% 80% at 15% 85%, #34d399 0%, transparent 55%), radial-gradient(80% 90% at 90% 10%, #38bdf8 0%, transparent 60%), radial-gradient(70% 70% at 60% 60%, #a78bfa 0%, transparent 60%), linear-gradient(135deg, #0f766e, #4338ca)",
  },
] as const

type Tone = "warning" | "success" | "info" | "destructive"
/** A run of a notification's first line: plain, bold (a label), or a name (primary-coloured) */
type Run = { text: string; kind?: "name" | "bold" }

export type Notification = {
  id: string
  /** A person's face, or an icon in a tone */
  lead:
    | { person: string }
    | {
        icon:
          | "trending-up"
          | "circle-check"
          | "users"
          | "star"
          | "calendar"
          | "credit-card"
          | "shield-alert"
          | "activity"
          | "rocket"
          | "circle-alert"
        tone: Tone
      }
  title: Run[]
  /** The outline badge at the end of the first line */
  badge?: string
  body: string
  rating?: number
  avatars?: string[]
  /** A striped progress bar, percent */
  progress?: number
  event?: { date: string; time: string }
  file?: { name: string; size: string }
  /** A primary and an outline button */
  actions?: [string, string]
  time: string
  /** The two-part tag after the time */
  tag?: { label: string; value: string; tone: Tone }
}

/** The notifications sheet, newest first. Six are unread (the badge beside the title). */
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    lead: { person: "Kirsten Vogt" },
    title: [
      { text: "Kirsten Vogt", kind: "name" },
      { text: " signed " },
      { text: "Arjun Kulkarni", kind: "name" },
    ],
    body: "Bi-Monthly Pest in Sagebrush Hills · $573 first year",
    time: "2 min ago",
  },
  {
    id: "n2",
    lead: { icon: "trending-up", tone: "warning" },
    title: [{ text: "Cancellation risk", kind: "bold" }],
    badge: "Urgent",
    body: "Joon Park asked how cancelling works, and his three-day window closes tomorrow.",
    actions: ["Reassign", "Dismiss"],
    time: "15 min ago",
  },
  {
    id: "n3",
    lead: { person: "Ayesha Malik" },
    title: [
      { text: "Ayesha Malik", kind: "name" },
      { text: " logged a callback with Ingrid Nyberg" },
    ],
    body: "Ingrid wants the rodent exclusion done before the first quarterly visit.",
    rating: 5,
    time: "45 min ago",
  },
  {
    id: "n4",
    lead: { icon: "circle-check", tone: "warning" },
    title: [{ text: "Pending approval", kind: "bold" }],
    body: "Haruka asked for 22% off Valentina Ospina's plan. It's past the 20% ceiling, so it needs you.",
    actions: ["Approve", "Review"],
    time: "1 hour ago",
    tag: { label: "Priority", value: "High", tone: "warning" },
  },
  {
    id: "n5",
    lead: { person: "Meera Iyer" },
    title: [
      { text: "Meera Iyer", kind: "name" },
      { text: " had her best day on " },
      { text: "Wakefield Glen", kind: "name" },
    ],
    body: "Three sales and a referral, a rookie best for Raleigh this summer.",
    time: "3 hours ago",
  },
  {
    id: "n6",
    lead: { icon: "users", tone: "success" },
    title: [{ text: "2 reps start Monday", kind: "bold" }],
    body: "The second wave joins Raleigh on July 20, after two days of training in Provo.",
    avatars: ["Jace Whitmore", "Lexi Tran"],
    time: "4 hours ago",
  },
  {
    id: "n7",
    lead: { icon: "star", tone: "success" },
    title: [{ text: "Serviced plus scheduled passes 1,000", kind: "bold" }],
    body: "983 serviced and 92 on Ridgeline's calendar: 60% of the season's quota.",
    progress: 60,
    time: "5 hours ago",
    tag: { label: "Goal", value: "1,800", tone: "success" },
  },
  {
    id: "n8",
    lead: { icon: "calendar", tone: "info" },
    title: [{ text: "Pipeline review", kind: "bold" }],
    body: "Thursday's review of the 18 households with the three sales managers.",
    event: { date: "Jul 16, 2026", time: "11:00 AM to 12:00 PM" },
    actions: ["Join", "Decline"],
    time: "6 hours ago",
    tag: { label: "Where", value: "Google Meet", tone: "info" },
  },
  {
    id: "n9",
    lead: { person: "Grant Lowell" },
    title: [
      { text: "@grant", kind: "name" },
      { text: " shared a file with you" },
    ],
    body: "Ridgeline's service file for the week, matched against our sales",
    file: { name: "ridgeline-service-file-wk10.csv", size: "184 KB" },
    time: "Yesterday",
  },
  {
    id: "n10",
    lead: { icon: "shield-alert", tone: "destructive" },
    title: [{ text: "Permit expires Friday", kind: "bold" }],
    body: "Kyle Bennett's Boise solicitor permit runs out on July 17. Niamh has the renewal in.",
    actions: ["Review", "Dismiss"],
    time: "Yesterday",
  },
  {
    id: "n11",
    lead: { icon: "activity", tone: "warning" },
    title: [{ text: "Text credits at 80%", kind: "bold" }],
    body: "The reps have used 80% of this month's texting credits. Consider upgrading.",
    progress: 80,
    time: "2 days ago",
  },
  {
    id: "n12",
    lead: { icon: "rocket", tone: "success" },
    title: [{ text: "Service file sync connected", kind: "bold" }],
    body: "Ridgeline's serviced and cancelled accounts now arrive every night.",
    time: "2 days ago",
    tag: { label: "Sync", value: "Nightly", tone: "success" },
  },
  {
    id: "n13",
    lead: { person: "Julia Serrano" },
    title: [
      { text: "@julia", kind: "name" },
      { text: " mentioned you in #boise" },
    ],
    body: "“Can you look at Kyle's numbers before Saturday's ride-along?”",
    time: "3 days ago",
  },
  {
    id: "n14",
    lead: { icon: "circle-alert", tone: "warning" },
    title: [{ text: "Scheduled maintenance", kind: "bold" }],
    body: "Knock maintenance is planned for Sunday, 2:00 AM to 4:00 AM MT, while nobody knocks.",
    time: "4 days ago",
  },
  {
    id: "n15",
    lead: { icon: "credit-card", tone: "info" },
    title: [{ text: "Payment processed", kind: "bold" }],
    badge: "$512.00",
    body: "Knock Growth for 16 seats: $512.00 charged.",
    time: "2 weeks ago",
  },
]
export const UNREAD_NOTIFICATIONS = 6

/** The Pipeline sidebar's foot */
export const SEASON_QUOTA = {
  title: "Season Quota",
  body: `Serviced accounts against the summer's quota, week ${CURRENT_WEEK} of ${SEASON_WEEKS}`,
  closed: 55,
}

/**
 * The live metrics at the foot of Activities' and Contacts' sidebars: two readings each, ticking. A reading
 * above its `alert` line turns red and puts the badge on Alert.
 */
export const LIVE_METRICS = {
  activities: [
    {
      id: "doors",
      label: "Doors/hr",
      icon: "phone",
      colour: "blue",
      start: 8.4,
      min: 3,
      max: 14,
      alert: 12,
      unit: "",
    },
    {
      id: "overdue",
      label: "Overdue",
      icon: "circle-alert",
      colour: "emerald",
      start: 8.9,
      min: 0,
      max: 12,
      alert: 10,
      unit: "%",
    },
  ],
  contacts: [
    {
      id: "referrals",
      label: "Referrals/day",
      icon: "users",
      colour: "violet",
      start: 3.4,
      min: 0,
      max: 8,
      alert: 6,
      unit: "",
    },
    {
      id: "cancels",
      label: "Cancels",
      icon: "trending-down",
      colour: "sky",
      start: 2.6,
      min: 0,
      max: 6,
      alert: 5,
      unit: "%",
    },
  ],
} as const

export const SECURITY = {
  title: "Security Status",
  status: "Healthy",
  body: "All checks passed. 2FA on for every seat, permits current.",
}

/** The counts beside sidebar pages: approvals waiting, open and later tasks (their pages will own them) */
export const NAV_COUNTS: Record<string, number> = {
  "/approvals": 4,
  "/tasks": 11,
}
