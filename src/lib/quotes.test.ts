import { describe, expect, it } from "vitest"

import { DEALS } from "@/data/deals"
import { PLAN_VALUE } from "@/data/products"
import {
  NEW_QUOTE,
  QUOTE_CUSTOMERS,
  QUOTE_ITEMS,
  type QuoteLine,
  QUOTES,
} from "@/data/quotes"
import { memberName } from "@/data/team"

import {
  applyBulk,
  bulkLine,
  canSend,
  formatMoney,
  lineAmount,
  memoFor,
  nextQuoteNumber,
  planFor,
  quoteFormErrors,
  quoteFromForm,
  quoteStage,
  quoteSummary,
  quoteTotals,
  recordDates,
  sendQuote,
  validity,
  validitySortKey,
  withdrawQuote,
} from "./quotes"

const byId = (id: string) => QUOTES.find((q) => q.id === id)!

describe("quotes ledger", () => {
  it("prints Valid until from the demo's today", () => {
    expect(
      QUOTES.map((q) => {
        const v = validity(q)
        return [v.label, v.sub, v.tone].join("/")
      })
    ).toEqual([
      "14d expired/Jul 2/destructive",
      "8d expired/Jul 8/destructive",
      "Valid for 4d/Jul 20/warning",
      "Valid for 7d/Jul 23/warning",
      "Valid for 11d/Jul 27/default",
      "Valid for 11d/Jul 27/default",
      "Valid for 12d/Jul 28/default",
      "Valid for 12d/Jul 28/default",
      "Valid for 13d/Jul 29/default",
      "Valid for 13d/Jul 29/default",
      "Valid for 13d/Jul 29/default",
      "Not sent//default",
      "Not sent//default",
      "Accepted Jul 9//default",
      "Accepted Jul 14//default",
      "Accepted Jul 14//default",
    ])
  })

  it("counts the header, and sorts Valid until with the undated in the middle", () => {
    expect(quoteSummary(QUOTES)).toEqual({ sent: 9, expired: 2 })
    const asc = QUOTES.toSorted(
      (a, b) => validitySortKey(a) - validitySortKey(b)
    ).map((q) => q.id)
    expect(asc).toEqual([
      "Q-2026",
      "Q-2028",
      "Q-2039",
      "Q-2040",
      "Q-2024",
      "Q-2025",
      "Q-2027",
      "Q-2029",
      "Q-2030",
      "Q-2034",
      "Q-2038",
      "Q-2035",
      "Q-2037",
      "Q-2033",
      "Q-2036",
      "Q-2031",
    ])
  })

  it("prices every open quote from its household, less a waived initial", () => {
    for (const q of QUOTES.filter(
      (quote) =>
        (quote.status === "Sent" || quote.status === "Draft") && quote.dealId
    )) {
      const deal = DEALS.find((d) => d.id.toUpperCase() === q.dealId)!
      expect(deal.household, q.id).toBe(q.household)
      expect(memberName(deal.ownerId), q.id).toBe(q.owner)
      const waived = q.memo.includes("initial waived") ? 99 : 0
      expect(q.amount, q.id).toBe(deal.value - waived)
    }
    expect(PLAN_VALUE["Bi-Monthly Pest"] - 99).toBe(474)
  })

  it("tells each quote's stage", () => {
    expect(
      ["Q-2026", "Q-2029", "Q-2033", "Q-2039", "Q-2025"].map((id) => {
        const s = quoteStage(byId(id))
        return `${s.label} ${s.percent}% ${s.chip}`
      })
    ).toEqual([
      "Price ran out 38% 14d expired",
      "Running out 72% Valid for 4d",
      "Waiting on a callback 58% Valid for 13d",
      "Draft setup 18% Draft pending",
      "Signed 100% Accepted Jul 14",
    ])
    expect(
      quoteStage(byId("Q-2026")).steps.map((s) => `${s.title} ${s.when}`)
    ).toEqual([
      "Quote issued Jun 18",
      "Follow-up text Jul 2",
      "Knock again 14d late",
    ])
    expect(
      quoteStage(withdrawQuote(byId("Q-2033"))).steps.map((s) => s.title)
    ).toEqual(["Quote issued", "Follow-up stopped"])
    expect(recordDates(byId("Q-2039"))).toEqual({
      issued: "Draft",
      valid: "Not set",
    })
    expect(recordDates(byId("Q-2036"))).toEqual({
      issued: "Jul 15",
      valid: "Jul 29",
    })
  })

  it("sends, withdraws and applies the bulk bar", () => {
    expect(QUOTES.filter(canSend).length).toBe(10)
    const resent = sendQuote(byId("Q-2026"))
    expect([
      resent.status,
      resent.issued,
      resent.validUntil,
      validity(resent).label,
    ]).toEqual(["Sent", "2026-07-16", "2026-07-30", "Valid for 14d"])
    expect(sendQuote(byId("Q-2027"))).toBe(byId("Q-2027"))
    const after = applyBulk(
      QUOTES,
      ["Q-2026", "Q-2027"],
      "Darnell Brooks",
      "Send quote"
    )
    expect(after.find((q) => q.id === "Q-2027")).toMatchObject({
      owner: "Darnell Brooks",
      status: "Accepted",
    })
    expect(after.find((q) => q.id === "Q-2026")!.status).toBe("Sent")
    expect(
      applyBulk(QUOTES, ["Q-2033"], "Kirsten Vogt", "Mark accepted").find(
        (q) => q.id === "Q-2033"
      )
    ).toMatchObject({
      status: "Accepted",
      accepted: "2026-07-16",
      owner: "Kirsten Vogt",
    })
    expect(bulkLine("Send quote", 2, "Darnell Brooks")).toBe(
      "Send quote queued for 2 quotes, assigned to Darnell Brooks."
    )
    expect(bulkLine("Send quote", 1, "Darnell Brooks")).toBe(
      "Send quote queued for 1 quote, assigned to Darnell Brooks."
    )
  })
})

describe("new quote", () => {
  it("adds up the opening form, which prices its household", () => {
    expect(NEW_QUOTE.lines.map(lineAmount)).toEqual([149, 476])
    expect(quoteTotals(NEW_QUOTE.lines, NEW_QUOTE.discount)).toEqual({
      subtotal: 625,
      discount: 0,
      tax: 37.5,
      total: 662.5,
    })
    expect(DEALS.find((d) => d.id === "deal-301")?.value).toBe(625)
    expect(formatMoney(-62.5, "USD")).toBe("-$62.50")
  })

  it("prices the door lines from the plans", () => {
    const line = (id: string) => QUOTE_ITEMS.find((i) => i.id === id)!
    expect(line("qtr-pest-initial")).toMatchObject({ price: 149, qty: 1 })
    expect(line("qtr-pest")).toMatchObject({
      name: "Quarterly Pest · every quarter",
      price: 119,
      qty: 4,
    })
    expect(line("msq-season").name).toBe("Mosquito Season · monthly in season")
    expect(QUOTE_ITEMS.some((i) => i.id === "bed-bug")).toBe(false)
  })

  it("reads quantities, rates, discounts and tax", () => {
    const [initial, recurring] = NEW_QUOTE.lines as [QuoteLine, QuoteLine]
    expect(
      quoteTotals(
        [
          { ...initial, qty: "0" },
          { ...recurring, rate: "" },
        ],
        "0"
      ).subtotal
    ).toBe(149)
    expect(quoteTotals(NEW_QUOTE.lines, "10")).toMatchObject({
      discount: 62.5,
      tax: 33.75,
      total: 596.25,
    })
    expect(quoteTotals([{ ...recurring, tax: 8.6 }], "0").tax).toBeCloseTo(
      40.94
    )
    expect(quoteTotals(NEW_QUOTE.lines, "150")).toMatchObject({
      discount: 625,
      tax: 0,
      total: 0,
    })
    expect(quoteTotals(NEW_QUOTE.lines, "-5").discount).toBe(0)
  })

  it("checks the form", () => {
    expect(
      quoteFormErrors({ customer: null, number: " ", billing: "" }, [])
    ).toEqual({
      customer: "Select a customer",
      number: "Enter a quote number",
      billing: "Enter a billing address",
    })
    expect(
      quoteFormErrors(
        { customer: "Graham Pritchard", number: "Q-2033", billing: "x" },
        ["Q-2033"]
      )
    ).toEqual({ number: "This quote number is already in use" })
    expect(nextQuoteNumber(["Q-2041", "Q-2042"])).toBe("Q-2043")
  })

  it("saves the quote the ledger shows, under the household's rep", () => {
    const customer = QUOTE_CUSTOMERS[0]!
    const sent = quoteFromForm({ ...NEW_QUOTE, customer }, "Sent", QUOTE_ITEMS)
    expect(sent).toMatchObject({
      id: "Q-2041",
      household: "Graham Pritchard",
      owner: "Kyle Bennett",
      address: "1180 S Riverbend Way",
      plan: "Quarterly Pest",
      memo: "Quarterly Pest",
      amount: 663,
      dealId: "DEAL-301",
      status: "Sent",
      days: 14,
    })
    expect(validity(sent).label).toBe("Valid for 14d")
    expect(
      quoteFromForm({ ...NEW_QUOTE, customer, po: "" }, "Draft", QUOTE_ITEMS)
    ).toMatchObject({ status: "Draft", dealId: null, issued: null, days: null })
    const line = (productId: string): QuoteLine => ({
      id: productId,
      productId,
      qty: "1",
      rate: "1",
      tax: 0,
    })
    expect(planFor([line("msq-season")], QUOTE_ITEMS)).toBe("Mosquito Season")
    expect(planFor([line("wsp-rmv")], QUOTE_ITEMS)).toBe("Quarterly Pest")
    expect(
      memoFor(
        [line("qtr-pest-initial"), line("qtr-pest"), line("msq-season")],
        QUOTE_ITEMS
      )
    ).toBe("Quarterly Pest + Mosquito Season")
  })
})
