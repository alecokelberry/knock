import { describe, expect, it } from "vitest"

import { SEASON_BY_REP } from "@/data/season"
import { memberName, SELLER_IDS, TEAM_PERFORMANCE } from "@/data/team"

import { dashboardCsv } from "./dashboard"

describe("dashboardCsv", () => {
  it("exports the team table with every rep", () => {
    const csv = dashboardCsv("Jun 16 to Jul 16, 2026")
    expect(csv.startsWith('Dashboard,"Jun 16 to Jul 16, 2026"\r\n')).toBe(true)
    for (const id of SELLER_IDS) expect(csv).toContain(memberName(id))
    expect(csv).toContain(
      "Darnell Brooks,Team Leader · Boise,66%,Ahead of pace,36%,17,Stable"
    )
  })

  it("rates each rep from the season's numbers", () => {
    for (const r of TEAM_PERFORMANCE) {
      const s = SEASON_BY_REP[r.memberId]!
      expect(r.quota, r.memberId).toBe(Math.round((s.serviced / s.quota) * 100))
      expect(r.closeRate, r.memberId).toBe(
        `${Math.round((s.sold / s.pitches) * 100)}%`
      )
      expect(r.pending, r.memberId).toBe(s.pending)
      expect(s.sold, r.memberId).toBe(s.cancelled + s.serviced + s.pending)
    }
  })
})
