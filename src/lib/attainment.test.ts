import { describe, expect, it } from "vitest"

import { ATT_SEGMENTS } from "@/data/attainment"

import {
  attFooter,
  attRows,
  cellValue,
  money,
  OPEN_WEEKS,
  planMatch,
  repFlag,
  segmentFigures,
  sortRows,
  spanLabel,
  stepSpan,
  stretchShare,
  targetError,
  weekOf,
  weekStart,
} from "./attainment"

const rep = (name: string) =>
  ATT_SEGMENTS.flatMap((s) => s.reps).find((r) => r.name === name)!

describe("attainment", () => {
  it("writes counts and gaps", () => {
    expect([money(1_075), money(-12), money(0)]).toEqual(["1,075", "(12)", "0"])
    const boise = segmentFigures(ATT_SEGMENTS[0]!)
    expect(cellValue(boise, 0, "Serviced").value).toBe(12)
    expect(cellValue(boise, 9, "Gap")).toEqual({ value: 4, share: 9 })
  })

  it("adds the offices up to the season's serviced accounts", () => {
    const total = attFooter("Serviced", "all").total
    expect(total).toEqual([32, 62, 82, 98, 105, 112, 124, 114, 124, 130])
    expect(total.reduce((a, b) => a + b, 0)).toBe(983)
  })

  it("flags each rep's biggest swing from plan", () => {
    expect(repFlag(rep("Darnell Brooks"), OPEN_WEEKS)).toMatchObject({
      variance: 22,
      status: "Favorable",
      line: "W10 landed 22% above plan.",
    })
    expect(repFlag(rep("Kyle Bennett"), { from: 0, to: 9 })).toMatchObject({
      variance: -75,
      status: "Critical",
      line: "W1 landed 75% below plan.",
    })
    expect(repFlag(rep("Kirsten Vogt"), { from: 5, to: 5 })).toMatchObject({
      variance: -7,
      status: "Stable",
      line: "W6 stayed within 7% of plan.",
    })
  })

  it("steps the weeks in view as the range buttons do, and maps picked days to weeks", () => {
    expect(spanLabel(OPEN_WEEKS)).toBe("W6 - W10")
    expect(stepSpan({ from: 0, to: 1 }, 1)).toEqual({ from: 2, to: 3 })
    expect(stepSpan({ from: 8, to: 9 }, 1)).toEqual({ from: 8, to: 9 })
    expect(stepSpan({ from: 5, to: 9 }, -1)).toEqual({ from: 0, to: 4 })
    expect(weekOf(weekStart(3))).toBe(3)
    expect(weekOf(new Date(2026, 6, 16))).toBe(9)
  })

  it("rings each office and totals the footer", () => {
    expect(
      planMatch(0, OPEN_WEEKS, segmentFigures(ATT_SEGMENTS[0]!))
    ).toMatchObject({ percent: 94, close: true, actual: 217, plan: 216 })
    expect(attFooter("Serviced", "all")).toMatchObject({
      segmentName: "Boise",
      segmentLabel: "Largest office",
    })
    expect(attFooter("Gap", "Raleigh")).toMatchObject({
      totalLabel: "Serviced vs quota",
      segmentName: "Raleigh",
      segmentLabel: "Office total",
    })
  })

  it("filters, searches and sorts the rows", () => {
    expect(
      attRows("all", "kyle").map((r) => [r.name, r.subRows?.map((s) => s.name)])
    ).toEqual([["Boise", ["Kyle Bennett"]]])
    expect(attRows("all", "Phoenix")[0]!.subRows?.map((s) => s.name)).toEqual([
      "Sam Okafor",
      "Haruka Mori",
      "Owen Fletcher",
    ])
    expect(attRows("all", "zzz")).toEqual([])
    expect(attRows("Raleigh", "").map((r) => r.name)).toEqual(["Raleigh"])
    expect(
      sortRows(attRows("all", ""), { id: "9", desc: false }, "Serviced").map(
        (r) => r.name
      )
    ).toEqual(["Phoenix", "Raleigh", "Boise"])
  })

  it("measures New target against the stretch ceiling", () => {
    expect(stretchShare("")).toMatchObject({ share: 0, band: null })
    expect(stretchShare("22")).toMatchObject({ share: 55, band: "comfortable" })
    expect(stretchShare("24")).toMatchObject({ share: 60, band: "ambitious" })
    expect(stretchShare("36")).toMatchObject({ share: 90, band: "aggressive" })
    expect(stretchShare("50").share).toBe(100)
    expect([targetError(""), targetError("abc"), targetError("22")]).toEqual([
      "Enter a number of accounts",
      "Enter a number of accounts",
      null,
    ])
  })
})
