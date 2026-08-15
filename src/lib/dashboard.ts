import {
  DASH_TILES,
  PERFORMANCE_FIGURES,
  PIPELINE_PROGRESS,
  QUOTA_COVERAGE,
  SOURCED,
} from "@/data/dashboard"
import { TEAM_BY_ID, TEAM_PERFORMANCE } from "@/data/team"
import { toCsv } from "@/lib/csv"

/** What the Dashboard's Export downloads: the team table, then the numbers above it. */
export function dashboardCsv(range: string): string {
  return toCsv([
    ["Dashboard", range],
    [],
    ["Metric", "Value", "Change"],
    ...DASH_TILES.map((t) => [t.title, t.value, t.change]),
    ...PERFORMANCE_FIGURES.map((f) => [f.label, f.value, f.change]),
    ["Quota Progress", `${PIPELINE_PROGRESS}%`, ""],
    [
      "Quota Coverage (week)",
      `${QUOTA_COVERAGE.week.percent}%`,
      QUOTA_COVERAGE.week.change,
    ],
    ["Sales Sourced (week)", SOURCED.week.total, ""],
    [],
    ["Rep", "Title", "Quota", "Note", "Close Rate", "Waiting", "Status"],
    ...TEAM_PERFORMANCE.map((r) => [
      TEAM_BY_ID[r.memberId]?.name ?? r.memberId,
      r.title,
      `${r.quota}%`,
      r.quotaNote,
      r.closeRate,
      r.pending,
      r.status,
    ]),
  ])
}
