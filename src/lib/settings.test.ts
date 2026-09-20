import { describe, expect, it } from "vitest"

import { WORKSPACE_SETTINGS } from "@/data/workspace"

import {
  brandPosture,
  isEmail,
  subdomainOf,
  verifiedDomain,
  workspaceErrors,
} from "./settings"

describe("settings (general)", () => {
  it("summarises the saved workspace", () => {
    expect(verifiedDomain(WORKSPACE_SETTINGS.subdomain)).toBe(
      "vantage.knock.example"
    )
    expect(brandPosture(WORKSPACE_SETTINGS.accent)).toBe("Teal accent")
    expect(brandPosture("cobalt")).toBe("Cobalt accent")
  })
  it("checks the form", () => {
    expect(workspaceErrors(WORKSPACE_SETTINGS)).toEqual({})
    expect(
      workspaceErrors({ name: " ", subdomain: "", supportEmail: "nope" })
    ).toEqual({
      name: "Enter a workspace name",
      subdomain: "Enter a workspace URL",
      supportEmail: "Enter a valid email address",
    })
  })
  it("keeps the workspace URL to what a subdomain can hold", () => {
    expect(subdomainOf("Bad Sub!")).toBe("badsub")
    expect(subdomainOf("vantage-2")).toBe("vantage-2")
    expect(isEmail("office@vantage.example")).toBe(true)
    expect(isEmail("office@vantage")).toBe(false)
  })
})
