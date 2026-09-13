// Pipeline → Approvals: the queue's header counts, the search and filters, signing requests off (one at a time or
// a selection), and the New request sheet's checks and the request it makes.

import type {
  Approval,
  ApprovalCheck,
  ApprovalStatus,
  RequestType,
} from "@/data/approvals"
import { APPROVAL_STATUSES } from "@/data/approvals"

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
export const money = (n: number) => USD.format(n)

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

/** A pending request with a check that blocks sign-off */
const isFlagged = (a: Approval) =>
  a.status === "Pending" && a.checks.some((c) => c.state === "block")
export const blockingChecks = (a: Approval) =>
  a.checks.filter((c) => c.state === "block").length

/** The header's "10 visible · 4 pending · 1 flagged": pending counts the whole queue, flagged only what's shown */
export const queueSummary = (all: Approval[], shown: Approval[]) => ({
  visible: shown.length,
  pending: all.filter((a) => a.status === "Pending").length,
  flagged: shown.filter(isFlagged).length,
})

/** The Status filter's counts, over the whole queue */
export const statusCounts = (all: Approval[]) =>
  Object.fromEntries(
    APPROVAL_STATUSES.map((s) => [s, all.filter((a) => a.status === s).length])
  ) as Record<ApprovalStatus, number>

/** The search (rep, request, account, quote, justification or approver), the approver and the statuses */
export function filterApprovals(
  all: Approval[],
  query: string,
  approver: string | null,
  statuses: ApprovalStatus[]
) {
  const q = query.trim().toLowerCase()
  return all.filter(
    (a) =>
      (!q ||
        [
          a.rep,
          a.request,
          a.account,
          a.quote,
          a.justification,
          a.approver,
        ].some((s) => s.toLowerCase().includes(q))) &&
      (!approver || a.approver === approver) &&
      (!statuses.length || statuses.includes(a.status))
  )
}

/** Approves or denies the pending requests among `ids` (a decided one stays as it was) */
export const decide = (
  all: Approval[],
  ids: string[],
  status: "Approved" | "Denied"
) =>
  all.map((a) =>
    ids.includes(a.id) && a.status === "Pending" ? { ...a, status } : a
  )

/** The toasts for one request */
export const approvedLine = (a: Approval) =>
  `${a.request} on ${a.account} · ${a.quote} signed off for ${a.rep}.`
export const deniedLine = (a: Approval) =>
  `${a.rep}: ${a.request} was not approved.`
/** …and for a selection */
export const bulkLine = (n: number, status: "Approved" | "Denied") =>
  `${plural(n, "pending approval")} ${status === "Approved" ? "signed off" : "rejected"}.`

/** The bar over a selection: "2 approvals selected", "1 pending and ready to sign off in this selection." */
export const selectionLines = (selected: Approval[]) =>
  [
    `${plural(selected.length, "approval")} selected`,
    `${selected.filter((a) => a.status === "Pending").length} pending and ready to sign off in this selection.`,
  ] as const

export type RequestForm = {
  requester: string
  type: RequestType
  account: string
  quote: string
  value: string
  discount: string
  approver: string
  justification: string
}

const amount = (raw: string) => Number(raw.replace(/[$,%\s]/g, ""))

/** New request's checks: the three required fields, a value above 0, and a discount between 0 and 100 */
export function requestErrors(
  f: RequestForm
): Partial<Record<"account" | "value" | "discount" | "justification", string>> {
  const e: Partial<
    Record<"account" | "value" | "discount" | "justification", string>
  > = {}
  if (!f.account.trim()) e.account = "Enter the homeowner"
  const value = amount(f.value)
  if (!f.value.trim()) e.value = "Enter an amount"
  else if (!Number.isFinite(value) || value <= 0)
    e.value = "Enter an amount greater than 0"
  const d = amount(f.discount)
  if (f.discount.trim() && (!Number.isFinite(d) || d < 0 || d > 100))
    e.discount = "Use a value between 0 and 100"
  if (!f.justification.trim()) e.justification = "Enter a justification"
  return e
}

/** The request's name in the Request column, from its type, discount and amount */
function requestName(
  type: RequestType,
  discount: number | null,
  value: number
) {
  if (type === "Price override")
    return discount ? `${discount}% off` : "Price override"
  if (type === "Waived initial") return "Waived initial"
  if (type === "Back-end advance") return `${money(value)} back-end advance`
  return "Out-of-territory sale"
}

/** A price override under this is approved by rule, as the Approval rules say */
const AUTO_APPROVE_UNDER = 10
/** The most a sales manager can take off; past it the regional director signs */
const CEILING = 20
/** Advances past this need the regional director, as the Approval rules say */
const ADVANCE_ABOVE = 1_000

/**
 * A request from the sheet joins the queue, checked against the Approval rules: a price override under 10% is
 * approved at once and past the 20% ceiling it blocks; a waived initial and a sale in another rep's territory always
 * need a look; an advance over $1,000 goes to the regional director.
 */
export function newApproval(f: RequestForm, id: string): Approval {
  const discount = f.discount.trim()
    ? Math.round(amount(f.discount) * 10) / 10
    : null
  const value = Math.round(amount(f.value))
  const checks: ApprovalCheck[] = []
  if (discount !== null)
    checks.push(
      discount < AUTO_APPROVE_UNDER
        ? {
            label: "Within the ceiling",
            detail: `${discount}% is under 10%; approved by rule.`,
            state: "pass",
          }
        : discount <= CEILING
          ? {
              label: "Within the ceiling",
              detail: `${discount}% sits under the 20% ceiling.`,
              state: "pass",
            }
          : {
              label: "Within the ceiling",
              detail: `${discount}% exceeds the 20% ceiling; needs the regional director.`,
              state: "block",
            }
    )
  if (f.type === "Waived initial")
    checks.push({
      label: "Initial waived",
      detail: "Ridgeline still bills the first visit; the office absorbs it.",
      state: "warn",
    })
  if (f.type === "Out of territory")
    checks.push({
      label: "Territory rep told",
      detail: "Tell the territory's rep; the account is split.",
      state: "warn",
    })
  if (f.type === "Back-end advance")
    checks.push(
      value > ADVANCE_ABOVE
        ? {
            label: "Over $1,000",
            detail: "Advances over $1,000 need the regional director.",
            state: "warn",
          }
        : {
            label: "Under $1,000",
            detail: "Payroll signs off advances up to $1,000.",
            state: "pass",
          }
    )
  const auto =
    f.type === "Price override" &&
    discount !== null &&
    discount < AUTO_APPROVE_UNDER
  return {
    id,
    rep: f.requester,
    request: requestName(f.type, discount, value),
    type: f.type,
    account: f.account.trim(),
    quote: f.quote.trim().toUpperCase() || "No quote",
    justification: f.justification.trim(),
    requested: "Just now",
    value,
    approver: f.approver,
    status: auto ? "Approved" : "Pending",
    checks,
  }
}

/** The Request submitted line: "Price override · Harriet Lawson · Julia Serrano" */
export const submittedLine = (f: RequestForm) =>
  `${f.type} · ${f.account.trim()} · ${f.approver}`
