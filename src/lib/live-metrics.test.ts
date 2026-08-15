import { describe, expect, it } from "vitest"

import {
  nextReading,
  SPARK_POINTS,
  seeded,
  seedReadings,
  sparkline,
} from "./live-metrics"

describe("nextReading", () => {
  it("stays inside the range, to one decimal", () => {
    expect(nextReading(19.9, { min: 1, max: 20 }, () => 1)).toBe(20)
    expect(nextReading(1.2, { min: 1, max: 20 }, () => 0)).toBe(1)
    expect(nextReading(10, { min: 1, max: 20 }, () => 0.5)).toBe(10)
  })
})

describe("seedReadings", () => {
  it("gives twenty readings ending at the start value", () => {
    const r = seedReadings(17.3, { min: 1, max: 20 }, () => 0.3)
    expect(r).toHaveLength(SPARK_POINTS)
    expect(r.at(-1)).toBe(17.3)
  })
})

describe("sparkline", () => {
  it("joins every reading with a level-leaving curve and closes the area at the foot", () => {
    const { line, area } = sparkline([1, 3, 2], 48, 20)
    expect(line.startsWith("M 0 19")).toBe(true)
    expect(line.match(/ C /g)).toHaveLength(2)
    expect(line).toContain("C 12 19, 12 1, 24 1")
    expect(area.endsWith("L 48 20 L 0 20 Z")).toBe(true)
  })
})

describe("seeded", () => {
  it("repeats for the same seed and stays in [0, 1)", () => {
    const a = seeded(7),
      b = seeded(7)
    const xs = Array.from({ length: 5 }, () => a())
    expect(xs).toEqual(Array.from({ length: 5 }, () => b()))
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true)
  })
})
