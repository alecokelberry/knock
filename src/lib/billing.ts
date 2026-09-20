// Settings → Billing: the billing details and company card forms, and the card as the page shows it once added.

import type { BillingDetails } from "@/data/billing"
import { isEmail } from "@/lib/settings"

export type BillingErrors = Partial<Record<"contact" | "entity", string>>

/** The errors on Edit billing details → Save changes */
export function billingErrors(d: BillingDetails): BillingErrors {
  const e: BillingErrors = {}
  if (!d.contact.trim()) e.contact = "Enter an email address"
  else if (!isEmail(d.contact)) e.contact = "Enter a valid email address"
  if (!d.entity.trim()) e.entity = "Enter a legal entity name"
  return e
}

export type CardForm = {
  name: string
  number: string
  expiry: string
  cvc: string
  zip: string
}
export type CardErrors = Partial<
  Record<"name" | "number" | "expiry" | "cvc", string>
>

const digits = (s: string) => s.replace(/\D/g, "")

/** The card number as typed, in groups of four (up to 19 digits) */
export const formatCardNumber = (typed: string) =>
  digits(typed)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")

/** The expiry as typed: MM/YY */
export function formatExpiry(typed: string) {
  const d = digits(typed).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

/** Luhn's check, which every card number passes */
export function luhn(number: string) {
  const d = digits(number)
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2 === 1) n = n * 2 > 9 ? n * 2 - 9 : n * 2
    sum += n
  }
  return d.length >= 12 && sum % 10 === 0
}

/**
 * Add company card's errors: each empty field, then a wrong number, a past expiry or a short CVC. `today` is an ISO
 * day, for the expiry.
 */
export function cardErrors(c: CardForm, today: string): CardErrors {
  const e: CardErrors = {}
  if (!c.name.trim()) e.name = "Enter the cardholder name"
  if (!digits(c.number)) e.number = "Enter a card number"
  else if (!luhn(c.number)) e.number = "Enter a valid card number"
  const [mm = Number.NaN, yy = Number.NaN] = c.expiry.split("/").map(Number)
  if (!c.expiry.trim()) e.expiry = "Enter an expiry date"
  else if (!(mm >= 1 && mm <= 12) || !(yy >= 0)) e.expiry = "Use MM/YY"
  else {
    const [y = 0, m = 0] = today.split("-").map(Number)
    if (2000 + yy < y || (2000 + yy === y && mm < m))
      e.expiry = "This card has expired"
  }
  if (!digits(c.cvc)) e.cvc = "Enter a CVC"
  else if (digits(c.cvc).length < 3)
    e.cvc = "Enter the 3 or 4 digits on the back"
  return e
}

/** The brand a number's first digits say */
function cardBrand(number: string) {
  const d = digits(number)
  if (d.startsWith("4")) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard"
  if (/^3[47]/.test(d)) return "Amex"
  if (/^6(011|5)/.test(d)) return "Discover"
  return "Card"
}

/** How the page names a saved card: "Visa •••• 4242" (only the last four are ever kept) */
export const cardLabel = (number: string) =>
  `${cardBrand(number)} •••• ${digits(number).slice(-4)}`

/** The card preview's number: what's typed so far, the rest as dots, in groups of four */
export function previewNumber(number: string) {
  const d = digits(number).slice(0, 16).padEnd(16, "•")
  return d.replace(/(.{4})(?=.)/g, "$1 ")
}
