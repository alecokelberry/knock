import { describe, expect, it } from "vitest"

import { TEAM_MEMBERS } from "@/data/team"

import {
  addMembers,
  filterCount,
  inviteCountLine,
  matchesFilters,
  matchesSearch,
  NO_FILTERS,
  nameFromEmail,
  newMember,
  parseMemberCsv,
  splitEmails,
} from "./team"

const names = (ms: { name: string }[]) => ms.map((m) => m.name)

describe("team", () => {
  it("searches every column", () => {
    expect(
      names(TEAM_MEMBERS.filter((m) => matchesSearch(m, "rookie")))
    ).toEqual([])
    expect(
      names(TEAM_MEMBERS.filter((m) => matchesSearch(m, "team leader")))
    ).toEqual(["Darnell Brooks", "Ayesha Malik", "Sam Okafor"])
    expect(TEAM_MEMBERS.filter((m) => matchesSearch(m, "sso")).length).toBe(7)
    expect(TEAM_MEMBERS.filter((m) => matchesSearch(m, "zzz"))).toEqual([])
  })
  it("filters by role, billing and auth", () => {
    const reps = TEAM_MEMBERS.filter((m) =>
      matchesFilters(m, { ...NO_FILTERS, role: ["Sales Rep"] })
    )
    expect(names(reps)).toEqual([
      "Kirsten Vogt",
      "Kyle Bennett",
      "Toby Marsh",
      "Meera Iyer",
      "Haruka Mori",
      "Owen Fletcher",
    ])
    expect(
      names(
        TEAM_MEMBERS.filter((m) =>
          matchesFilters(m, {
            role: ["Sales Rep"],
            billing: ["Active"],
            auth: [],
          })
        )
      )
    ).toEqual(["Kirsten Vogt", "Toby Marsh", "Meera Iyer", "Haruka Mori"])
    expect(
      filterCount({ role: ["Admin"], billing: [], auth: ["SSO", "Password"] })
    ).toBe(3)
  })
  it("turns invites into members joining today", () => {
    expect(
      splitEmails(
        "jo@vantage.example, KIM@vantage.example\nann@vantage.example"
      )
    ).toEqual([
      "jo@vantage.example",
      "kim@vantage.example",
      "ann@vantage.example",
    ])
    expect(inviteCountLine(1)).toBe("1 person will be invited")
    expect(inviteCountLine(3)).toBe("3 people will be invited")
    expect(nameFromEmail("jo.baker@vantage.example")).toBe("Jo Baker")
    const m = newMember(
      "jo.baker@vantage.example",
      "Payroll",
      "Password",
      "2026-09-08"
    )
    expect(m).toMatchObject({
      name: "Jo Baker",
      username: "jo.baker",
      role: "Payroll",
      authentication: "Password",
      billingStatus: "Pending invoice",
      joined: "Sep 08, 2026",
      market: null,
    })
    const { team, added } = addMembers(TEAM_MEMBERS, [
      m,
      newMember("julia.serrano@vantage.example", "Admin", "SSO", "2026-09-08"),
      m,
    ])
    expect(added).toHaveLength(1)
    expect(team).toHaveLength(17)
  })
  it("imports members from a CSV", () => {
    const { members, skipped } = parseMemberCsv(
      "Name,Email,Role,Auth\nJo Baker,jo@vantage.example,payroll,password\n,bad,,\nKim Lee,kim@vantage.example,Wizard,",
      "2026-09-28"
    )
    expect(skipped).toBe(1)
    expect(members.map((m) => [m.name, m.role, m.authentication])).toEqual([
      ["Jo Baker", "Payroll", "Password"],
      ["Kim Lee", "Sales Rep", "SSO"],
    ])
    expect(parseMemberCsv("name\nJo", "2026-09-28")).toEqual({
      members: [],
      skipped: 1,
    })
  })
})
