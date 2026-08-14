// The summer season so far, rep by rep: the one set of numbers the Dashboard, Quick Stats, Attainment and Forecast count
// from. The season runs sixteen weeks from Monday, May 4; the demo's today (Thursday, July 16) is in week 11, so ten weeks
// are complete. An account is sold when the homeowner signs, and counts toward quota and pay
// once Ridgeline's technician has done the initial service.

import type { SELLER_IDS } from "./team"

/** The season's first Monday, its length in weeks, and the week the demo's today falls in */
export const SEASON_START = "2026-05-04"
export const SEASON_WEEKS = 16
export const CURRENT_WEEK = 11
/** Weeks complete: the ones Attainment draws */
export const WEEKS_DONE = CURRENT_WEEK - 1

export type RepSeason = {
  memberId: (typeof SELLER_IDS)[number]
  /** Serviced accounts the rep is asked for over the whole season */
  quota: number
  /** Doors knocked, full pitches given, and agreements signed, season to date */
  doors: number
  pitches: number
  sold: number
  /** Signed, then cancelled before the initial service */
  cancelled: number
  /** Initial service done: what pays and counts */
  serviced: number
  /** Signed and not yet serviced (in the three-day window or waiting on a technician) */
  pending: number
  /** Average first-year contract value of the rep's serviced accounts, whole dollars */
  avgContract: number
  /** Accounts serviced in each complete week, and the quota for each */
  weekly: number[]
  weeklyQuota: number[]
}

const rep = (
  memberId: RepSeason["memberId"],
  quota: number,
  [doors, pitches, sold, cancelled, serviced, pending]: [
    number,
    number,
    number,
    number,
    number,
    number,
  ],
  avgContract: number,
  weekly: number[],
  weeklyQuota: number[]
): RepSeason => ({
  memberId,
  quota,
  doors,
  pitches,
  sold,
  cancelled,
  serviced,
  pending,
  avgContract,
  weekly,
  weeklyQuota,
})

/** The nine reps, market by market, team lead first */
export const SEASON: RepSeason[] = [
  rep(
    "darnell-brooks",
    260,
    [3120, 540, 196, 8, 171, 17],
    812,
    [7, 12, 15, 17, 19, 19, 21, 19, 20, 22],
    [8, 13, 16, 19, 19, 19, 18, 18, 18, 18]
  ),
  rep(
    "kirsten-vogt",
    210,
    [2760, 452, 146, 7, 124, 15],
    768,
    [4, 8, 10, 13, 13, 14, 16, 14, 16, 16],
    [6, 10, 13, 15, 15, 15, 15, 15, 15, 15]
  ),
  rep(
    "kyle-bennett",
    140,
    [2240, 301, 76, 5, 58, 13],
    702,
    [1, 2, 4, 5, 6, 7, 8, 8, 8, 9],
    [4, 7, 8, 10, 10, 10, 10, 10, 10, 10]
  ),
  rep(
    "ayesha-malik",
    250,
    [2980, 505, 183, 7, 163, 13],
    836,
    [6, 11, 15, 16, 18, 18, 20, 18, 20, 21],
    [7, 12, 15, 18, 18, 18, 18, 18, 18, 18]
  ),
  rep(
    "toby-marsh",
    200,
    [2640, 431, 128, 7, 104, 17],
    759,
    [3, 7, 9, 11, 11, 12, 13, 12, 13, 13],
    [6, 10, 12, 15, 15, 14, 14, 14, 14, 14]
  ),
  rep(
    "meera-iyer",
    140,
    [2310, 322, 90, 7, 72, 11],
    694,
    [1, 3, 4, 6, 8, 9, 10, 10, 10, 11],
    [4, 7, 8, 10, 10, 10, 10, 10, 10, 10]
  ),
  rep(
    "sam-okafor",
    260,
    [3050, 520, 178, 8, 149, 21],
    801,
    [6, 11, 14, 15, 16, 16, 18, 16, 18, 19],
    [8, 13, 16, 19, 19, 19, 18, 18, 18, 18]
  ),
  rep(
    "haruka-mori",
    200,
    [2590, 418, 125, 7, 101, 17],
    774,
    [3, 6, 8, 11, 10, 12, 13, 12, 13, 13],
    [6, 10, 12, 15, 15, 14, 14, 14, 14, 14]
  ),
  rep(
    "owen-fletcher",
    140,
    [2080, 262, 60, 8, 41, 11],
    688,
    [1, 2, 3, 4, 4, 5, 5, 5, 6, 6],
    [4, 7, 8, 10, 10, 10, 10, 10, 10, 10]
  ),
]

export const SEASON_BY_REP: Record<string, RepSeason> = Object.fromEntries(
  SEASON.map((r) => [r.memberId, r])
)
