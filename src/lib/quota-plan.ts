// Home → Quota Plan: checking an edited field, counting what's unsaved against the saved plan, the row actions,
// the filters and the Export CSV.

import {
  NEW_PLAN_ROW,
  type PlanRisk,
  type PlanRow,
  type PlanStatus,
} from "@/data/quota-plan"
import { toCsv } from "@/lib/csv"

export type PlanField = "rep" | "quota" | "startsIn" | "confidence"

/** Parses an edited field, or says what's wrong */
export function parseField(
  field: PlanField,
  raw: string
): { value: string | number } | { error: string } {
  if (field === "rep")
    return raw.trim() ? { value: raw.trim() } : { error: "Enter a name." }
  const n = Number(raw.replace(/[$,%d\s]/g, ""))
  if (!raw.trim() || !Number.isFinite(n) || n < 0)
    return { error: "Enter a valid number." }
  if (field === "confidence" && n > 100)
    return { error: "Use a value between 0 and 100." }
  return { value: Math.round(n) }
}

/** The confidence bar: how many of its five segments fill, and their hue */
export function confidenceBar(percent: number) {
  return {
    filled: Math.ceil(percent / 20),
    hue:
      percent >= 80
        ? "bg-emerald-500"
        : percent >= 60
          ? "bg-amber-500"
          : "bg-rose-500",
  }
}

const same = (a: PlanRow, b: PlanRow) =>
  (Object.keys(a) as (keyof PlanRow)[]).every((k) => a[k] === b[k])

/** Rows changed, added or removed since the last save */
export function unsavedCount(saved: PlanRow[], rows: PlanRow[]) {
  const before = new Map(saved.map((r) => [r.id, r]))
  const now = new Set(rows.map((r) => r.id))
  const changed = rows.filter(
    (r) => !before.has(r.id) || !same(before.get(r.id)!, r)
  ).length
  const removed = saved.filter((r) => !now.has(r.id)).length
  return changed + removed
}

/** Whether a row differs from its saved version (a new row always does) */
export const isDirty = (saved: PlanRow[], row: PlanRow) => {
  const was = saved.find((r) => r.id === row.id)
  return !was || !same(was, row)
}

export const unsavedLabel = (n: number) =>
  n ? `${n} unsaved ${n === 1 ? "change" : "changes"}` : "All changes saved"

/** Duplicate: the same plan as "<rep> Copy", right under it */
export function duplicateRow(
  rows: PlanRow[],
  id: string,
  newId: string
): PlanRow[] {
  const i = rows.findIndex((r) => r.id === id)
  const r = rows[i]
  if (!r) return rows
  return [
    ...rows.slice(0, i + 1),
    { ...r, id: newId, rep: `${r.rep} Copy`, code: `${r.code}-C` },
    ...rows.slice(i + 1),
  ]
}

export const newRow = (id: string): PlanRow => ({ id, ...NEW_PLAN_ROW })

/** The search (rep, code or owner) and the two filters */
export function filterRows(
  rows: PlanRow[],
  query: string,
  statuses: PlanStatus[],
  risks: PlanRisk[]
) {
  const q = query.trim().toLowerCase()
  return rows.filter(
    (r) =>
      (!q ||
        [r.rep, r.code, r.owner].some((s) => s.toLowerCase().includes(q))) &&
      (!statuses.length || statuses.includes(r.status)) &&
      (!risks.length || risks.includes(r.risk))
  )
}

/** What Export downloads: the plan as it stands on screen */
export function planCsv(rows: PlanRow[]): string {
  return toCsv([
    [
      "Rep",
      "Code",
      "Owner",
      "Quota",
      "Starts in (days)",
      "Confidence",
      "Status",
      "Risk",
      "Signed off",
    ],
    ...rows.map((r) => [
      r.rep,
      r.code,
      r.owner,
      r.quota,
      r.startsIn,
      `${r.confidence}%`,
      r.status,
      r.risk,
      r.signedOff ? "Yes" : "No",
    ]),
  ])
}
