// Prices left at the door: the 16 quotes on /quotes, one for each household the reps have priced, the first prices that
// ran out, the drafts, and the ones signed this week. Amounts are the plans' first-year contract value (products.ts), as
// on the households (deals.ts); owners are the reps. Dates are ISO days in 2026, counted from the demo's today. And the
// new-quote form (/quotes/new), which prices a home line by line.

import { type PlanName, PRODUCTS } from "./products"
import { DEMO_TODAY } from "./workspace"

export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Expired"
  | "Withdrawn"
/** The main plan on the quote */
export type QuotePlan = PlanName

export type Quote = {
  /** Q-2026 … */
  id: string
  /** The homeowner it was left with */
  household: string
  /** The rep who priced it, under the homeowner's name */
  owner: string
  /** The home's street address */
  address: string
  /** The memo under the quote number: "Quarterly Pest + Mosquito Season" */
  memo: string
  plan: QuotePlan
  /** The first-year contract value, whole dollars */
  amount: number
  /** The household on the board (DEAL-301 is deal-301); null prints "No deal" */
  dealId: string | null
  /** When it was left; null for drafts */
  issued: string | null
  /** The end of its window; null for drafts */
  validUntil: string | null
  /** When the homeowner signed */
  accepted: string | null
  /** Days left in the window from QUOTES_TODAY ("Valid for 6d" is 6, "15d expired" is -15) */
  days: number | null
  status: QuoteStatus
}

/** The ledger's today: the demo's today (workspace.ts) */
export const QUOTES_TODAY = DEMO_TODAY
/** Days a price left at the door holds */
export const QUOTE_WINDOW = 14
/** When the season's signed quotes are reported: the week's pay run */
export const CLOSE_REPORT = "2026-07-24"

export const QUOTE_STATUSES: QuoteStatus[] = [
  "Accepted",
  "Sent",
  "Expired",
  "Draft",
  "Withdrawn",
]
export const QUOTE_PLANS: QuotePlan[] = [
  "Quarterly Pest",
  "Bi-Monthly Pest",
  "Mosquito Season",
  "Termite Monitoring",
  "Rodent Exclusion",
]
export const QUOTE_PLAN_DOT: Record<QuotePlan, string> = {
  "Quarterly Pest": "bg-emerald-500",
  "Bi-Monthly Pest": "bg-sky-500",
  "Mosquito Season": "bg-violet-500",
  "Termite Monitoring": "bg-amber-500",
  "Rodent Exclusion": "bg-rose-500",
}

/** The owner pickers (the Owner filter and the bulk bar's Assign owner): the nine reps */
export const QUOTE_OWNERS = [
  "Darnell Brooks",
  "Kirsten Vogt",
  "Kyle Bennett",
  "Ayesha Malik",
  "Toby Marsh",
  "Meera Iyer",
  "Sam Okafor",
  "Haruka Mori",
  "Owen Fletcher",
]
/** The bulk bar's owner before one is picked */
export const BULK_OWNER = "Darnell Brooks"
export const QUOTE_BULK_ACTIONS = [
  "Send quote",
  "Mark accepted",
  "Withdraw",
] as const
export type QuoteBulkAction = (typeof QUOTE_BULK_ACTIONS)[number]

const q = (
  id: string,
  household: string,
  owner: string,
  address: string,
  memo: string,
  plan: QuotePlan,
  amount: number,
  dealId: string | null,
  status: QuoteStatus,
  dates: {
    issued?: string
    validUntil?: string
    accepted?: string
    days?: number
  }
): Quote => ({
  id,
  household,
  owner,
  address,
  memo,
  plan,
  amount,
  dealId,
  issued: dates.issued ?? null,
  validUntil: dates.validUntil ?? null,
  accepted: dates.accepted ?? null,
  days: dates.days ?? null,
  status,
})

/** The 16 quotes: expired, sent by days left, drafts, accepted */
export const QUOTES: Quote[] = [
  q(
    "Q-2026",
    "Valentina Ospina",
    "Haruka Mori",
    "7719 E Palo Verde Dr",
    "First price · Bi-Monthly Pest",
    "Bi-Monthly Pest",
    573,
    "DEAL-203",
    "Expired",
    { issued: "2026-06-18", validUntil: "2026-07-02", days: -14 }
  ),
  q(
    "Q-2028",
    "Pablo Navarro",
    "Sam Okafor",
    "3310 W Desert Willow Ln",
    "Win-back · Bi-Monthly Pest",
    "Bi-Monthly Pest",
    573,
    "DEAL-103",
    "Expired",
    { issued: "2026-06-24", validUntil: "2026-07-08", days: -8 }
  ),
  q(
    "Q-2029",
    "Tamika Greene",
    "Kyle Bennett",
    "1240 S Riverbend Way",
    "Quarterly Pest · renews in September",
    "Quarterly Pest",
    625,
    null,
    "Sent",
    { issued: "2026-07-06", validUntil: "2026-07-20", days: 4 }
  ),
  q(
    "Q-2030",
    "Priya Nair",
    "Owen Fletcher",
    "5177 N 38th Pl",
    "Bi-Monthly Pest · for the owner",
    "Bi-Monthly Pest",
    573,
    null,
    "Sent",
    { issued: "2026-07-09", validUntil: "2026-07-23", days: 7 }
  ),
  q(
    "Q-2034",
    "Kenji Watanabe",
    "Toby Marsh",
    "4407 Pine Needle Ct",
    "Termite Monitoring",
    "Termite Monitoring",
    1335,
    "DEAL-202",
    "Sent",
    { issued: "2026-07-13", validUntil: "2026-07-27", days: 11 }
  ),
  q(
    "Q-2038",
    "Emeka Obi",
    "Owen Fletcher",
    "5122 N 38th Pl",
    "Quarterly Pest + Mosquito Season",
    "Quarterly Pest",
    1039,
    "DEAL-303",
    "Sent",
    { issued: "2026-07-13", validUntil: "2026-07-27", days: 11 }
  ),
  q(
    "Q-2035",
    "Valentina Ospina",
    "Haruka Mori",
    "7719 E Palo Verde Dr",
    "Re-quote · Bi-Monthly Pest",
    "Bi-Monthly Pest",
    573,
    "DEAL-203",
    "Sent",
    { issued: "2026-07-14", validUntil: "2026-07-28", days: 12 }
  ),
  q(
    "Q-2037",
    "Ingrid Nyberg",
    "Ayesha Malik",
    "305 Hollow Oak Ln",
    "Quarterly Pest + Rodent Exclusion",
    "Quarterly Pest",
    1494,
    "DEAL-302",
    "Sent",
    { issued: "2026-07-14", validUntil: "2026-07-28", days: 12 }
  ),
  q(
    "Q-2033",
    "Harriet Lawson",
    "Darnell Brooks",
    "612 N Cottonwood Bench Rd",
    "Quarterly Pest + Mosquito Season",
    "Quarterly Pest",
    1039,
    "DEAL-201",
    "Sent",
    { issued: "2026-07-15", validUntil: "2026-07-29", days: 13 }
  ),
  q(
    "Q-2036",
    "Graham Pritchard",
    "Kyle Bennett",
    "1180 S Riverbend Way",
    "Quarterly Pest · Saturday start",
    "Quarterly Pest",
    625,
    "DEAL-301",
    "Sent",
    { issued: "2026-07-15", validUntil: "2026-07-29", days: 13 }
  ),
  q(
    "Q-2031",
    "Dale Hutchins",
    "Meera Iyer",
    "1977 Glen Laurel Dr",
    "Quarterly Pest · left with a card",
    "Quarterly Pest",
    625,
    null,
    "Sent",
    { issued: "2026-07-15", validUntil: "2026-07-29", days: 13 }
  ),
  q(
    "Q-2039",
    "Pablo Navarro",
    "Sam Okafor",
    "3310 W Desert Willow Ln",
    "Win-back · initial waived",
    "Bi-Monthly Pest",
    474,
    "DEAL-103",
    "Draft",
    {}
  ),
  q(
    "Q-2040",
    "Layla Khoury",
    "Meera Iyer",
    "1906 Glen Laurel Dr",
    "Quarterly Pest + Mosquito Season",
    "Quarterly Pest",
    1039,
    "DEAL-102",
    "Draft",
    {}
  ),
  q(
    "Q-2024",
    "Chiara Romano",
    "Toby Marsh",
    "4415 Pine Needle Ct",
    "Quarterly Pest + Mosquito Season",
    "Quarterly Pest",
    1039,
    "DEAL-502",
    "Accepted",
    { issued: "2026-07-06", validUntil: "2026-07-20", accepted: "2026-07-09" }
  ),
  q(
    "Q-2025",
    "Margaret Doyle",
    "Darnell Brooks",
    "640 N Cottonwood Bench Rd",
    "Quarterly Pest + Termite Monitoring",
    "Quarterly Pest",
    1960,
    "DEAL-401",
    "Accepted",
    { issued: "2026-07-11", validUntil: "2026-07-25", accepted: "2026-07-14" }
  ),
  q(
    "Q-2027",
    "Joon Park",
    "Meera Iyer",
    "1942 Glen Laurel Dr",
    "Bi-Monthly Pest",
    "Bi-Monthly Pest",
    573,
    "DEAL-402",
    "Accepted",
    { issued: "2026-07-12", validUntil: "2026-07-26", accepted: "2026-07-14" }
  ),
]

// ——— /quotes/new ———

/** The Customer picker's households: the ones pitched and waiting on a callback, where a written price comes next. The
 * quote lands in the ledger under their rep. The form keeps the account number and address when the customer changes. */
export const QUOTE_CUSTOMERS = [
  {
    name: "Graham Pritchard",
    email: "graham.pritchard@example.org",
    owner: "Kyle Bennett",
    address: "1180 S Riverbend Way, Boise, ID 83706",
  },
  {
    name: "Ingrid Nyberg",
    email: "ingrid.nyberg@example.com",
    owner: "Ayesha Malik",
    address: "305 Hollow Oak Ln, Raleigh, NC 27615",
  },
  {
    name: "Emeka Obi",
    email: "emeka.obi@example.net",
    owner: "Owen Fletcher",
    address: "5122 N 38th Pl, Phoenix, AZ 85018",
  },
]

/** Every price is in dollars */
export type QuoteCurrency = "USD"
export const PAYMENT_TERMS = [
  "Autopay per service",
  "Autopay monthly",
  "Paid in full",
] as const
export const COLLECTIONS = [
  "Card on file",
  "Bank draft",
  "Pay at service",
] as const
/** Sales tax on service in percent; 0 prints "No tax" */
export const TAX_RATES = [0, 4.75, 6, 8.6] as const

/** A line a quote can carry: a plan's initial service, its recurring charge (priced for the year), or a one-time service */
export type QuoteItem = {
  id: string
  name: string
  /** The product it comes from (products.ts) */
  productId: string
  category: string
  /** The rate and quantity a new line starts with */
  price: number
  qty: number
  /** The info tip beside the line */
  note: string
}

const EVERY: Record<number, string> = {
  4: "every quarter",
  6: "every other month",
  12: "every month",
}

/** The quotable catalog as door-price lines: each plan's initial service and recurring charge, then the one-time services */
export const QUOTE_ITEMS: QuoteItem[] = PRODUCTS.filter(
  (p) => p.quotable
).flatMap((p): QuoteItem[] =>
  p.category === "One-time"
    ? [
        {
          id: p.id,
          name: p.name,
          productId: p.id,
          category: p.category,
          price: p.price,
          qty: 1,
          note: p.description ?? p.name,
        },
      ]
    : [
        ...(p.initial
          ? [
              {
                id: `${p.id}-initial`,
                name: `${p.name} · initial service`,
                productId: p.id,
                category: p.category,
                price: p.initial,
                qty: 1,
                note: "Charged once, at the first visit",
              },
            ]
          : []),
        {
          id: p.id,
          name: `${p.name} · ${p.id === "msq-season" ? "monthly in season" : (EVERY[p.charges] ?? "recurring")}`,
          productId: p.id,
          category: p.category,
          price: p.price,
          qty: p.charges,
          note: p.description ?? p.name,
        },
      ]
)

export type QuoteLine = {
  id: string
  productId: string
  qty: string
  rate: string
  tax: number
}

/** The form as it opens: Graham Pritchard's price, ready to leave at the door */
export const NEW_QUOTE = {
  customer: "Graham Pritchard",
  account: "RP-448107",
  number: "Q-2041",
  po: "DEAL-301",
  issued: "2026-07-16",
  validUntil: "2026-07-30",
  currency: "USD" as QuoteCurrency,
  terms: "Autopay per service",
  collection: "Card on file",
  billing: "1180 S Riverbend Way, Boise, ID 83706",
  lines: [
    {
      id: "line-1",
      productId: "qtr-pest-initial",
      qty: "1",
      rate: "149",
      tax: 6,
    },
    { id: "line-2", productId: "qtr-pest", qty: "4", rate: "119", tax: 6 },
  ] as QuoteLine[],
  memo: "Spiders on the porch and ants in the kitchen. Graham wants a Saturday first service.",
  footer:
    "Signing starts a three-business-day cancellation window. Ridgeline books the first service once it closes.",
  discount: "0",
}

/** The field tooltips */
export const QUOTE_FIELD_TIPS = {
  customer: "The homeowner the price is left with, printed on the agreement.",
  account: "Ridgeline's account number for the home, once it's signed.",
  number:
    "Keep this unique so the office and the homeowner's replies map back to it.",
}
