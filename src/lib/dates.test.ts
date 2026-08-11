import { describe, expect, it } from "vitest"

import {
  addBusinessDays,
  addDays,
  dayAt,
  daysBetween,
  formatDay,
  formatSpan,
  isoDate,
  localDate,
} from "./dates"

describe("dates", () => {
  it("reads and writes ISO days in local time", () => {
    expect(localDate("2026-07-14").getDate()).toBe(14)
    expect(localDate("2026-07-14").getHours()).toBe(0)
    expect(isoDate(new Date(2026, 6, 4, 23, 59))).toBe("2026-07-04")
    expect(dayAt("2026-07-14", 13.5).getHours()).toBe(13)
    expect(dayAt("2026-07-14", 13.5).getMinutes()).toBe(30)
  })

  it("walks days and counts them", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01")
    expect(addDays("2026-07-01", -1)).toBe("2026-06-30")
    expect(daysBetween("2026-07-06", "2026-07-14")).toBe(8)
    expect(daysBetween("2026-07-14", "2026-07-06")).toBe(-8)
  })

  it("formats the season's way", () => {
    expect(formatDay("2026-07-09")).toBe("Jul 9")
    expect(formatDay("2026-07-15", true)).toBe("Wed, Jul 15")
  })

  it("counts business days, skipping the weekend", () => {
    // Mon 8:40 am + 1 → Tue 8:40 am; Fri 2 pm + 1 → Mon 2 pm; Thu + 3 → Tue
    expect(addBusinessDays(dayAt("2026-07-13", 8 + 40 / 60), 1)).toEqual(
      dayAt("2026-07-14", 8 + 40 / 60)
    )
    expect(addBusinessDays(dayAt("2026-07-10", 14), 1)).toEqual(
      dayAt("2026-07-13", 14)
    )
    expect(addBusinessDays(dayAt("2026-07-09", 11), 3)).toEqual(
      dayAt("2026-07-14", 11)
    )
    expect(addBusinessDays(dayAt("2026-07-09", 11), 7)).toEqual(
      dayAt("2026-07-20", 11)
    )
    // A Saturday request starts Monday at 9
    expect(addBusinessDays(dayAt("2026-07-11", 16), 1)).toEqual(
      dayAt("2026-07-14", 9)
    )
  })

  it("says a span the way a queue does", () => {
    expect(formatSpan(36 * 60_000)).toBe("36m")
    expect(formatSpan(82 * 60_000)).toBe("1h 22m")
    expect(formatSpan(2 * 3_600_000)).toBe("2h")
    expect(formatSpan(52 * 3_600_000)).toBe("2d 4h")
    expect(formatSpan(-90 * 60_000)).toBe("1h 30m")
  })

  it("finds the Sunday the next client file lands", async () => {
    const { nextSunday } = await import("./dates")
    expect(nextSunday("2026-07-12")).toBe("2026-07-19")
    expect(nextSunday("2026-07-14")).toBe("2026-07-19")
    expect(nextSunday("2026-07-18")).toBe("2026-07-19")
  })
})
