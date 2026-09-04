import { describe, expect, it } from "vitest"

import { CONTACT_BY_ID } from "@/data/contacts"
import { DEAL_STAGES, DEALS, isOpen } from "@/data/deals"
import { TERRITORIES } from "@/data/territories"

import {
  dateKind,
  dealCreatedLine,
  dealFromForm,
  dealMatches,
  groupByStage,
  planValue,
  probTone,
  validateDeal,
} from "./pipeline"

describe("probTone", () => {
  it("bands the odds: under 35 amber, to 54 violet, to 69 sky, then emerald", () => {
    expect(probTone(28).text).toContain("amber")
    expect(probTone(34).text).toContain("amber")
    expect(probTone(35).text).toContain("violet")
    expect(probTone(54).text).toContain("violet")
    expect(probTone(55).text).toContain("sky")
    expect(probTone(69).text).toContain("sky")
    expect(probTone(70).text).toContain("emerald")
    expect(probTone(84).bar).toContain("emerald")
  })
  it("agrees with the band recorded for every household", () => {
    for (const d of DEALS)
      expect(probTone(d.winProbability).band, d.household).toBe(d.probTone)
  })
})

describe("the board's households", () => {
  it("keeps every stage, in order, three to each", () => {
    const cols = groupByStage(DEALS)
    expect(Object.keys(cols)).toEqual(DEAL_STAGES.map((s) => s.id))
    expect(DEAL_STAGES.map((s) => cols[s.id].length)).toEqual([
      3, 3, 3, 3, 3, 3,
    ])
  })

  it("prices each from its plans' first-year contract value", () => {
    for (const d of DEALS)
      expect(d.value, d.household).toBe(planValue(d.plan!, d.addOn))
    expect(planValue("Quarterly Pest", "Mosquito Season")).toBe(1039)
  })

  it("runs each through a homeowner in the same territory", () => {
    for (const d of DEALS) {
      const c = CONTACT_BY_ID[d.contactId!]!
      expect([c.name, c.territoryId, c.ownerId]).toEqual([
        d.household,
        d.territoryId,
        d.ownerId,
      ])
      expect(TERRITORIES.find((t) => t.id === d.territoryId)?.office).toBe(
        d.office
      )
    }
  })

  it("counts a household open until it's serviced", () => {
    expect(DEALS.filter(isOpen)).toHaveLength(15)
    expect(dateKind("callback")).toBe("Callback")
    expect(dateKind("scheduled")).toBe("First service")
  })
})

describe("validateDeal", () => {
  const ok = { household: "A", address: "1 Main St", date: "Jul 20, 2026" }
  it("accepts a complete form", () => expect(validateDeal(ok)).toEqual({}))
  it("asks for each empty field", () => {
    expect(validateDeal({ household: " ", address: "", date: "" })).toEqual({
      household: "Enter the homeowner's name",
      address: "Enter the address",
      date: "Enter a date",
    })
  })
})

describe("a new household on the board", () => {
  const form = {
    household: "Rosa Delgado",
    address: "3377 W Desert Willow Ln",
    date: "Jul 20, 2026",
    type: "New" as const,
    stage: "pitched" as const,
    plan: "Quarterly Pest" as const,
    addOn: "Mosquito Season" as const,
    win: "62",
    owner: "sam-okafor",
    status: "Working" as const,
    office: "Phoenix" as const,
  }

  it("prints the toast's line", () =>
    expect(dealCreatedLine("Pitched", "Working", 1039, "62")).toBe(
      "Pitched · Working · $1,039 · 62%"
    ))

  it("lands in the rep's territory, priced from its plans", () => {
    expect(dealFromForm("n1", form)).toMatchObject({
      territoryId: "desert-willow",
      office: "Phoenix",
      value: 1039,
      valueLabel: "$1,039",
      probTone: "text-sky-600",
      dateLabel: "Jul 20, 2026",
    })
    expect(
      dealFromForm("n2", { ...form, owner: "haruka-mori", addOn: undefined })
    ).toMatchObject({ territoryId: "palo-verde-estates", value: 625 })
  })

  it("filters by status and office", () => {
    const d = DEALS[0]!
    expect([
      dealMatches(d, [], []),
      dealMatches(d, [d.status], []),
      dealMatches(d, ["Committed"], []),
      dealMatches(d, [], [d.office]),
      dealMatches(d, [], ["Raleigh"]),
    ]).toEqual([true, true, false, true, false])
  })
})
