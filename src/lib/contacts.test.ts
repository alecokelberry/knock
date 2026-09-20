import { describe, expect, it } from "vitest"

import { CONTACTS, LIFECYCLE_COUNTS, LIFECYCLES } from "@/data/contacts"
import { DEALS, isOpen } from "@/data/deals"
import { TERRITORIES, TERRITORIES_SUMMARY } from "@/data/territories"
import { passesFilters } from "@/lib/filter-bar"

import {
  addDeal,
  assignOwner,
  contactField,
  contactFromForm,
  directorySummary,
  knockedShare,
  logText,
  shortUsd,
  startingRules,
  territoryCard,
  territoryCards,
  territoryFromForm,
  validateContact,
  validateTerritory,
} from "./contacts"

describe("the directory", () => {
  it("prints each homeowner's open deal as the list does", () => {
    for (const c of CONTACTS)
      expect(c.openDeals.count ? shortUsd(c.openDeals.amount) : null).toBe(
        c.openDeals.short
      )
    expect([
      shortUsd(1039),
      shortUsd(13_822),
      shortUsd(20_000),
      shortUsd(1_250_000),
    ]).toEqual(["$1,039", "$13.8K", "$20K", "$1.3M"])
  })

  it("adds up the open pipeline from the board's households", () => {
    const open = DEALS.filter(isOpen).reduce((s, d) => s + d.value, 0)
    expect(directorySummary(CONTACTS, TERRITORIES)).toEqual({
      ...TERRITORIES_SUMMARY,
      openPipeline: open,
    })
    expect(TERRITORIES_SUMMARY).toMatchObject({
      territories: 9,
      contacts: 40,
      openPipeline: 13_822,
    })
  })

  it("counts the sidebar's lifecycles", () => {
    for (const l of LIFECYCLES)
      expect(CONTACTS.filter((c) => c.lifecycle === l).length).toBe(
        LIFECYCLE_COUNTS[l]
      )
  })

  it("opens ?lifecycle= and ?territory= on that rule, and otherwise on an empty Name search", () => {
    const callbacks = CONTACTS.filter((c) =>
      passesFilters(c, startingRules("Callback"), contactField)
    )
    expect(callbacks.map((c) => c.name).toSorted()).toEqual([
      "Harriet Lawson",
      "Kenji Watanabe",
      "Valentina Ospina",
    ])
    const riverbend = CONTACTS.filter((c) =>
      passesFilters(c, startingRules(undefined, "Riverbend"), contactField)
    )
    expect(riverbend.map((c) => c.name).toSorted()).toEqual([
      "Camille Laurent",
      "Graham Pritchard",
      "Tamika Greene",
      "Tereza Horak",
    ])
    expect(startingRules("Nope")).toEqual([
      { id: "name-search", field: "name", operator: "contains", values: [""] },
    ])
  })
})

describe("the territories", () => {
  it("derives every card from its homeowners", () => {
    for (const t of TERRITORIES) {
      const card = territoryCard(t, CONTACTS)
      expect(card.contactCount).toBe(t.contactCount)
      expect(card.openPipeline).toBe(t.openPipeline)
      expect(card.openDeals).toBe(t.openDeals)
      expect(card.segments).toEqual(t.segments)
      expect(card.ownerIds).toEqual(t.ownerIds)
      expect(card.contactIds.toSorted((a, b) => a - b)).toEqual(
        t.contactIds.toSorted((a, b) => a - b)
      )
    }
  })

  it("never knocks more homes than a territory has", () => {
    for (const t of TERRITORIES) {
      expect(t.knocked).toBeLessThanOrEqual(t.doors)
      expect(t.sold).toBeLessThan(t.knocked)
    }
    expect(knockedShare({ doors: 1240, knocked: 1105 })).toBe(89)
  })

  it("puts an added territory first, with its initials on the colour picked", () => {
    const added = territoryFromForm(TERRITORIES, {
      name: "Mesquite Flats",
      office: "Phoenix",
      doors: "1,100",
      repId: "owen-fletcher",
      color: "bg-violet-600",
    })
    expect(added).toMatchObject({
      tile: { kind: "initials", text: "MF", bg: "bg-violet-600" },
      doors: 1100,
      knocked: 0,
    })
    const cards = territoryCards([...TERRITORIES, added], CONTACTS)
    expect(cards[0]!.name).toBe("Mesquite Flats")
    expect(cards).toHaveLength(10)
    expect(validateTerritory({ name: " ", doors: "lots" })).toEqual({
      name: "Enter a territory name",
      doors: "Use a whole number of homes",
    })
  })
})

describe("the directory's actions", () => {
  const harriet = CONTACTS.find((c) => c.name === "Harriet Lawson")!

  it("checks Add contact", () => {
    expect(validateContact({ name: "", email: "" })).toEqual({
      name: "Enter a full name",
      email: "Enter an email address",
    })
    expect(validateContact({ name: "Test Person", email: "bad" })).toEqual({
      email: "Enter a valid email address",
    })
    expect(
      validateContact({ name: "Test Person", email: "test@example.com" })
    ).toEqual({})
  })

  it("adds a homeowner as id 41 in their territory", () => {
    const c = contactFromForm(CONTACTS, TERRITORIES, {
      name: "Test Person",
      email: "test@example.com",
      address: "700 N Cottonwood Bench Rd",
      territoryId: "cottonwood-bench",
      ownerId: "darnell-brooks",
      lifecycle: "Lead",
      phone: "",
    })
    expect(c).toMatchObject({
      id: 41,
      territory: "Cottonwood Bench",
      office: "Boise",
      openDeals: { count: 0, amount: 0, short: null },
    })
    const cottonwood = TERRITORIES.find((t) => t.id === "cottonwood-bench")!
    expect(territoryCard(cottonwood, [...CONTACTS, c]).contactCount).toBe(6)
  })

  it("logs a text on top of the timeline", () => {
    const logged = logText(harriet)
    expect(logged.activity).toHaveLength(harriet.activity.length + 1)
    expect(logged.activity[0]).toMatchObject({
      icon: "message-square",
      when: "Just now",
      actorId: "darnell-brooks",
    })
    expect(logged.lastActivity).toEqual({
      icon: "message-square",
      when: "Just now",
    })
  })

  it("adds a new deal to the homeowner's open deals", () => {
    expect(addDeal(harriet, 869).openDeals).toEqual({
      count: 2,
      amount: 1908,
      short: "$1,908",
    })
  })

  it("assigns an owner to the picked homeowners only", () => {
    const next = assignOwner(CONTACTS, [4, 10], "grant-lowell")
    expect(next.filter((c) => c.ownerId === "grant-lowell").length).toBe(
      CONTACTS.filter((c) => c.ownerId === "grant-lowell").length + 2
    )
  })
})
