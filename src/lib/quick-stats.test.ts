import { describe, expect, it } from "vitest"

import { TIME_REPS, WORKLOGS } from "@/data/quick-stats"

import {
  addLog,
  clientBand,
  hoursLabel,
  logErrors,
  logLine,
  mondayOf,
  parseLogDate,
  repWeek,
  statsCsv,
  trackedBand,
  weekLabel,
} from "./quick-stats"

const rep = (name: string) => TIME_REPS.find((r) => r.name === name)!
const week = (name: string, monday = "2026-07-13") =>
  repWeek(rep(name), monday, WORKLOGS[monday]?.[name])

describe("quick stats", () => {
  it("writes hours and weeks", () => {
    expect([
      hoursLabel(6),
      hoursLabel(5.5),
      hoursLabel(0.75),
      hoursLabel(0),
    ]).toEqual(["6h", "5h 30m", "45m", "0h"])
    expect(weekLabel("2026-07-13")).toBe("Jul 13 - 19")
    expect(weekLabel("2026-06-29")).toBe("Jun 29 - Jul 5")
    expect(mondayOf("2026-09-08")).toBe("2026-09-07")
    expect(mondayOf("2026-07-19")).toBe("2026-07-13")
  })

  it("totals a week against the person's target", () => {
    const w = week("Julia Serrano")
    // Today is Thursday: Thursday to Saturday are still open, Sunday is off
    expect([hoursLabel(w.total), w.percent]).toEqual(["20h 30m", 51])
    expect(w.days.map((d) => d.label)).toEqual([
      "Training",
      "Doors",
      "Office",
      "Open",
      "Open",
      "Open",
      "Off",
    ])
    expect(week("Darnell Brooks", "2026-06-29").days[5]).toMatchObject({
      hours: null,
      label: "Off",
      note: "Independence Day: no doors.",
    })
    const empty = week("Darnell Brooks", "2026-06-22")
    expect([empty.total, empty.percent]).toEqual([0, 0])
  })

  it("bands tracked and door time for the filters", () => {
    const last = (name: string) => week(name, "2026-07-06")
    expect(
      TIME_REPS.filter(
        (r) => trackedBand(last(r.name).percent) === "Under target"
      ).map((r) => r.name)
    ).toEqual(["Kirsten Vogt", "Haruka Mori"])
    expect(
      TIME_REPS.filter((r) => clientBand(last(r.name)) === "Mixed").map(
        (r) => r.name
      )
    ).toEqual(["Julia Serrano", "Rafael Lima", "Mateo Alvarez"])
    expect(
      TIME_REPS.filter((r) => clientBand(last(r.name)) === "Off the doors").map(
        (r) => r.name
      )
    ).toEqual([])
  })

  it("checks New log and adds it to the day", () => {
    expect(logErrors("", "")).toEqual({
      date: "Enter a date",
      hours: "Enter the hours",
    })
    expect(logErrors("Jul 14, 2026", "abc")).toEqual({
      hours: "Enter hours greater than 0",
    })
    expect(logErrors("Jul 14, 2026", "2")).toEqual({})
    expect(parseLogDate("Jul 14, 2026")).toBe("2026-07-14")
    expect(parseLogDate("tomorrow")).toBeNull()
    expect(logLine("Kyle Bennett", 6.5, "Doors", "Riverbend")).toBe(
      "Kyle Bennett · 6.5h · Doors · Riverbend"
    )
    expect(
      addLog(WORKLOGS["2026-07-13"]!["Julia Serrano"], 1, 2, "Office", "x")[1]
    ).toEqual([9, "Doors", "Area drops and knocking in Riverbend"])
    expect(addLog(undefined, 5, 6, "Doors", "Saturday blitz")[5]).toEqual([
      6,
      "Doors",
      "Saturday blitz",
    ])
  })

  it("exports the week on screen", () => {
    const csv = statsCsv("This week", "2026-07-13", [week("Julia Serrano")])
    expect(csv.startsWith("Quick Stats,This week\r\n")).toBe(true)
    expect(csv).toContain(
      "Julia Serrano,Sales manager,7h,7h,6h 30m,Open,Open,Open,Off,20h 30m,51%"
    )
  })
})
