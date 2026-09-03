import { describe, expect, it } from "vitest"

import { QUOTA_PLAN } from "@/data/quota-plan"

import {
  confidenceBar,
  duplicateRow,
  filterRows,
  newRow,
  parseField,
  planCsv,
  unsavedCount,
  unsavedLabel,
} from "./quota-plan"

describe("quota plan", () => {
  it("checks edited fields", () => {
    expect(parseField("quota", "150000")).toEqual({ value: 150_000 })
    expect(parseField("quota", "abc")).toEqual({
      error: "Enter a valid number.",
    })
    expect(parseField("confidence", "150")).toEqual({
      error: "Use a value between 0 and 100.",
    })
    expect(parseField("startsIn", "3")).toEqual({ value: 3 })
    expect(parseField("rep", "  ")).toEqual({ error: "Enter a name." })
  })

  it("fills the confidence bar", () => {
    expect([82, 79, 64, 48, 55].map((p) => confidenceBar(p).filled)).toEqual([
      5, 4, 4, 3, 3,
    ])
    expect([82, 64, 48].map((p) => confidenceBar(p).hue)).toEqual([
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
    ])
  })

  it("counts unsaved changes against the saved plan", () => {
    const toggled = QUOTA_PLAN.map((r) =>
      r.rep === "Kirsten Vogt" || r.rep === "Meera Iyer"
        ? { ...r, signedOff: !r.signedOff }
        : r
    )
    expect(unsavedLabel(unsavedCount(QUOTA_PLAN, toggled))).toBe(
      "2 unsaved changes"
    )
    expect(unsavedLabel(unsavedCount(QUOTA_PLAN, QUOTA_PLAN))).toBe(
      "All changes saved"
    )
    expect(unsavedCount(QUOTA_PLAN, QUOTA_PLAN.slice(1))).toBe(1)
    expect(unsavedCount(QUOTA_PLAN, [newRow("n1"), ...QUOTA_PLAN])).toBe(1)
  })

  it("duplicates under the row, and filters", () => {
    const rows = duplicateRow(QUOTA_PLAN, "plan-s27-kirsten", "copy")
    expect(rows[4]).toMatchObject({
      rep: "Kirsten Vogt Copy",
      code: "S27-KV-C",
      quota: 260,
    })
    expect(filterRows(QUOTA_PLAN, "vogt", [], []).map((r) => r.rep)).toEqual([
      "Kirsten Vogt",
    ])
    expect(filterRows(QUOTA_PLAN, "", ["Draft"], []).map((r) => r.rep)).toEqual(
      ["Toby Marsh", "Haruka Mori", "Meera Iyer"]
    )
    expect(
      filterRows(QUOTA_PLAN, "", [], ["High", "Low"]).map((r) => r.rep)
    ).toEqual(["Darnell Brooks", "Ayesha Malik", "Sam Okafor", "Kyle Bennett"])
    expect(planCsv(QUOTA_PLAN)).toContain(
      "Darnell Brooks,S27-DB,Tessa Calloway,340,291,92%,Active,Low,Yes"
    )
  })
})
