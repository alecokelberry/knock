import { describe, expect, it } from "vitest"

import { ACTIVITIES } from "@/data/activities"

import {
  ALL_OWNERS,
  emptyDescription,
  filterActivities,
  foldDay,
  groupActivities,
  inViewLabel,
  loggedActivity,
  loggedDescription,
  settleTimeline,
  statusVariant,
  type TimelineView,
} from "./activities"

describe("activities", () => {
  it("counts each tab", () => {
    const n = (tab: Parameters<typeof filterActivities>[1]) =>
      filterActivities(ACTIVITIES, tab, ALL_OWNERS).length
    expect([
      n("All"),
      n("Doors"),
      n("Callbacks"),
      n("Texts"),
      n("Services"),
      n("Notes"),
    ]).toEqual([16, 4, 3, 2, 4, 3])
  })

  it("counts each owner", () => {
    const n = (owner: string) =>
      filterActivities(ACTIVITIES, "All", owner).length
    expect([
      n("darnell-brooks"),
      n("meera-iyer"),
      n("ayesha-malik"),
      n("kyle-bennett"),
      n("grant-lowell"),
      n("kirsten-vogt"),
    ]).toEqual([3, 3, 2, 2, 1, 0])
    expect(filterActivities(ACTIVITIES, "Texts", "meera-iyer")).toEqual([])
    expect(
      filterActivities(ACTIVITIES, "Doors", "meera-iyer").map((a) => a.title)
    ).toEqual(["Agreement signed"])
  })

  it("groups by day, skipping empty groups", () => {
    expect(
      groupActivities(ACTIVITIES).map((g) => [g.group, g.items.length])
    ).toEqual([
      ["Today", 4],
      ["Yesterday", 4],
      ["This week", 5],
      ["Earlier", 3],
    ])
    expect(
      groupActivities(filterActivities(ACTIVITIES, "Texts", ALL_OWNERS)).map(
        (g) => g.group
      )
    ).toEqual(["Today", "This week"])
  })

  it("words the counts, the empty state and the toast", () => {
    expect([inViewLabel(1), inViewLabel(16)]).toEqual([
      "1 activity in view.",
      "16 activities in view.",
    ])
    expect(emptyDescription("Notes")).toBe(
      "No note activity logged for this filter. Knocks, callbacks and services land here as the reps work their territories."
    )
    expect(emptyDescription("Services")).toContain("No service activity")
    expect(loggedDescription("Knock", "Pitched", "Darnell Brooks")).toBe(
      "Knock · Pitched · Darnell Brooks"
    )
  })

  it("tones a badge by its dot", () => {
    expect([
      statusVariant("bg-success"),
      statusVariant("bg-warning"),
      statusVariant("bg-primary"),
      statusVariant("bg-muted-foreground/60"),
    ]).toEqual(["success-light", "warning-light", "primary-light", "secondary"])
  })
})

describe("the timeline's open details", () => {
  const groups = (
    tab: Parameters<typeof filterActivities>[1],
    owner = ALL_OWNERS
  ) => groupActivities(filterActivities(ACTIVITIES, tab, owner))
  const openIds = (v: TimelineView) =>
    ACTIVITIES.filter((a) => v.open[a.id]).map((a) => a.id)
  const load = () => settleTimeline(null, groups("All"))

  it("opens the first two on load", () => {
    expect(openIds(load())).toEqual(["ACT-2841", "ACT-2840"])
  })

  it("keeps what stayed on screen and opens the new up to two", () => {
    expect(openIds(settleTimeline(load(), groups("Callbacks")))).toEqual([
      "ACT-2841",
      "ACT-2835",
    ])
    expect(openIds(settleTimeline(load(), groups("Texts")))).toEqual([
      "ACT-2840",
      "ACT-2831",
    ])
    expect(
      openIds(settleTimeline(load(), groups("All", "darnell-brooks")))
    ).toEqual(["ACT-2841", "ACT-2836"])
    // Doors keeps Yesterday's and This week's shape (foldable before and after), so their shut details stay shut
    expect(openIds(settleTimeline(load(), groups("Doors")))).toEqual([])
  })

  it("forgets a folded day's details and opens it afresh", () => {
    const all = groups("All")
    let v = load()
    v = { ...v, open: { ...v.open, "ACT-2841": false, "ACT-2832": true } }
    v = foldDay(v, all, "Today", true)
    expect(v.folded).toEqual(["Today"])
    expect(openIds(v)).toEqual(["ACT-2832"])
    expect(openIds(foldDay(v, all, "Today", false))).toEqual([
      "ACT-2841",
      "ACT-2840",
      "ACT-2832",
    ])
  })

  it("keeps a fold while the day keeps its shape", () => {
    const v = foldDay(load(), groups("All"), "Yesterday", true)
    expect(settleTimeline(v, groups("Doors")).folded).toEqual(["Yesterday"])
    expect(settleTimeline(v, groups("Callbacks")).folded).toEqual([])
  })
})

describe("logging an activity", () => {
  it("lands as a timeline item with the next reference", () => {
    const a = loggedActivity(
      ACTIVITIES,
      {
        type: "Knock",
        summary: " Pitched and priced ",
        notes: "",
        outcome: "Pitched",
        ownerId: "darnell-brooks",
        ownerRole: "Team Leader",
        household: "Brent Kowal",
        address: "688 N Cottonwood Bench Rd",
        when: "Today",
        time: "",
      },
      new Date(2026, 6, 16, 18, 5)
    )
    expect(a).toMatchObject({
      id: "ACT-2842",
      group: "Today",
      kind: "Doors",
      icon: "door-open",
      title: "Pitched and priced",
      status: "Pitched",
      dot: "bg-success",
      household: "Brent Kowal",
      address: "688 N Cottonwood Bench Rd",
      time: "6:05 PM",
      text: "Pitched and priced",
    })
  })
})
