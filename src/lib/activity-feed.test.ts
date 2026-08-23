import { describe, expect, it } from "vitest"

import { followUpError, followUpLine } from "./activity-feed"

describe("follow-up", () => {
  it("asks for the next step", () => {
    expect(followUpError("  ")).toBe("Enter a next step")
    expect(followUpError("Send the order form")).toBeNull()
  })
  it("says when, who and whether they'll be reminded", () => {
    expect(followUpLine("Tomorrow", "Julia Serrano", true)).toBe(
      "Tomorrow · Julia Serrano · reminder on"
    )
    expect(followUpLine("Next week", "Darnell Brooks", false)).toBe(
      "Next week · Darnell Brooks · reminder off"
    )
  })
})
