// The Contacts app's logic: the directory's filter fields and starting rules, the short money it prints, the territory
// cards derived from the homeowners, and what the directory's actions do to the records.

import {
  type Contact,
  type ContactEvent,
  LIFECYCLES,
  type Lifecycle,
} from "@/data/contacts"
import { type Market, memberName } from "@/data/team"
import { TERRITORIES, type Territory } from "@/data/territories"
import type { FilterBarRule } from "@/lib/filter-bar"

/** The short money: "$1,039" under ten thousand, then "$13.8K" and "$8.9M" (one decimal, none when it's .0) */
export function shortUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${n.toLocaleString("en-US")}`
}

/** A contact field's text, for the filter bar */
export function contactField(c: Contact, field: string): string {
  switch (field) {
    case "name":
      return c.name
    case "email":
      return c.email
    case "territory":
      return c.territory
    case "office":
      return c.office
    case "owner":
      return memberName(c.ownerId)
    case "lifecycle":
      return c.lifecycle
    default:
      return ""
  }
}

/**
 * The rules the directory opens with: `?lifecycle=` (the sidebar's Lifecycle list) or `?territory=` (a territory card)
 * as one rule on that field; otherwise an empty Name search.
 */
export function startingRules(
  lifecycle?: string,
  territory?: string
): FilterBarRule[] {
  if (lifecycle && (LIFECYCLES as string[]).includes(lifecycle))
    return [
      {
        id: "lifecycle-param",
        field: "lifecycle",
        operator: "is_any_of",
        values: [lifecycle],
      },
    ]
  if (territory)
    return [
      {
        id: "territory-param",
        field: "territory",
        operator: "is_any_of",
        values: [territory],
      },
    ]
  return [
    { id: "name-search", field: "name", operator: "contains", values: [""] },
  ]
}

/** Initials for a new record's avatar or tile: the first letters of the first two words */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")

export type ContactForm = {
  name: string
  email: string
  address: string
  territoryId: string
  ownerId: string
  lifecycle: Lifecycle
  phone: string
}
export type ContactFormErrors = Partial<Record<"name" | "email", string>>

/** Add contact's checks */
export function validateContact(
  f: Pick<ContactForm, "name" | "email">
): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (!f.name.trim()) errors.name = "Enter a full name"
  if (!f.email.trim()) errors.email = "Enter an email address"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    errors.email = "Enter a valid email address"
  return errors
}

/** A homeowner made with Add contact: the next id, no deals yet, and "Just now" as its last activity */
export function contactFromForm(
  contacts: Contact[],
  territories: Territory[],
  f: ContactForm
): Contact {
  const territory = territories.find((t) => t.id === f.territoryId)
  return {
    id: Math.max(0, ...contacts.map((c) => c.id)) + 1,
    name: f.name.trim(),
    email: f.email.trim(),
    address: f.address.trim(),
    territoryId: f.territoryId,
    territory: territory?.name ?? "",
    office: territory?.office ?? "Boise",
    ownerId: f.ownerId,
    lifecycle: f.lifecycle,
    lastActivity: { icon: "sparkles", when: "Just now" },
    openDeals: { count: 0, amount: 0, short: null },
    activity: [],
  }
}

/** Log text: a Text event on top of the homeowner's timeline, by their owner, and their last activity now */
export function logText(c: Contact): Contact {
  const event: ContactEvent = {
    title: "Text logged",
    status: "Logged",
    dot: "bg-muted-foreground/60",
    icon: "message-square",
    text: `Texted ${c.name}. Next step: a callback.`,
    actorId: c.ownerId,
    when: "Just now",
  }
  return {
    ...c,
    lastActivity: { icon: "message-square", when: "Just now" },
    activity: [event, ...c.activity],
  }
}

/** A new deal for this homeowner adds to their open deals */
export function addDeal(c: Contact, amount: number): Contact {
  const total = c.openDeals.amount + amount
  return {
    ...c,
    openDeals: {
      count: c.openDeals.count + 1,
      amount: total,
      short: shortUsd(total),
    },
  }
}

/** The bulk bar's Assign owner */
export const assignOwner = (
  contacts: Contact[],
  ids: number[],
  ownerId: string
) => contacts.map((c) => (ids.includes(c.id) ? { ...c, ownerId } : c))

/** The directory's header and the Territories page's: territories, homeowners and their open pipeline */
export function directorySummary(
  contacts: Contact[],
  territories: Territory[]
) {
  const pipeline = contacts.reduce((sum, c) => sum + c.openDeals.amount, 0)
  return {
    territories: territories.length,
    contacts: contacts.length,
    openPipeline: pipeline,
    openPipelineShort: shortUsd(pipeline),
  }
}

/** A territory's card, counted from the homeowners it has now */
export function territoryCard(
  territory: Territory,
  contacts: Contact[]
): Territory {
  const mine = contacts.filter((c) => c.territoryId === territory.id)
  const openPipeline = mine.reduce((sum, c) => sum + c.openDeals.amount, 0)
  const segments = LIFECYCLES.map((lifecycle) => ({
    lifecycle,
    count: mine.filter((c) => c.lifecycle === lifecycle).length,
  })).filter((s) => s.count > 0)
  const ownerIds = [...new Set(mine.map((c) => c.ownerId))].toSorted((a, b) =>
    memberName(a).localeCompare(memberName(b))
  )
  return {
    ...territory,
    contactCount: mine.length,
    openPipeline,
    pipelineShort: shortUsd(openPipeline),
    openDeals: mine.reduce((sum, c) => sum + c.openDeals.count, 0),
    segments,
    ownerIds,
    contactIds: mine.map((c) => c.id),
  }
}

/** Share of a territory's homes knocked at least once, in percent */
export const knockedShare = (t: Pick<Territory, "doors" | "knocked">) =>
  t.doors ? Math.round((t.knocked / t.doors) * 100) : 0

/** The Territories grid: ones added this visit first (newest first), then office by office in the data's order */
export function territoryCards(
  territories: Territory[],
  contacts: Contact[]
): Territory[] {
  const added = territories.filter((t) => t.added).toReversed()
  const rest = territories.filter((t) => !t.added)
  return [...added, ...rest].map((t) => territoryCard(t, contacts))
}

export type TerritoryForm = {
  name: string
  office: Market
  doors: string
  repId: string
  color: string
}

/** Add territory's checks: a name, and a whole number of homes when one is given */
export function validateTerritory(
  f: Pick<TerritoryForm, "name" | "doors">
): Partial<Record<"name" | "doors", string>> {
  const e: Partial<Record<"name" | "doors", string>> = {}
  if (!f.name.trim()) e.name = "Enter a territory name"
  const doors = f.doors.replace(/[,\s]/g, "")
  if (doors && !/^\d+$/.test(doors)) e.doors = "Use a whole number of homes"
  return e
}

/** A territory made with Add territory: its initials on the colour picked, nothing knocked yet */
export function territoryFromForm(
  territories: Territory[],
  f: TerritoryForm
): Territory {
  const base =
    f.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "territory"
  let id = base
  for (let n = 2; territories.some((t) => t.id === id); n++) id = `${base}-${n}`
  return {
    id,
    name: f.name.trim(),
    office: f.office,
    repId: f.repId,
    icon: "map-pin",
    tile: { kind: "initials", text: initialsOf(f.name), bg: f.color },
    doors: Number(f.doors.replace(/[,\s]/g, "")) || 0,
    knocked: 0,
    sold: 0,
    contactCount: 0,
    openPipeline: 0,
    pipelineShort: shortUsd(0),
    openDeals: 0,
    segments: [],
    ownerIds: [],
    contactIds: [],
    added: true,
  }
}

/** Territories by name, for the Territory pickers and filter */
export const territoriesByName = (territories: Territory[] = TERRITORIES) =>
  territories.toSorted((a, b) => a.name.localeCompare(b.name))
