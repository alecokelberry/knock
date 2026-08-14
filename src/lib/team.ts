// Settings → Team members: the search and filters over the list, and members added by invite or CSV import.

import {
  AUTHENTICATIONS,
  type Authentication,
  BILLING_DOT,
  BILLING_STATUSES,
  type BillingStatus,
  MEMBER_ROLES,
  type TeamMember,
} from "@/data/team"
import { fmt, localDate } from "@/lib/dates"
import { isEmail } from "@/lib/settings"

/** The Filters menu's picks, per tab */
export type MemberFilters = {
  role: string[]
  billing: string[]
  auth: string[]
}
export const NO_FILTERS: MemberFilters = { role: [], billing: [], auth: [] }
export const filterCount = (f: MemberFilters) =>
  f.role.length + f.billing.length + f.auth.length

/** The search matches any column's text: name, username, email, role, billing status, authentication, joining date */
export function matchesSearch(m: TeamMember, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    m.name,
    m.username,
    m.email,
    m.role,
    m.billingStatus,
    m.authentication,
    m.joined,
  ].some((v) => v.toLowerCase().includes(q))
}

/** Within a tab the picks are "any of"; across tabs, all must hold */
export const matchesFilters = (m: TeamMember, f: MemberFilters) =>
  (!f.role.length || f.role.includes(m.role)) &&
  (!f.billing.length || f.billing.includes(m.billingStatus)) &&
  (!f.auth.length || f.auth.includes(m.authentication))

/** Add member's address box: split on commas, spaces and new lines, trimmed and lower case */
export const splitEmails = (typed: string) =>
  typed
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

/** "3 people will be invited" under the chips */
export const inviteCountLine = (n: number) =>
  `${n} ${n === 1 ? "person" : "people"} will be invited`

/** A name from an address: "jo.baker@vantage.example" → "Jo Baker" */
export function nameFromEmail(email: string) {
  const [local = ""] = email.split("@")
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

/**
 * A member as they land in the list: each invited address, as the role and sign-in picked, joining today, billed on
 * the next invoice ("Pending invoice").
 */
export function newMember(
  email: string,
  role: string,
  authentication: Authentication,
  todayIso: string,
  name = nameFromEmail(email),
  billingStatus: BillingStatus = "Pending invoice"
): TeamMember {
  const username = (email.split("@")[0] ?? "").toLowerCase()
  return {
    id: `member-${email}`,
    name: name || username,
    username,
    email,
    role,
    title: null,
    activityRole: null,
    market: null,
    billingStatus,
    billingDot: BILLING_DOT[billingStatus],
    authentication,
    joined: fmt.dayYearPadded.format(localDate(todayIso)),
    joinedISO: todayIso,
  }
}

/** Adds members, skipping any address already on the team (or twice in the list) */
export function addMembers(team: TeamMember[], incoming: TeamMember[]) {
  const seen = new Set(team.map((m) => m.email.toLowerCase()))
  const added = incoming.filter(
    (m) => !seen.has(m.email.toLowerCase()) && seen.add(m.email.toLowerCase())
  )
  return { team: [...team, ...added], added }
}

const pick = <T extends string>(
  options: readonly T[],
  value: string | undefined,
  fallback: T
): T =>
  options.find((o) => o.toLowerCase() === value?.trim().toLowerCase()) ??
  fallback

/**
 * Import: a CSV of members, one per row, with a header naming its columns. `email` is required; `name`, `role`,
 * `authentication` (or `auth`) and `billing status` are read when present, anything unknown falls back to
 * Sales Rep, SSO and Pending invoice. Rows without a valid address are skipped and counted.
 */
export function parseMemberCsv(
  csv: string,
  todayIso: string
): { members: TeamMember[]; skipped: number } {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, "")))
    .filter((r) => r.some(Boolean))
  const [first] = rows
  if (!first) return { members: [], skipped: 0 }
  const head = first.map((h) => h.toLowerCase())
  const col = (...names: string[]) => head.findIndex((h) => names.includes(h))
  const at = {
    email: col("email", "email address"),
    name: col("name", "member", "full name"),
    role: col("role"),
    auth: col("authentication", "auth"),
    billing: col("billing status", "billing"),
  }
  if (at.email < 0) return { members: [], skipped: rows.length - 1 }
  let skipped = 0
  const members: TeamMember[] = []
  for (const r of rows.slice(1)) {
    const email = (r[at.email] ?? "").toLowerCase()
    if (!isEmail(email)) {
      skipped++
      continue
    }
    members.push(
      newMember(
        email,
        pick(MEMBER_ROLES, r[at.role], "Sales Rep"),
        pick(AUTHENTICATIONS, r[at.auth], "SSO"),
        todayIso,
        (at.name >= 0 && r[at.name]) || undefined,
        pick(BILLING_STATUSES, r[at.billing], "Pending invoice")
      )
    )
  }
  return { members, skipped }
}
