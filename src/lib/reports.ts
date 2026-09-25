// Reports → Overview and Conversion: the three headline cards, the households that need a decision this week, each
// gate's advances, the Stage Breakdown's rows and risk, and the CSVs the pages export.

import { type Deal, DEAL_STAGES, DEALS, isOpen } from "@/data/deals"
import { FORECAST_BOOKS } from "@/data/forecast"
import {
  ADVANCES,
  type AdvancePeriod,
  CLOSE_RATE_WEEKS,
  type Gate,
  GATE_ROWS,
  GATES,
  type GateRow,
} from "@/data/reports"
import { SEASON } from "@/data/season"
import { memberName, TEAM_MEMBERS } from "@/data/team"
import { toCsv } from "@/lib/csv"
import { shortMoney, weighted } from "@/lib/forecast"
import { dateKind } from "@/lib/pipeline"

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)

/** Serviced contract value by complete week: each rep's accounts at their average contract */
export const servicedValueWeeks = () =>
  SEASON[0]!.weekly.map((_, w) =>
    sum(SEASON.map((r) => (r.weekly[w] ?? 0) * r.avgContract))
  )

export type ReportKpi = {
  id: "serviced" | "forecast" | "close"
  title: string
  sub: string
  value: string
  series: number[]
}

/** The Overview's three cards: serviced value, the weighted forecast of the open books, and the close rate */
export function reportKpis(): ReportKpi[] {
  const serviced = servicedValueWeeks()
  const forecast = sum(FORECAST_BOOKS.map(weighted))
  const accounts = sum(SEASON.map((r) => r.serviced))
  const sold = sum(SEASON.map((r) => r.sold))
  const pitches = sum(SEASON.map((r) => r.pitches))
  return [
    {
      id: "serviced",
      title: "Serviced Value",
      sub: `${accounts.toLocaleString("en-US")} accounts serviced`,
      value: shortMoney(sum(serviced)),
      series: serviced,
    },
    {
      id: "forecast",
      title: "Weighted Forecast",
      sub: "Open books, by their odds",
      value: shortMoney(forecast),
      // The call as it built over the last ten weeks
      series: [0.52, 0.58, 0.63, 0.7, 0.74, 0.79, 0.84, 0.9, 0.95, 1].map((f) =>
        Math.round(forecast * f)
      ),
    },
    {
      id: "close",
      title: "Close Rate",
      sub: "Season to date",
      value: `${pct(sold, pitches)}%`,
      series: CLOSE_RATE_WEEKS,
    },
  ]
}

/** The households needing a decision this week: every open one on the board, biggest first */
export const attentionRows = (deals: readonly Deal[] = DEALS) =>
  deals.filter(isOpen).toSorted((a, b) => b.value - a.value)

/** The Stage column: the stage's label and its place along the board, as a share */
export const stageOf = (d: Pick<Deal, "stage">) => {
  const i = DEAL_STAGES.findIndex((s) => s.id === d.stage)
  return {
    label: DEAL_STAGES[i]?.label ?? d.stage,
    progress: Math.round(((i + 1) / DEAL_STAGES.length) * 100),
  }
}

/** The Status column's second line: "Callback Jul 16, 2026" */
export const dueLine = (d: Pick<Deal, "stage" | "dateLabel">) =>
  `${dateKind(d.stage)} ${d.dateLabel}`

/** A household's text for the search: the homeowner, the address, the territory and the id */
export const attentionMatches = (d: Deal, query: string) => {
  const q = query.trim().toLowerCase()
  return (
    !q ||
    [d.household, d.address, d.territory, d.id].some((s) =>
      s.toLowerCase().includes(q)
    )
  )
}

/** What the Overview's Export downloads: the households needing attention */
export const attentionCsv = (rows: readonly Deal[]) =>
  toCsv([
    [
      "Household",
      "Homeowner",
      "Office",
      "Rep",
      "Stage",
      "Plan",
      "Value",
      "Status",
      "Next",
    ],
    ...rows.map((d) => [
      d.id.toUpperCase(),
      d.household,
      d.office,
      memberName(d.ownerId),
      stageOf(d).label,
      [d.plan, d.addOn].filter(Boolean).join(" + "),
      d.value,
      d.status,
      dueLine(d),
    ]),
  ])

/** Stage Advances for a period: each gate's households, and the total */
export function advances(period: AdvancePeriod) {
  const byGate = ADVANCES[period]
  const slices = GATES.map((gate) => ({ gate, count: byGate[gate] }))
  return { slices, total: sum(slices.map((s) => s.count)) }
}

export type Risk = "Healthy" | "Watch" | "At risk"

/**
 * A gate's risk, against what each gate usually does: fewer than 15.8% of doors pitched, fewer than 31% of pitches
 * signed (28% is at risk), more than 6% of sales cancelled, or more than 9% of scheduled accounts still waiting on a
 * first service (11% is at risk)
 */
function gateRisk(r: GateRow): Risk {
  const advanced = (r.advanced / r.entered) * 100
  const stalled = (r.stalled / r.entered) * 100
  const lost = (r.lost / r.entered) * 100
  switch (r.gate) {
    case "Pitched":
      return advanced < 15.8 ? "Watch" : "Healthy"
    case "Sold":
      return advanced < 28 ? "At risk" : advanced < 31 ? "Watch" : "Healthy"
    case "Scheduled":
      return lost > 6 ? "Watch" : "Healthy"
    case "Serviced":
      return stalled > 11 ? "At risk" : stalled > 9 ? "Watch" : "Healthy"
  }
}

/** What each gate means, under its name in the table */
export const GATE_NOTE: Record<Gate, string> = {
  Pitched: "Doors that heard the pitch",
  Sold: "Pitches that signed",
  Scheduled: "Sales past the three-day window",
  Serviced: "First services Ridgeline has done",
}

/** The office's sales manager, who owns its gates */
const managerOf = (office: string) =>
  TEAM_MEMBERS.find((m) => m.market === office && m.role === "Sales Manager")
    ?.name ?? ""

export type BreakdownRow = GateRow & {
  id: string
  code: string
  owner: string
  advancedShare: number
  stalledShare: number
  lostShare: number
  risk: Risk
}

/** Stage Breakdown's rows, for one gate or all of them ("all"), office by office */
export function breakdownRows(gate: Gate | "all"): BreakdownRow[] {
  return GATE_ROWS.filter((r) => gate === "all" || r.gate === gate).map(
    (r) => ({
      ...r,
      id: `${r.office}-${r.gate}`,
      code: `${r.office.slice(0, 3).toUpperCase()}-${GATES.indexOf(r.gate) + 1}`,
      owner: managerOf(r.office),
      advancedShare: pct(r.advanced, r.entered),
      stalledShare: pct(r.stalled, r.entered),
      lostShare: pct(r.lost, r.entered),
      risk: gateRisk(r),
    })
  )
}

/** What the Conversion page's Export downloads: the breakdown in view */
export const breakdownCsv = (rows: readonly BreakdownRow[]) =>
  toCsv([
    [
      "Gate",
      "Office",
      "Owner",
      "Entered",
      "Advanced",
      "Stalled",
      "Lost",
      "Risk",
      "Avg days",
    ],
    ...rows.map((r) => [
      r.gate,
      r.office,
      r.owner,
      r.entered,
      r.advanced,
      r.stalled,
      r.lost,
      r.risk,
      r.avgDays,
    ]),
  ])
