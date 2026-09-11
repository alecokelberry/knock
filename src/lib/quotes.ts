// Pipeline → Quotes: what each quote's row and sheet say, what the ledger's actions do to a quote, and the new-quote
// form's arithmetic, checks and the quote it saves.

import {
  CLOSE_REPORT,
  QUOTE_PLANS,
  QUOTE_WINDOW,
  QUOTES_TODAY,
  type Quote,
  type QuoteBulkAction,
  type QuoteCurrency,
  type QuoteLine,
  type QuotePlan,
} from "@/data/quotes"
import { addDays, daysBetween, formatDay } from "@/lib/dates"

export type QuoteTone = "destructive" | "warning" | "info" | "success" | "muted"

/** A price this close to its end reads as urgent (4d and 7d are amber, 11d is not) */
const CLOSING_DAYS = 7
const closing = (q: Quote) =>
  q.status === "Sent" && (q.days ?? Infinity) <= CLOSING_DAYS

/** The Valid until cell: its first line, the date under it (none for drafts, accepted and withdrawn), and its ink */
export function validity(q: Quote): {
  label: string
  sub: string | null
  tone: "destructive" | "warning" | "default" | "muted"
} {
  switch (q.status) {
    case "Expired":
      return {
        label: `${Math.abs(q.days ?? 0)}d expired`,
        sub: q.validUntil && formatDay(q.validUntil),
        tone: "destructive",
      }
    case "Sent":
      return {
        label: `Valid for ${q.days ?? 0}d`,
        sub: q.validUntil && formatDay(q.validUntil),
        tone: closing(q) ? "warning" : "default",
      }
    case "Accepted":
      return {
        label: q.accepted ? `Accepted ${formatDay(q.accepted)}` : "Accepted",
        sub: null,
        tone: "default",
      }
    case "Draft":
      return { label: "Not sent", sub: null, tone: "default" }
    case "Withdrawn":
      return { label: "Withdrawn", sub: null, tone: "muted" }
  }
}

/** How Valid until sorts: days left for sent and expired quotes, the rest together at zero */
export const validitySortKey = (q: Quote) =>
  q.status === "Sent" || q.status === "Expired" ? (q.days ?? 0) : 0

/** The header's "7 sent · 2 expired" */
export const quoteSummary = (quotes: readonly Quote[]) => ({
  sent: quotes.filter((q) => q.status === "Sent").length,
  expired: quotes.filter((q) => q.status === "Expired").length,
})

/** A quote's text for the filter bar's fields */
export function quoteField(q: Quote, field: string): string {
  const read: Record<string, string> = {
    household: q.household,
    status: q.status,
    plan: q.plan,
    owner: q.owner,
  }
  return read[field] ?? ""
}

export type QuoteStep = {
  kind:
    | "issued"
    | "followed-up"
    | "follow-up"
    | "escalation"
    | "window"
    | "deal"
    | "send"
    | "accepted"
    | "report"
    | "stopped"
  title: string
  when: string
  text: string
  tone: QuoteTone
}

/** The sheet's picture of a quote: the chip by its amount, the bar, the note under it and the acceptance path */
export function quoteStage(q: Quote): {
  chip: string
  chipTone: QuoteTone | "secondary" | "outline"
  label: string
  percent: number
  tone: QuoteTone
  note: string
  steps: QuoteStep[]
} {
  const issued: QuoteStep = q.issued
    ? {
        kind: "issued",
        title: "Quote issued",
        when: formatDay(q.issued),
        text: q.memo,
        tone: "info",
      }
    : {
        kind: "issued",
        title: "Draft prepared",
        when: "Draft",
        text: q.memo,
        tone: "muted",
      }
  const until = q.validUntil ? formatDay(q.validUntil) : "Not set"
  switch (q.status) {
    case "Expired": {
      const late = Math.abs(q.days ?? 0)
      return {
        chip: `${late}d expired`,
        chipTone: "destructive",
        label: "Price ran out",
        percent: 38,
        tone: "destructive",
        note: "The price left at the door has run out. Knock again with a fresh one, or text a new link.",
        steps: [
          issued,
          {
            kind: "followed-up",
            title: "Follow-up text",
            when: until,
            text: "The rep's follow-up text went out when the price ran out.",
            tone: "warning",
          },
          {
            kind: "escalation",
            title: "Knock again",
            when: `${late}d late`,
            text: "Leave a fresh price, or resend the quote link.",
            tone: "destructive",
          },
        ],
      }
    }
    case "Sent": {
      const soon = closing(q)
      return {
        chip: `Valid for ${q.days ?? 0}d`,
        chipTone: soon ? "warning" : "info",
        label: soon ? "Running out" : "Waiting on a callback",
        percent: soon ? 72 : 58,
        tone: soon ? "warning" : "info",
        note: "Left at the door and waiting on the homeowner. The callback is on the rep's route.",
        steps: [
          issued,
          {
            kind: "follow-up",
            title: "Callback",
            when: soon ? "Now" : "Booked",
            text: "Resend the price from the ledger's action menu.",
            tone: soon ? "warning" : "info",
          },
          {
            kind: "window",
            title: "Valid until",
            when: until,
            text: q.dealId ?? "No deal",
            tone: "muted",
          },
        ],
      }
    }
    case "Draft":
      return {
        chip: "Draft pending",
        chipTone: "secondary",
        label: "Draft setup",
        percent: 18,
        tone: "muted",
        note: q.dealId
          ? "This price is still a draft. Send it once the lines are final."
          : "This price is still a draft. Put the household on the board before sending it.",
        steps: [
          issued,
          q.dealId
            ? {
                kind: "deal",
                title: "Household",
                when: "Linked",
                text: q.dealId,
                tone: "success",
              }
            : {
                kind: "deal",
                title: "Household",
                when: "Missing",
                text: "Put the household on the board before sending this price.",
                tone: "warning",
              },
          {
            kind: "send",
            title: "Send quote",
            when: "Next",
            text: "Finish the lines and text the price to the homeowner.",
            tone: "muted",
          },
        ],
      }
    case "Accepted":
      return {
        chip: q.accepted ? `Accepted ${formatDay(q.accepted)}` : "Accepted",
        chipTone: "success",
        label: "Signed",
        percent: 100,
        tone: "success",
        note: "Signed on the tablet. It counts once Ridgeline has done the initial service.",
        steps: [
          issued,
          {
            kind: "accepted",
            title: "Quote accepted",
            when: q.accepted ? formatDay(q.accepted) : "",
            text: q.dealId ?? "No deal",
            tone: "success",
          },
          {
            kind: "report",
            title: "Pay run",
            when: formatDay(CLOSE_REPORT),
            text: "On the next pay run once it's serviced.",
            tone: "muted",
          },
        ],
      }
    case "Withdrawn":
      return {
        chip: "Withdrawn",
        chipTone: "outline",
        label: "Closed",
        percent: 0,
        tone: "muted",
        note: "This price is withdrawn and left out of the open pipeline.",
        steps: [
          issued,
          {
            kind: "stopped",
            title: "Follow-up stopped",
            when: "Withdrawn",
            text: "Left out of pipeline totals and callbacks.",
            tone: "muted",
          },
        ],
      }
  }
}

/** The sheet's Record Facts dates */
export const recordDates = (q: Quote) => ({
  issued: q.issued ? formatDay(q.issued) : "Draft",
  valid: q.validUntil ? formatDay(q.validUntil) : "Not set",
})

// ——— What the ledger's actions do to a quote ———

/** Send needs a deal reference, and an accepted quote has nothing left to send */
export const canSend = (q: Quote) =>
  q.status !== "Accepted" && q.dealId !== null

/** Sending a sent quote resends it as it is; anything else goes out today with a fresh window */
export function sendQuote(q: Quote, today = QUOTES_TODAY): Quote {
  if (!canSend(q) || q.status === "Sent") return q
  return {
    ...q,
    status: "Sent",
    issued: today,
    validUntil: addDays(today, QUOTE_WINDOW),
    accepted: null,
    days: QUOTE_WINDOW,
  }
}

function acceptQuote(q: Quote, today = QUOTES_TODAY): Quote {
  if (q.status === "Accepted" || q.status === "Withdrawn") return q
  return {
    ...q,
    status: "Accepted",
    issued: q.issued ?? today,
    accepted: today,
    days: null,
  }
}

export const withdrawQuote = (q: Quote): Quote =>
  q.status === "Withdrawn" ? q : { ...q, status: "Withdrawn", days: null }

/** The bulk bar's Apply: every picked quote goes to the owner, and gets the action where it can take it */
export function applyBulk(
  quotes: readonly Quote[],
  ids: readonly string[],
  owner: string,
  action: QuoteBulkAction,
  today = QUOTES_TODAY
): Quote[] {
  const act =
    action === "Send quote"
      ? (q: Quote) => sendQuote(q, today)
      : action === "Mark accepted"
        ? (q: Quote) => acceptQuote(q, today)
        : withdrawQuote
  return quotes.map((q) => (ids.includes(q.id) ? act({ ...q, owner }) : q))
}

/** The bulk toast: "Send quote queued for 2 quotes, assigned to Julia Serrano." */
export const bulkLine = (
  action: QuoteBulkAction,
  count: number,
  owner: string
) =>
  `${action} queued for ${count} ${count === 1 ? "quote" : "quotes"}, assigned to ${owner}.`

// ——— /quotes/new ———

/** A line's quantity: at least one (an empty or zero quantity counts as one) */
function lineQty(l: Pick<QuoteLine, "qty">) {
  const n = Number(l.qty)
  return l.qty.trim() && Number.isFinite(n) && n >= 1 ? n : 1
}
/** A line's rate: an empty or negative rate counts as nothing */
function lineRate(l: Pick<QuoteLine, "rate">) {
  const n = Number(l.rate)
  return l.rate.trim() && Number.isFinite(n) && n > 0 ? n : 0
}
export const lineAmount = (l: Pick<QuoteLine, "qty" | "rate">) =>
  lineQty(l) * lineRate(l)

const cents = (n: number) => Math.round(n * 100) / 100

/** The totals card: the discount comes off before tax, and each line is taxed at its own rate */
export function quoteTotals(lines: readonly QuoteLine[], discountRaw: string) {
  const d = Math.min(100, Math.max(0, Number(discountRaw) || 0)) / 100
  const subtotal = cents(lines.reduce((s, l) => s + lineAmount(l), 0))
  const discount = cents(subtotal * d)
  const tax = cents(
    lines.reduce((s, l) => s + lineAmount(l) * (1 - d) * (l.tax / 100), 0)
  )
  return { subtotal, discount, tax, total: cents(subtotal - discount + tax) }
}

const money = new Map<QuoteCurrency, Intl.NumberFormat>()
/** "$72,000.00", "€72,000.00", "-$6,296.00" */
export function formatMoney(n: number, currency: QuoteCurrency) {
  if (!money.has(currency))
    money.set(
      currency,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      })
    )
  return money.get(currency)!.format(n)
}

export type QuoteForm = {
  customer: string | null
  number: string
  billing: string
}
/** The form's checks: a customer, a number not already in the ledger, and a billing address */
export function quoteFormErrors(
  f: QuoteForm,
  taken: readonly string[]
): Partial<Record<keyof QuoteForm, string>> {
  const e: Partial<Record<keyof QuoteForm, string>> = {}
  if (!f.customer) e.customer = "Select a customer"
  if (!f.number.trim()) e.number = "Enter a quote number"
  else if (taken.includes(f.number.trim()))
    e.number = "This quote number is already in use"
  if (!f.billing.trim()) e.billing = "Enter a billing address"
  return e
}

/** The first free number from Q-2041 on (the ledger runs to Q-2040), so a second new quote doesn't reuse the first's */
export function nextQuoteNumber(taken: readonly string[], start = "Q-2041") {
  const n = Number(start.replace(/\D/g, ""))
  let i = n
  while (taken.includes(`Q-${i}`)) i++
  return `Q-${i}`
}

type CatalogItem = { id: string; name: string; productId: string }

/** The plan badge a new quote gets: the plan of its first plan line, else Quarterly Pest */
export function planFor(
  lines: readonly QuoteLine[],
  catalog: readonly CatalogItem[]
): QuotePlan {
  for (const l of lines) {
    const item = catalog.find((p) => p.id === l.productId)
    const plan = QUOTE_PLANS.find((n) => item?.name.startsWith(n))
    if (plan) return plan
  }
  return "Quarterly Pest"
}

/** The memo under a new quote's number: its plans and services by name, "Quarterly Pest + Mosquito Season" */
export function memoFor(
  lines: readonly QuoteLine[],
  catalog: readonly CatalogItem[]
) {
  const names = lines
    .map((l) => catalog.find((p) => p.id === l.productId)?.name.split(" · ")[0])
    .filter((n): n is string => !!n)
  return [...new Set(names)].join(" + ")
}

/** The quote the form saves into the ledger: a draft, or sent with its window counted from the ledger's today */
export function quoteFromForm(
  f: {
    customer: { name: string; owner: string; address: string }
    number: string
    po: string
    issued: string
    validUntil: string
    lines: readonly QuoteLine[]
    discount: string
  },
  status: "Draft" | "Sent",
  catalog: readonly CatalogItem[],
  today = QUOTES_TODAY
): Quote {
  const po = f.po.trim()
  const days = status === "Sent" ? daysBetween(today, f.validUntil) : null
  return {
    id: f.number.trim(),
    household: f.customer.name,
    owner: f.customer.owner,
    address: f.customer.address.split(",")[0] ?? f.customer.address,
    memo: memoFor(f.lines, catalog),
    plan: planFor(f.lines, catalog),
    amount: Math.round(quoteTotals(f.lines, f.discount).total),
    dealId: po || null,
    issued: status === "Sent" ? f.issued : null,
    validUntil: status === "Sent" ? f.validUntil : null,
    accepted: null,
    days,
    status: days !== null && days < 0 ? "Expired" : status,
  }
}
