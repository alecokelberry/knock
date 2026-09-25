import { describe, expect, it } from "vitest"

import { FORECAST_BOOKS } from "@/data/forecast"
import { ADVANCES, GATE_ROWS, GATES } from "@/data/reports"
import { SEASON } from "@/data/season"
import { MARKETS, TEAM_BY_ID } from "@/data/team"

import {
  advances,
  attentionCsv,
  attentionMatches,
  attentionRows,
  breakdownRows,
  dueLine,
  reportKpis,
  servicedValueWeeks,
  stageOf,
} from "./reports"

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

describe("the season's reports", () => {
  it("reconciles every office's gates with its reps' season", () => {
    for (const office of MARKETS) {
      const reps = SEASON.filter(
        (r) => TEAM_BY_ID[r.memberId]?.market === office
      )
      const total = (
        k: "doors" | "pitches" | "sold" | "cancelled" | "serviced"
      ) => sum(reps.map((r) => r[k]))
      const gate = (g: string) =>
        GATE_ROWS.find((r) => r.office === office && r.gate === g)!
      expect(gate("Pitched").entered, office).toBe(total("doors"))
      expect(gate("Pitched").advanced, office).toBe(total("pitches"))
      expect(gate("Sold").entered, office).toBe(total("pitches"))
      expect(gate("Sold").advanced, office).toBe(total("sold"))
      expect(gate("Scheduled").lost, office).toBe(total("cancelled"))
      expect(gate("Serviced").advanced, office).toBe(total("serviced"))
      const window = FORECAST_BOOKS.filter(
        (b) => b.office === office && b.stage === "Sold"
      )
      expect(gate("Scheduled").stalled, office).toBe(
        sum(window.map((b) => b.accounts))
      )
    }
    for (const r of GATE_ROWS)
      expect(r.advanced + r.stalled + r.lost, `${r.office} ${r.gate}`).toBe(
        r.entered
      )
  })

  it("advances the season's households gate by gate, as the offices add up", () => {
    for (const g of GATES)
      expect(ADVANCES.Season[g], g).toBe(
        sum(GATE_ROWS.filter((r) => r.gate === g).map((r) => r.advanced))
      )
    expect(advances("7D")).toMatchObject({ total: 405 })
  })

  it("heads the Overview with the season's value, the weighted call and the close rate", () => {
    const [serviced, forecast, close] = reportKpis()
    expect(sum(servicedValueWeeks())).toBe(765_703)
    expect([serviced!.value, serviced!.sub]).toEqual([
      "$766K",
      "983 accounts serviced",
    ])
    expect(forecast!.series.at(-1)).toBe(
      FORECAST_BOOKS.reduce(
        (s, b) => s + Math.round((b.amount * b.probability) / 100),
        0
      )
    )
    expect(close!.value).toBe("32%")
  })

  it("lists the open households, biggest first, with where they stand", () => {
    const rows = attentionRows()
    expect(rows).toHaveLength(15)
    expect(rows[0]).toMatchObject({ household: "Margaret Doyle", value: 1960 })
    expect(stageOf(rows[0]!)).toEqual({ label: "Sold", progress: 67 })
    expect(dueLine(rows[0]!)).toBe("Window closes Jul 17, 2026")
    expect(rows.filter((d) => attentionMatches(d, "glen laurel"))).toHaveLength(
      2
    )
    expect(attentionCsv(rows.slice(0, 1))).toContain(
      'DEAL-401,Margaret Doyle,Boise,Darnell Brooks,Sold,Quarterly Pest + Termite Monitoring,1960,On track,"Window closes Jul 17, 2026"'
    )
  })

  it("flags the gates that lag, and names each office's owner", () => {
    const risky = breakdownRows("all")
      .filter((r) => r.risk !== "Healthy")
      .map((r) => `${r.office} ${r.gate} ${r.risk}`)
    expect(risky).toEqual([
      "Phoenix Pitched Watch",
      "Phoenix Sold Watch",
      "Phoenix Scheduled Watch",
      "Phoenix Serviced Watch",
    ])
    expect(breakdownRows("Sold")[0]).toMatchObject({
      code: "BOI-2",
      owner: "Julia Serrano",
      advancedShare: 32,
      stalledShare: 5,
      lostShare: 63,
    })
  })
})
