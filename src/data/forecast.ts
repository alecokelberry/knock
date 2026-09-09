// Pipeline → Forecast: the season's call on serviced contract value, and the books behind it. Each rep's open book has
// three parts: accounts with a first service on Ridgeline's calendar (Commit), signed accounts still inside the three-day
// window (Best Case), and households priced and waiting on a callback (Pipeline). Counts add up to the reps' pending
// accounts in season.ts; each part is valued at the rep's average first-year contract.

import { SEASON } from "./season"
import { memberName, TEAM_BY_ID } from "./team"

export const FORECAST_RANGES = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const

export const FORECAST_CATEGORIES = ["Commit", "Best Case", "Pipeline"] as const
export type ForecastCategory = (typeof FORECAST_CATEGORIES)[number]
/** Where a book's accounts stand, from furthest along */
export const FORECAST_STAGES = ["Scheduled", "Sold", "Pitched"] as const
type ForecastStage = (typeof FORECAST_STAGES)[number]
export const MOVEMENTS = [
  "Raised",
  "Pulled in",
  "No change",
  "Lowered",
  "Slipped",
] as const
export type Movement = (typeof MOVEMENTS)[number]

/** The Season forecast menu: which categories the call counts */
export const FORECAST_CALLS = [
  { id: "commit", label: "Commit only", categories: ["Commit"] },
  {
    id: "best",
    label: "Commit + Best Case",
    categories: ["Commit", "Best Case"],
  },
  {
    id: "all",
    label: "All open",
    categories: ["Commit", "Best Case", "Pipeline"],
  },
] as const satisfies readonly {
  id: string
  label: string
  categories: readonly ForecastCategory[]
}[]

export type ForecastBook = {
  /** "darnell-brooks-scheduled" */
  id: string
  stage: ForecastStage
  category: ForecastCategory
  /** Accounts or households in this part of the book */
  accounts: number
  /** Their first-year contract value, whole dollars */
  amount: number
  /** Percent; the weighted figure is amount × probability */
  probability: number
  /** ISO day: the soonest first service, window close or callback */
  next: string
  /** The rep, and their office */
  owner: string
  office: string
  movement: Movement
}

/** Each rep's book: [scheduled, in the window, priced and waiting], the odds of each, their next dates and movement */
const BOOKS: Record<
  string,
  {
    counts: [number, number, number]
    odds: [number, number, number]
    next: [string, string, string]
    moved: [Movement, Movement, Movement]
  }
> = {
  "darnell-brooks": {
    counts: [12, 5, 24],
    odds: [94, 82, 34],
    next: ["2026-07-17", "2026-07-17", "2026-07-16"],
    moved: ["Pulled in", "Raised", "No change"],
  },
  "kirsten-vogt": {
    counts: [10, 5, 19],
    odds: [93, 80, 31],
    next: ["2026-07-17", "2026-07-20", "2026-07-18"],
    moved: ["No change", "Raised", "No change"],
  },
  "kyle-bennett": {
    counts: [8, 5, 16],
    odds: [90, 74, 26],
    next: ["2026-07-20", "2026-07-17", "2026-07-18"],
    moved: ["No change", "Lowered", "Raised"],
  },
  "ayesha-malik": {
    counts: [9, 4, 21],
    odds: [95, 84, 36],
    next: ["2026-07-17", "2026-07-18", "2026-07-17"],
    moved: ["Pulled in", "No change", "Raised"],
  },
  "toby-marsh": {
    counts: [12, 5, 18],
    odds: [92, 78, 30],
    next: ["2026-07-20", "2026-07-17", "2026-07-18"],
    moved: ["No change", "No change", "Lowered"],
  },
  "meera-iyer": {
    counts: [7, 4, 14],
    odds: [91, 70, 28],
    next: ["2026-07-18", "2026-07-17", "2026-07-17"],
    moved: ["Raised", "Lowered", "Raised"],
  },
  "sam-okafor": {
    counts: [15, 6, 22],
    odds: [93, 80, 33],
    next: ["2026-07-17", "2026-07-17", "2026-07-20"],
    moved: ["Slipped", "No change", "No change"],
  },
  "haruka-mori": {
    counts: [12, 5, 17],
    odds: [88, 76, 29],
    next: ["2026-07-21", "2026-07-18", "2026-07-17"],
    moved: ["Slipped", "No change", "Lowered"],
  },
  "owen-fletcher": {
    counts: [7, 4, 13],
    odds: [89, 68, 24],
    next: ["2026-07-20", "2026-07-17", "2026-07-19"],
    moved: ["No change", "Lowered", "No change"],
  },
}

const PARTS: [ForecastStage, ForecastCategory][] = [
  ["Scheduled", "Commit"],
  ["Sold", "Best Case"],
  ["Pitched", "Pipeline"],
]

/** Every rep's book, three parts each, furthest along first and biggest first within it */
export const FORECAST_BOOKS: ForecastBook[] = SEASON.flatMap((r) => {
  const b = BOOKS[r.memberId]!
  return PARTS.map(([stage, category], i) => ({
    id: `${r.memberId}-${stage.toLowerCase()}`,
    stage,
    category,
    accounts: b.counts[i]!,
    amount: b.counts[i]! * r.avgContract,
    probability: b.odds[i]!,
    next: b.next[i]!,
    owner: memberName(r.memberId),
    office: TEAM_BY_ID[r.memberId]?.market ?? "",
    movement: b.moved[i]!,
  }))
}).toSorted(
  (a, b) =>
    FORECAST_STAGES.indexOf(a.stage) - FORECAST_STAGES.indexOf(b.stage) ||
    b.amount - a.amount
)

/** Serviced so far this season: what's already counted, whole dollars */
export const SERVICED_TO_DATE = SEASON.reduce(
  (s, r) => s + r.serviced * r.avgContract,
  0
)

const moved = (kinds: Movement[]) => {
  const mine = FORECAST_BOOKS.filter((d) => kinds.includes(d.movement))
  return {
    total: mine.reduce((s, d) => s + d.amount, 0),
    deals: mine.reduce((s, d) => s + d.accounts, 0),
  }
}
const open = FORECAST_BOOKS.reduce((s, d) => s + d.amount, 0)
/** A week-by-week run up (or down) to where it stands now */
const run = (now: number, shape: number[]) =>
  shape.map((f) => Math.round((now * f) / 100) * 100)

const improved = moved(["Raised", "Pulled in"])
const worsened = moved(["Lowered", "Slipped"])
/** Forecast Movement since last week: what improved and worsened (weekly, W5 to now), and what moved in or out */
export const MOVEMENT_SUMMARY = {
  improved: {
    ...improved,
    share: Math.round((improved.total / open) * 100),
    weeks: run(improved.total, [0.58, 0.64, 0.61, 0.75, 0.83, 0.94, 1]),
  },
  worsened: {
    ...worsened,
    share: Math.round((worsened.total / open) * 100),
    weeks: run(worsened.total, [1.46, 1.33, 1.37, 1.21, 1.14, 1.06, 1]),
  },
  pulledIn: moved(["Pulled in"]).deals,
  slipped: moved(["Slipped"]).deals,
}
export const MOVEMENT_WEEKS = ["W5", "W6", "W7", "W8", "W9", "W10", "NOW"]
