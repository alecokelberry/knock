// Home → Attainment: the three offices and their reps, week by week, serviced accounts against quota over the ten
// complete weeks of the season (season.ts; week 11 is under way), and the New target form's choices.

import { SEASON, SEASON_START, WEEKS_DONE } from "./season"
import { MARKETS, memberName, TEAM_BY_ID } from "./team"

/** The weeks on the grid, first to last: "W1" … "W10" */
export const ATT_WEEKS = Array.from(
  { length: WEEKS_DONE },
  (_, i) => `W${i + 1}`
)
/** The first and last day the range picker allows: the season's first Monday, and the Sunday week 10 ends */
export const ATT_FIRST_DAY = SEASON_START
export const ATT_LAST_DAY = "2026-07-12"

export const ATT_RANGES = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const
export const ATT_VIEWS = ["Serviced", "Quota", "Gap"] as const
export type AttView = (typeof ATT_VIEWS)[number]

export type AttRep = { name: string; serviced: number[]; quota: number[] }
export type AttSegment = { name: string; reps: AttRep[] }

/** Each office's reps and their weeks, in serviced accounts */
export const ATT_SEGMENTS: AttSegment[] = MARKETS.map((office) => ({
  name: office,
  reps: SEASON.filter((r) => TEAM_BY_ID[r.memberId]?.market === office).map(
    (r) => ({
      name: memberName(r.memberId),
      serviced: r.weekly,
      quota: r.weeklyQuota,
    })
  ),
}))

/** Offices open when the page loads */
export const ATT_OPEN = ["Boise", "Raleigh"]

/** New target: whose target it can be, the ceiling its meter measures against, and the number it suggests */
export const TARGET_REPS = SEASON.map((r) => memberName(r.memberId))
export const TARGET_PERIOD = "Week 12"
/** The weeks left in the season, the ones a target can be set for */
export const TARGET_PERIODS = [
  "Week 12",
  "Week 13",
  "Week 14",
  "Week 15",
  "Week 16",
]
export const STRETCH_CEILING = 40
export const TARGET_HINT = "22"
