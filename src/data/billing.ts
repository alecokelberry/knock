// Settings → Billing: Vantage's Knock subscription (16 seats on Growth, seasonal), usage, billing details and invoice
// history: seats rise for the summer and fall back after it.

type InvoiceStatus = "Paid" | "Credited"
export type Invoice = {
  id: string
  period: string
  date: string
  total: number
  status: InvoiceStatus
}

export const PLAN = {
  name: "Knock Growth",
  badge: "Monthly",
  price: 32,
  unit: "per seat / month",
  blurb:
    "Growth keeps household history, pipeline automations and office permissions on one monthly plan, with seats that follow the season.",
  renewalDate: "Aug 3, 2026",
  renewalDateLong: "August 3, 2026",
  billingOwner: "Tessa Calloway",
}

export type UsageMeter = {
  id: string
  label: string
  note: string
  value: string
  icon: "users" | "file-text" | "circle-dollar-sign"
}

export const USAGE: UsageMeter[] = [
  {
    id: "seats",
    label: "Seats",
    note: "Active this month",
    value: "16 of 20",
    icon: "users",
  },
  {
    id: "contacts",
    label: "Tracked households",
    note: "Of 50,000 on the plan",
    value: "24,160",
    icon: "file-text",
  },
  {
    id: "credits",
    label: "Text credits",
    note: "Used this month",
    value: "8,420",
    icon: "circle-dollar-sign",
  },
]

export type BillingDetails = { contact: string; entity: string; region: string }

export const BILLING_DETAILS: BillingDetails = {
  contact: "billing@vantage.example",
  entity: "Vantage Marketing",
  region: "Provo, United States",
}

/** The Region select in Edit billing details */
export const BILLING_REGIONS = [
  "Provo, United States",
  "Salt Lake City, United States",
  "London, United Kingdom",
  "Berlin, Germany",
  "Singapore",
]

/** The (i) tooltips beside Billing contact, Region and Payment method */
export const BILLING_TIPS = {
  contact:
    "Use a shared finance inbox so billing messages do not depend on one person.",
  region:
    "Region drives tax treatment, receipt language, and billing portal defaults.",
  payment:
    "A company card is required before renewal, seat changes, or usage upgrades can process.",
}

export const INVOICES: Invoice[] = [
  {
    id: "INV-2148",
    period: "Jul 2026",
    date: "Jul 2, 2026",
    total: 512,
    status: "Paid",
  },
  {
    id: "INV-2079",
    period: "Jun 2026",
    date: "Jun 2, 2026",
    total: 512,
    status: "Paid",
  },
  {
    id: "INV-1994",
    period: "May 2026",
    date: "May 2, 2026",
    total: 448,
    status: "Paid",
  },
  {
    id: "INV-1902",
    period: "Apr 2026",
    date: "Apr 2, 2026",
    total: 0,
    status: "Credited",
  },
  {
    id: "INV-1815",
    period: "Mar 2026",
    date: "Mar 2, 2026",
    total: 128,
    status: "Paid",
  },
  {
    id: "INV-1727",
    period: "Feb 2026",
    date: "Feb 2, 2026",
    total: 128,
    status: "Paid",
  },
]
