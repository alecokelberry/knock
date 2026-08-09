import { describe, expect, it } from "vitest"

import { appOf, NAV, sectionFor } from "./nav"

describe("appOf", () => {
  it("finds the app that lists a page, or the one its path sits under", () => {
    expect(appOf("/")).toBe("home")
    expect(appOf("/pipeline")).toBe("sales")
    expect(appOf("/quotes/new")).toBe("sales")
    expect(appOf("/contacts/14")).toBe("contacts")
    expect(appOf("/contacts?lifecycle=Lead")).toBe("contacts")
    expect(appOf("/account/profile")).toBe("settings")
    expect(appOf("/reports/conversion")).toBe("reports")
    expect(appOf("/nowhere")).toBe("home")
  })
})

describe("NAV", () => {
  it("gives every app a page, and every group one", () => {
    expect(
      NAV.every(
        (s) => s.pages.length > 0 && s.groups.every((g) => g.pages.length > 0)
      )
    ).toBe(true)
    expect(sectionFor("/").app).toBe("home")
  })
})
