import { describe, expect, it } from "vitest"

import { FORECAST_BOOKS, SERVICED_TO_DATE } from "@/data/forecast"
import { SEASON } from "@/data/season"

import { passesFilters } from "./filter-bar"
import {
  forecastCall,
  forecastCsv,
  forecastField,
  shortMoney,
  weighted,
} from "./forecast"

const cond = (field: string, operator: string, values: string[]) => ({
  id: field,
  field,
  operator,
  values,
})

describe("forecast", () => {
  it("splits each rep's pending accounts into scheduled and still in the window", () => {
    for (const r of SEASON) {
      const mine = FORECAST_BOOKS.filter(
        (b) => b.id.startsWith(r.memberId) && b.stage !== "Pitched"
      )
      expect(
        mine.reduce((s, b) => s + b.accounts, 0),
        r.memberId
      ).toBe(r.pending)
    }
    expect(SERVICED_TO_DATE).toBe(765_703)
  })

  it("makes the season's call from the books", () => {
    const best = forecastCall(["Commit", "Best Case"])
    expect([
      shortMoney(best.total),
      best.ofOpen,
      best.rows.map((r) => [r.accounts, r.share, r.value]),
    ]).toEqual([
      "$103K",
      45,
      [
        [92, 68, 70_649],
        [43, 32, 32_753],
      ],
    ])
    const commit = forecastCall(["Commit"])
    expect([
      shortMoney(commit.total),
      commit.ofOpen,
      commit.rows[0]!.share,
    ]).toEqual(["$70.6K", 31, 100])
    const all = forecastCall(["Commit", "Best Case", "Pipeline"])
    expect([
      shortMoney(all.total),
      all.ofOpen,
      all.rows.map((r) => r.share),
    ]).toEqual(["$229K", 100, [31, 14, 55]])
  })

  it("weights each book by its odds", () => {
    expect(FORECAST_BOOKS.map(weighted).slice(0, 3)).toEqual([
      11_174, 9159, 8173,
    ])
  })

  it("filters as the bar's operators read", () => {
    const ids = (cs: ReturnType<typeof cond>[]) =>
      FORECAST_BOOKS.filter((d) => passesFilters(d, cs, forecastField)).map(
        (d) => d.id
      )
    expect(ids([cond("book", "contains", ["kyle"])])).toHaveLength(3)
    expect(ids([cond("category", "is", ["Commit"])])).toHaveLength(9)
    expect(ids([cond("book", "contains", [])])).toHaveLength(27)
    expect(
      ids([
        cond("owner", "is", ["Ayesha Malik"]),
        cond("movement", "is", ["No change"]),
      ])
    ).toEqual(["ayesha-malik-sold"])
    expect(forecastCsv()).toContain(
      "Darnell Brooks,Boise,Scheduled,Commit,12,9744,9159,94%,2026-07-17,Pulled in"
    )
  })
})
