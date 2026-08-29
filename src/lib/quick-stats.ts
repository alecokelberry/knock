// Home → Quick Stats: a person's week of logged hours as Hours by Rep shows it, its filters, New log's checks and
// the Export CSV. Reps work Monday to Saturday; Sunday is off.

import {
  HOLIDAYS,
  OPEN_BY_STAGE,
  PIPELINE_BY_SOURCE,
  SOURCE_PERIODS,
  type TimeCategory,
  type TimeRep,
  type WorkDay,
} from "@/data/quick-stats"
import { toCsv } from "@/lib/csv"
import { addDays, localDate } from "@/lib/dates"

/** A day's full bar, in hours */
export const DAY_HOURS = 8
/** Monday to Saturday */
const WORK_DAYS = 6
/** At or above this share of target a week is on target (and trends up); above the ceiling it's over */
export const ON_TARGET = 85
const OVER_TARGET = 110

/** Hours the way Hours by Rep writes them: "6h", "5h 30m", "45m" */
export function hoursLabel(h: number) {
  const whole = Math.floor(h)
  const minutes = Math.round((h - whole) * 60)
  if (!minutes) return `${whole}h`
  return whole ? `${whole}h ${minutes}m` : `${minutes}m`
}

/** "Jul 13 - 19", or "Jun 29 - Jul 5" across a month */
export function weekLabel(monday: string) {
  const a = localDate(monday)
  const b = localDate(addDays(monday, 6))
  const month = (d: Date) => d.toLocaleString("en-US", { month: "short" })
  return a.getMonth() === b.getMonth()
    ? `${month(a)} ${a.getDate()} - ${b.getDate()}`
    : `${month(a)} ${a.getDate()} - ${month(b)} ${b.getDate()}`
}

/** The Monday of a day's week */
export function mondayOf(iso: string) {
  const day = localDate(iso).getDay()
  return addDays(iso, day === 0 ? -6 : 1 - day)
}

export type DayCell = {
  date: string
  hours: number | null
  label: TimeCategory | "Open" | "Off"
  note: string
}
export type RepWeek = {
  rep: TimeRep
  days: DayCell[]
  total: number
  percent: number
}

const SUNDAY_NOTE = "Sundays are off."
const OPEN_NOTE = "No time has been logged for this work day yet."

/** One person's week: each day's hours, kind and note (Sundays and holidays Off, empty work days Open), the total and its share of target */
export function repWeek(
  rep: TimeRep,
  monday: string,
  week: (WorkDay | null)[] | undefined
): RepWeek {
  const days = Array.from({ length: 7 }, (_, i): DayCell => {
    const date = addDays(monday, i)
    const log = i < WORK_DAYS ? week?.[i] : null
    if (log) return { date, hours: log[0], label: log[1], note: log[2] }
    const holiday = HOLIDAYS[date]
    if (holiday) return { date, hours: null, label: "Off", note: holiday }
    return {
      date,
      hours: null,
      label: i < WORK_DAYS ? "Open" : "Off",
      note: i < WORK_DAYS ? OPEN_NOTE : SUNDAY_NOTE,
    }
  })
  const total = days.reduce((sum, d) => sum + (d.hours ?? 0), 0)
  return { rep, days, total, percent: Math.round((total / rep.target) * 100) }
}

export type TrackedBand = "Under target" | "On target" | "Over target"
export const trackedBand = (percent: number): TrackedBand =>
  percent < ON_TARGET
    ? "Under target"
    : percent > OVER_TARGET
      ? "Over target"
      : "On target"

export type ClientBand = "Mostly doors" | "Mixed" | "Off the doors"
/** How much of a week went to the doors: none, under half, or most of it */
export function clientBand(w: RepWeek): ClientBand {
  const client = w.days.reduce(
    (sum, d) => sum + (d.label === "Doors" ? (d.hours ?? 0) : 0),
    0
  )
  if (!client) return "Off the doors"
  return client / w.total >= 0.5 ? "Mostly doors" : "Mixed"
}

export type LogErrors = { date?: string; hours?: string }
/** New log's two required fields */
export function logErrors(date: string, hours: string): LogErrors {
  const errors: LogErrors = {}
  if (!date.trim()) errors.date = "Enter a date"
  if (!hours.trim()) errors.hours = "Enter the hours"
  else if (!(Number(hours) > 0)) errors.hours = "Enter hours greater than 0"
  return errors
}

/** "Kyle Bennett · 6.5h · Doors · Riverbend" (the hours as typed, where the grid writes 6h 30m) */
export const logLine = (
  rep: string,
  hours: number,
  category: TimeCategory,
  account: string
) => `${rep} · ${hours}h · ${category} · ${account}`

/** A typed date ("Jul 15, 2026", "2026-07-15") as an ISO day, or null */
export function parseLogDate(text: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim())
  const d = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(text)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Adds a log to a person's work day: onto what's there (which keeps its kind and note), or as the day's first entry */
export function addLog(
  week: (WorkDay | null)[] | undefined,
  weekday: number,
  hours: number,
  category: TimeCategory,
  note: string
): (WorkDay | null)[] {
  const days = Array.from({ length: WORK_DAYS }, (_, i) => week?.[i] ?? null)
  const had = days[weekday]
  days[weekday] = had
    ? [had[0] + hours, had[1], had[2]]
    : [hours, category, note]
  return days
}

/** What Export downloads: the source split per period, the stages, and the week on screen */
export function statsCsv(
  range: string,
  weekOf: string,
  weeks: RepWeek[]
): string {
  return toCsv([
    ["Quick Stats", range],
    [],
    ["Period", "Source", "Sales", "Average", "Value", "Share"],
    ...SOURCE_PERIODS.flatMap((p) =>
      PIPELINE_BY_SOURCE[p].rows.map((r) => [
        p,
        r.source,
        r.deals,
        r.avg,
        r.value,
        `${r.share}%`,
      ])
    ),
    [],
    ["Stage", "Open deals"],
    ...OPEN_BY_STAGE.map((s) => [s.stage, s.deals]),
    [],
    [
      "Person",
      "Title",
      ...Array.from({ length: 7 }, (_, i) => addDays(weekOf, i)),
      "Total",
      "Of target",
    ],
    ...weeks.map((w) => [
      w.rep.name,
      w.rep.title,
      ...w.days.map((d) => (d.hours === null ? d.label : hoursLabel(d.hours))),
      hoursLabel(w.total),
      `${w.percent}%`,
    ]),
  ])
}
