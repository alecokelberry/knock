// The Dashboard (/): the date-range menu, four tiles with their eight weekly bars, Performance, Quota Coverage and Sales
// Sourced by period. The tiles count the season to date (season.ts: 983 serviced of a 1,800 quota, 135 sold and waiting
// on service, 64 cancelled); the bars are the last eight complete weeks. The Team Performance table is
// TEAM_PERFORMANCE in ./team.ts.

/** The menu behind the date-range button. The first is the one showing; choosing another changes only the button's label. */
export const DASH_RANGES = [
  "Jun 16 to Jul 16, 2026",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const
/** On a phone the default range prints short. */
export const DASH_RANGE_SHORT = "Last 30 days"

type Tone = "success" | "info" | "warning" | "destructive"

export type DashTile = {
  title: string
  hint: string
  change: string
  value: string
  /** The lucide icon on the muted tile: trending-up, kanban, users, triangle-alert. */
  icon: "trending-up" | "kanban" | "users" | "triangle-alert"
  tone: Tone
  /** Eight bar heights in percent: the last eight weeks, this one last */
  bars: number[]
}

/** Accounts serviced each complete week, weeks 3 to 10, across the nine reps: 82 … 130 */
const SERVICED_WEEKS = [82, 98, 105, 112, 124, 114, 124, 130]
const bars = (weeks: number[]) => {
  const top = Math.max(...weeks)
  return weeks.map((w) => Math.round((w / top) * 10_000) / 100)
}

export const DASH_TILES: DashTile[] = [
  {
    title: "Serviced",
    hint: "55% of season quota",
    change: "+14.8%",
    value: "983",
    icon: "trending-up",
    tone: "success",
    bars: bars(SERVICED_WEEKS),
  },
  {
    title: "Awaiting Service",
    hint: "92 scheduled",
    change: "+6.3%",
    value: "135",
    icon: "kanban",
    tone: "info",
    bars: bars([96, 104, 118, 121, 126, 119, 131, 135]),
  },
  {
    title: "Doors Knocked",
    hint: "3,751 pitches",
    change: "+9.1%",
    value: "23,770",
    icon: "users",
    tone: "success",
    bars: bars([2210, 2480, 2615, 2690, 2820, 2540, 2905, 3010]),
  },
  {
    title: "Cancels",
    hint: "5.4% of sales",
    change: "-18%",
    value: "64",
    icon: "triangle-alert",
    tone: "warning",
    bars: bars([11, 10, 9, 8, 9, 7, 6, 6]),
  },
]

/** The Performance card's period select. Choosing one changes only the select's label. */
export const PERFORMANCE_PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "season", label: "Season" },
] as const

export const PERFORMANCE_FIGURES = [
  { value: "$766K", label: "Serviced Value", change: "+14.2%", good: true },
  { value: "32%", label: "Close Rate", change: "+2.1 pts", good: true },
  {
    value: "3.4 days",
    label: "Sale to Service",
    change: "+0.6 days",
    good: false,
  },
]

/** Serviced or scheduled against the season's quota: (983 + 92) of 1,800 */
export const PIPELINE_PROGRESS = 60

export const RECENT_ACTIVITY: {
  text: string
  badge: string
  tone: "success" | "info" | "warning"
  icon: string
}[] = [
  {
    text: "Johan Lindberg's termite stations are in",
    badge: "Serviced",
    tone: "success",
    icon: "text-emerald-500",
  },
  {
    text: "Margaret Doyle's cancellation window closes Friday",
    badge: "Review",
    tone: "info",
    icon: "text-sky-500",
  },
  {
    text: "Stefan Richter asked to move his first service",
    badge: "Watch",
    tone: "warning",
    icon: "text-amber-500",
  },
]

export type Period = "week" | "month" | "season"
export const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "season", label: "Season" },
]

/** Quota Coverage by period: the figure, its change, the note after it, what's in play, and how many of the 56 bars light. */
export const QUOTA_COVERAGE: Record<
  Period,
  { percent: number; change: string; note: string; inPlay: string; lit: number }
> = {
  week: {
    percent: 88,
    change: "+4.1%",
    note: "of this week's quota",
    inPlay: "112 accounts",
    lit: 49,
  },
  month: {
    percent: 84,
    change: "+2.4%",
    note: "of July's quota",
    inPlay: "451 accounts",
    lit: 47,
  },
  season: {
    percent: 60,
    change: "+7.2%",
    note: "of the season's quota",
    inPlay: "1,075 accounts",
    lit: 34,
  },
}
export const QUOTA_BARS = 56
/** The three faces beside "9 Reps": the offices' sales managers. */
export const QUOTA_FACES = ["Julia Serrano", "Rafael Lima", "Mateo Alvarez"]

/** Sales Sourced by period. The ring's slices are the same every period; the Other slice (4%) is the rest of the total. */
export const SOURCED_SLICES = [
  {
    key: "door",
    name: "Door",
    color: "oklch(0.62 0.19 149)",
    share: "68%",
    weight: 68,
  },
  {
    key: "callback",
    name: "Callback",
    color: "oklch(0.58 0.18 257)",
    share: "19%",
    weight: 19,
  },
  {
    key: "referral",
    name: "Referral",
    color: "oklch(0.72 0.16 78)",
    share: "9%",
    weight: 9,
  },
  {
    key: "other",
    name: "Other",
    color: "oklch(0.7 0.04 260)",
    share: "4%",
    weight: 4,
  },
] as const

export const SOURCED: Record<
  Period,
  { total: string; values: Record<"door" | "callback" | "referral", string> }
> = {
  week: {
    total: "$71K",
    values: { door: "$48K", callback: "$13K", referral: "$6K" },
  },
  month: {
    total: "$341K",
    values: { door: "$232K", callback: "$65K", referral: "$31K" },
  },
  season: {
    total: "$938K",
    values: { door: "$638K", callback: "$178K", referral: "$84K" },
  },
}

export const QUOTA_INFO =
  "Share of the reps' quota covered by accounts serviced or scheduled this period."
export const SOURCED_INFO =
  "Contract value signed in the selected period, split by how the household came in."
