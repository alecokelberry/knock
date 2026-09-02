// Home → Attainment: offices and reps week by week (serviced, quota or the gap), each rep's biggest swing from plan,
// the offices' plan-match rings, the weeks in view and how they step, the footer's totals, New target's meter, and
// the Export CSV.

import {
  ATT_SEGMENTS,
  ATT_WEEKS,
  type AttRep,
  type AttSegment,
  type AttView,
  STRETCH_CEILING,
} from "@/data/attainment"
import { SEASON_START } from "@/data/season"
import { toCsv } from "@/lib/csv"
import { addDays, daysBetween, isoDate, localDate } from "@/lib/dates"

const LAST = ATT_WEEKS.length - 1
/** A week's figure (week indices come from ATT_WEEKS, so one is always there) */
const at = (xs: readonly number[], m: number) => xs[m] ?? 0
/** A week's name, "W3" */
export const weekLabel = (m: number) => ATT_WEEKS[m] ?? ""

/** "137", and a shortfall in brackets: "(12)" */
export const money = (n: number) =>
  n < 0 ? `(${(-n).toLocaleString("en-US")})` : n.toLocaleString("en-US")

/** A week's Monday and Sunday, as the range picker's calendar wants them */
export const weekStart = (w: number) => localDate(addDays(SEASON_START, 7 * w))
export const weekEnd = (w: number) =>
  localDate(addDays(SEASON_START, 7 * w + 6))
/** The week a picked day falls in, kept inside W1 to W10 */
export const weekOf = (d: Date) =>
  Math.min(
    LAST,
    Math.max(0, Math.floor(daysBetween(SEASON_START, isoDate(d)) / 7))
  )

/** The weeks in view: a first and last week index, both within W1 to W10 */
export type WeekSpan = { from: number; to: number }
/** The grid opens on the last five complete weeks */
export const OPEN_WEEKS: WeekSpan = { from: Math.max(0, LAST - 4), to: LAST }
export const spanWeeks = ({ from, to }: WeekSpan) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)
/** "W6", or "W6 - W10" */
export const spanLabel = ({ from, to }: WeekSpan) =>
  from === to ? weekLabel(from) : `${weekLabel(from)} - ${weekLabel(to)}`

/** Previous or Next Range: the same number of weeks before or after, pulled back inside W1 to W10 */
export function stepSpan({ from, to }: WeekSpan, dir: -1 | 1): WeekSpan {
  const len = to - from + 1
  const start = Math.min(Math.max(from + dir * len, 0), LAST - len + 1)
  return { from: start, to: start + len - 1 }
}

type Figures = { serviced: number[]; quota: number[] }
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
export const segmentFigures = (s: AttSegment): Figures => ({
  serviced: ATT_WEEKS.map((_, m) => sum(s.reps.map((r) => at(r.serviced, m)))),
  quota: ATT_WEEKS.map((_, m) => sum(s.reps.map((r) => at(r.quota, m)))),
})

/** A week's cell: the figure for the view, and for the gap its share of quota */
export function cellValue(f: Figures, m: number, view: AttView) {
  const serviced = at(f.serviced, m)
  const quota = at(f.quota, m)
  if (view === "Serviced") return { value: serviced }
  if (view === "Quota") return { value: quota }
  const gap = serviced - quota
  return { value: gap, share: Math.round((Math.abs(gap) / quota) * 100) }
}

export type RepStatus = "Favorable" | "Stable" | "Watch" | "Critical"
export type RepFlag = {
  week: number
  variance: number
  status: RepStatus
  line: string
  actual: number
  plan: number
}

/** A rep's week with the biggest swing from plan in view (the earlier one on a tie), and what it says */
export function repFlag(r: AttRep, span: WeekSpan): RepFlag {
  const weeks = spanWeeks(span).map((m) => ({
    m,
    v: Math.round((at(r.serviced, m) / at(r.quota, m) - 1) * 100),
  }))
  const { m, v } = weeks.reduce((best, x) =>
    Math.abs(x.v) > Math.abs(best.v) ? x : best
  )
  const status: RepStatus =
    v >= 10
      ? "Favorable"
      : v <= -20
        ? "Critical"
        : v <= -10
          ? "Watch"
          : "Stable"
  const week = weekLabel(m)
  const line =
    status === "Stable"
      ? `${week} stayed within ${Math.abs(v)}% of plan.`
      : `${week} landed ${Math.abs(v)}% ${v > 0 ? "above" : "below"} plan.`
  return {
    week: m,
    variance: v,
    status,
    line,
    actual: at(r.serviced, m),
    plan: at(r.quota, m),
  }
}
export const varianceLabel = (v: number) => (v > 0 ? `+${v}%` : `${v}%`)

/**
 * An office's plan-match ring over the weeks in view: 100 less the average miss from quota, week by week (a week 10%
 * under and a week 10% over both miss by 10), its tone, and what its tooltip says
 */
export function planMatch(_segment: number, span: WeekSpan, f: Figures) {
  const weeks = spanWeeks(span)
  const misses = weeks.map(
    (m) => Math.abs(at(f.serviced, m) / at(f.quota, m) - 1) * 100
  )
  const percent = Math.max(0, Math.round(100 - sum(misses) / misses.length))
  const actual = sum(weeks.map((m) => at(f.serviced, m)))
  const plan = sum(weeks.map((m) => at(f.quota, m)))
  const close = percent >= 80
  return {
    percent,
    close,
    line: close
      ? "Tracking closely to plan across the visible weeks."
      : "Some drift is building across the visible weeks.",
    actual,
    plan,
  }
}

export type AttRow = {
  id: string
  kind: "segment" | "rep"
  index: number
  name: string
  figures: Figures
  rep?: AttRep
  subRows?: AttRow[]
}

/**
 * The rows in view: the office filter, then the search, which keeps an office whose name matches (with all its reps)
 * or the reps that match (under their office).
 */
export function attRows(segment: string, query: string): AttRow[] {
  const q = query.trim().toLowerCase()
  return ATT_SEGMENTS.flatMap((s, index): AttRow[] => {
    if (segment !== "all" && s.name !== segment) return []
    const nameHit = !q || s.name.toLowerCase().includes(q)
    const reps = nameHit
      ? s.reps
      : s.reps.filter((r) => r.name.toLowerCase().includes(q))
    if (!nameHit && !reps.length) return []
    const subRows = reps.map((r): AttRow => ({
      id: r.name,
      kind: "rep",
      index,
      name: r.name,
      figures: r,
      rep: r,
    }))
    return [
      {
        id: s.name,
        kind: "segment",
        index,
        name: s.name,
        figures: segmentFigures(s),
        subRows,
      },
    ]
  })
}

/** Sorts offices, and reps within each, by name or by a week's figure in the view */
export function sortRows(
  rows: AttRow[],
  by: { id: string; desc: boolean } | null,
  view: AttView
): AttRow[] {
  if (!by) return rows
  const key = (r: AttRow) =>
    by.id === "name" ? r.name : cellValue(r.figures, Number(by.id), view).value
  const cmp = (a: AttRow, b: AttRow) => {
    const [x, y] = [key(a), key(b)]
    const c = typeof x === "string" ? x.localeCompare(String(y)) : x - Number(y)
    return by.desc ? -c : c
  }
  return rows
    .toSorted(cmp)
    .map((r) => (r.subRows ? { ...r, subRows: r.subRows.toSorted(cmp) } : r))
}

/** The footer: every office's week total, then the largest office (or the one filtered to) */
export function attFooter(view: AttView, segment: string) {
  const all = ATT_SEGMENTS.map(segmentFigures)
  const total: Figures = {
    serviced: ATT_WEEKS.map((_, m) => sum(all.map((f) => at(f.serviced, m)))),
    quota: ATT_WEEKS.map((_, m) => sum(all.map((f) => at(f.quota, m)))),
  }
  const largest = ATT_SEGMENTS.reduce((a, b) =>
    sum(segmentFigures(b).serviced) > sum(segmentFigures(a).serviced) ? b : a
  )
  const pick =
    segment === "all" ? largest : ATT_SEGMENTS.find((s) => s.name === segment)!
  return {
    totalLabel: view === "Gap" ? "Serviced vs quota" : "Week Total",
    total: ATT_WEEKS.map((_, m) => cellValue(total, m, view).value),
    segmentName: pick.name,
    segmentLabel: segment === "all" ? "Largest office" : "Office total",
    segment: ATT_WEEKS.map(
      (_, m) => cellValue(segmentFigures(pick), m, view).value
    ),
  }
}

export const visibleLabel = (n: number) =>
  `${n} Visible ${n === 1 ? "Office" : "Offices"}`

/** New target's meter: the amount's share of the stretch ceiling, and what that share means */
export function stretchShare(amount: string) {
  const n = Number(amount.replace(/[$,\s]/g, ""))
  if (!amount.trim() || !(n > 0))
    return {
      share: 0,
      band: null,
      line: "Enter a number to see how it sits against the stretch ceiling.",
    }
  const share = Math.min(100, Math.round((n / STRETCH_CEILING) * 100))
  if (share >= 90)
    return {
      share,
      band: "aggressive" as const,
      line: "Aggressive — above 90% of the stretch ceiling.",
    }
  if (share >= 60)
    return {
      share,
      band: "ambitious" as const,
      line: "Ambitious but within the stretch band.",
    }
  return {
    share,
    band: "comfortable" as const,
    line: "Comfortable — room to raise later.",
  }
}
export const targetAmount = (amount: string) =>
  Number(amount.replace(/[$,\s]/g, ""))
export const targetError = (amount: string) =>
  targetAmount(amount) > 0 ? null : "Enter a number of accounts"

/** What Export downloads: every office and rep over the weeks in view, in the view's figures */
export function attainmentCsv(view: AttView, span: WeekSpan): string {
  const weeks = spanWeeks(span)
  const line = (name: string, f: Figures) => [
    name,
    ...weeks.map((m) => cellValue(f, m, view).value),
  ]
  return toCsv([
    ["Attainment", view, spanLabel(span)],
    [],
    ["Office / Rep", ...weeks.map(weekLabel)],
    ...ATT_SEGMENTS.flatMap((s) => [
      line(s.name, segmentFigures(s)),
      ...s.reps.map((r) => line(`  ${r.name}`, r)),
    ]),
  ])
}
