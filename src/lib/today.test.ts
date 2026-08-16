import { describe, expect, it } from "vitest"

import { meetingErrors, scheduledLine } from "./today"

describe("meetingErrors", () => {
  it("asks for the name, date and start time", () => {
    expect(meetingErrors({ title: " ", date: "", start: "" })).toEqual({
      title: "Enter a meeting name",
      date: "Enter a date",
      start: "Enter a start time",
    })
    expect(
      meetingErrors({
        title: "Intro",
        date: "Jul 19, 2026",
        start: "3:00 PM ET",
      })
    ).toEqual({})
  })
})

describe("scheduledLine", () => {
  it("says the type, the length and how many are coming", () => {
    expect(
      scheduledLine({
        type: "Discovery",
        duration: "30 min",
        attendees: ["a", "b"],
      })
    ).toBe("Discovery · 30 min · 2 attendees")
    expect(
      scheduledLine({ type: "Renewal", duration: "1 hour", attendees: ["a"] })
    ).toBe("Renewal · 1 hour · 1 attendee")
  })
})
