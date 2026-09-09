import { describe, expect, it } from "vitest"

import { type FilterBarRule, filtersActive, passesFilters } from "./filter-bar"

const rows = [
  { name: "Fairhaven Senior Living", category: "Commit" },
  { name: "Ironvale Manufacturing", category: "Commit" },
  { name: "Alder Facilities", category: "Pipeline" },
]
const get = (r: (typeof rows)[number], f: string) =>
  f === "name" ? r.name : r.category
const rule = (
  field: string,
  operator: string,
  values: string[]
): FilterBarRule => ({ id: field + operator, field, operator, values })
const names = (rules: FilterBarRule[]) =>
  rows.filter((r) => passesFilters(r, rules, get)).map((r) => r.name)

describe("filter bar", () => {
  it("reads text and select operators", () => {
    expect(names([rule("name", "contains", ["senior"])])).toEqual([
      "Fairhaven Senior Living",
    ])
    expect(names([rule("name", "not_contains", ["senior"])])).toHaveLength(2)
    expect(names([rule("name", "starts_with", ["alder"])])).toEqual([
      "Alder Facilities",
    ])
    expect(names([rule("category", "is", ["Commit"])])).toHaveLength(2)
    expect(names([rule("category", "is_not", ["Commit", "Pipeline"])])).toEqual(
      []
    )
    expect(names([rule("name", "contains", [""])])).toHaveLength(3)
    expect(names([rule("category", "not_empty", [])])).toHaveLength(3)
    expect(names([rule("category", "is_any_of", ["Pipeline"])])).toEqual([
      "Alder Facilities",
    ])
  })

  it("knows when the bar narrows anything", () => {
    expect(filtersActive([rule("name", "contains", [""])])).toBe(false)
    expect(filtersActive([rule("name", "contains", ["a"])])).toBe(true)
    expect(filtersActive([rule("name", "empty", [])])).toBe(true)
  })
})
