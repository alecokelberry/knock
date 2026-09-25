// Reports → Overview and Conversion: what the season's reports show beyond the season numbers themselves (season.ts),
// the forecast's books (forecast.ts) and the board (deals.ts), which lib/reports.ts counts from. Here: the funnel's
// weekly rates, the households each gate advanced per period, and the stalled and lost splits per office and gate.

import type { Market } from "./team"

export const REPORT_RANGES = [
  "This week",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "This season",
] as const

/** Close rate (sales per pitch) by complete week, W1 to W10, in percent */
export const CLOSE_RATE_WEEKS = [26, 28, 29, 30, 31, 31, 32, 33, 33, 34]

/** The Stage Conversion card's ranges, and its weeks */
export const CONVERSION_RANGES = [
  "Last 30 days",
  "Last 14 days",
  "This season",
] as const
export const CONVERSION_WEEKS = ["W6", "W7", "W8", "W9", "W10"]

/** The funnel's three rates and the cancellation rate, by week (W6 to W10), in percent; the last is the headline. All four
 * moved the right way this month (up, and the cancellations down). */
export const FUNNEL_RATES = [
  {
    key: "pitch",
    label: "Doors to pitch",
    weeks: [14.9, 15.2, 15.6, 15.9, 16.3],
    change: "+0.7",
  },
  {
    key: "sale",
    label: "Pitch to sale",
    weeks: [31, 31, 32, 33, 34],
    change: "+2",
  },
  {
    key: "service",
    label: "Sale to service",
    weeks: [90, 91, 92, 92, 93],
    change: "+1",
  },
  {
    key: "cancel",
    label: "Cancelled",
    weeks: [6.1, 5.8, 5.6, 5.1, 4.9],
    change: "-0.7",
  },
] as const

/** The gates a household clears, in order */
export const GATES = ["Pitched", "Sold", "Scheduled", "Serviced"] as const
export type Gate = (typeof GATES)[number]

/** Stage Advances: households that cleared each gate in the period (each counted once, at the furthest gate it cleared) */
export const ADVANCE_PERIODS = ["7D", "30D", "Season"] as const
export type AdvancePeriod = (typeof ADVANCE_PERIODS)[number]
export const ADVANCES: Record<AdvancePeriod, Record<Gate, number>> = {
  "7D": { Pitched: 96, Sold: 91, Scheduled: 88, Serviced: 130 },
  "30D": { Pitched: 403, Sold: 437, Scheduled: 402, Serviced: 451 },
  Season: { Pitched: 3751, Sold: 1182, Scheduled: 1075, Serviced: 983 },
}
/** The advances badge: this period against the one before */
export const ADVANCE_CHANGE: Record<AdvancePeriod, string> = {
  "7D": "+8.6%",
  "30D": "+11.2%",
  Season: "+4.1%",
}

/** One office's gate over the season: how many reached it, advanced past it, stalled in it and were lost at it */
export type GateRow = {
  office: Market
  gate: Gate
  /** Came in: doors knocked for Pitched, pitches for Sold, sales for Scheduled, scheduled accounts for Serviced */
  entered: number
  advanced: number
  stalled: number
  lost: number
  /** Average days a household spends before clearing it */
  avgDays: number
}

/**
 * Stage Breakdown, office by office. Pitched: doors that heard the pitch (stalled are doors marked for another knock,
 * lost the ones that said no). Sold: pitches that signed (stalled are prices left at the door). Scheduled: sales past the three-day window
 * (stalled are still inside it, lost the cancellations). Serviced: scheduled accounts Ridgeline has treated.
 */
export const GATE_ROWS: GateRow[] = [
  {
    office: "Boise",
    gate: "Pitched",
    entered: 8120,
    advanced: 1293,
    stalled: 142,
    lost: 6685,
    avgDays: 1.8,
  },
  {
    office: "Boise",
    gate: "Sold",
    entered: 1293,
    advanced: 418,
    stalled: 59,
    lost: 816,
    avgDays: 2.4,
  },
  {
    office: "Boise",
    gate: "Scheduled",
    entered: 418,
    advanced: 383,
    stalled: 15,
    lost: 20,
    avgDays: 3.1,
  },
  {
    office: "Boise",
    gate: "Serviced",
    entered: 383,
    advanced: 353,
    stalled: 30,
    lost: 0,
    avgDays: 3.4,
  },
  {
    office: "Raleigh",
    gate: "Pitched",
    entered: 7930,
    advanced: 1258,
    stalled: 128,
    lost: 6544,
    avgDays: 1.9,
  },
  {
    office: "Raleigh",
    gate: "Sold",
    entered: 1258,
    advanced: 401,
    stalled: 53,
    lost: 804,
    avgDays: 2.6,
  },
  {
    office: "Raleigh",
    gate: "Scheduled",
    entered: 401,
    advanced: 367,
    stalled: 13,
    lost: 21,
    avgDays: 3.2,
  },
  {
    office: "Raleigh",
    gate: "Serviced",
    entered: 367,
    advanced: 339,
    stalled: 28,
    lost: 0,
    avgDays: 3.6,
  },
  {
    office: "Phoenix",
    gate: "Pitched",
    entered: 7720,
    advanced: 1200,
    stalled: 116,
    lost: 6404,
    avgDays: 2.1,
  },
  {
    office: "Phoenix",
    gate: "Sold",
    entered: 1200,
    advanced: 363,
    stalled: 52,
    lost: 785,
    avgDays: 2.9,
  },
  {
    office: "Phoenix",
    gate: "Scheduled",
    entered: 363,
    advanced: 325,
    stalled: 15,
    lost: 23,
    avgDays: 3.3,
  },
  {
    office: "Phoenix",
    gate: "Serviced",
    entered: 325,
    advanced: 291,
    stalled: 34,
    lost: 0,
    avgDays: 4.0,
  },
]
