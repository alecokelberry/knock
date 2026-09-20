import { describe, expect, it } from "vitest"

import { BILLING_DETAILS } from "@/data/billing"

import {
  billingErrors,
  cardErrors,
  cardLabel,
  formatCardNumber,
  formatExpiry,
  luhn,
  previewNumber,
} from "./billing"

// 4242… is the payment industry's published test number, not a card
const TEST_CARD = "4242 4242 4242 4242"

describe("billing", () => {
  it("checks billing details", () => {
    expect(billingErrors(BILLING_DETAILS)).toEqual({})
    expect(
      billingErrors({ ...BILLING_DETAILS, contact: "", entity: " " })
    ).toEqual({
      contact: "Enter an email address",
      entity: "Enter a legal entity name",
    })
    expect(billingErrors({ ...BILLING_DETAILS, contact: "nope" })).toEqual({
      contact: "Enter a valid email address",
    })
  })
  it("checks the card form: empty fields, then what's wrong", () => {
    const empty = { name: "", number: "", expiry: "", cvc: "", zip: "" }
    expect(cardErrors(empty, "2026-09-28")).toEqual({
      name: "Enter the cardholder name",
      number: "Enter a card number",
      expiry: "Enter an expiry date",
      cvc: "Enter a CVC",
    })
    expect(
      cardErrors(
        {
          name: "Julia Serrano",
          number: TEST_CARD,
          expiry: "12/30",
          cvc: "123",
          zip: "",
        },
        "2026-09-28"
      )
    ).toEqual({})
    expect(
      cardErrors(
        {
          name: "Julia Serrano",
          number: "4242 4242 4242 4241",
          expiry: "08/26",
          cvc: "12",
          zip: "",
        },
        "2026-09-28"
      )
    ).toEqual({
      number: "Enter a valid card number",
      expiry: "This card has expired",
      cvc: "Enter the 3 or 4 digits on the back",
    })
    expect(
      cardErrors(
        { name: "M", number: TEST_CARD, expiry: "13/30", cvc: "123", zip: "" },
        "2026-09-28"
      ).expiry
    ).toBe("Use MM/YY")
  })
  it("formats what's typed and keeps only the last four", () => {
    expect(formatCardNumber("4242424242424242")).toBe(TEST_CARD)
    expect(formatExpiry("1230")).toBe("12/30")
    expect(formatExpiry("1")).toBe("1")
    expect(luhn(TEST_CARD)).toBe(true)
    expect(cardLabel(TEST_CARD)).toBe("Visa •••• 4242")
    expect(previewNumber("")).toBe("•••• •••• •••• ••••")
    expect(previewNumber("4242 42")).toBe("4242 42•• •••• ••••")
  })
})
