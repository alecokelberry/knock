// Vantage's service plans and one-time services, what a rep prices at the door. A plan is an initial service plus a
// recurring charge; its first-year contract value (lib/products.ts `contractValue`) is the initial service plus a year of
// the recurring charge. The households (deals.ts) are priced from these. Money is whole US dollars.

export const PRODUCT_STATUSES = ["Active", "Draft", "Archived"] as const
export const PRODUCT_CATEGORIES = [
  "Pest plan",
  "Specialty",
  "One-time",
] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export type Product = {
  id: string
  name: string
  sku: string
  category: ProductCategory
  /** The initial service, charged once when the technician first treats the home */
  initial: number
  /** Each recurring charge */
  price: number
  /** Recurring charges in the first year: 4 is quarterly, 6 every other month (or monthly through mosquito season), 12 monthly */
  charges: number
  status: ProductStatus
  /** The Quotable switch (the add sheet's "Visible on quotes") */
  quotable: boolean
  /** What it is, in a line (the add sheet's Description) */
  description?: string
}

/** The catalog: the pest plans, then the specialty plans, then the one-time services */
export const PRODUCTS: Product[] = [
  {
    id: "qtr-pest",
    name: "Quarterly Pest",
    sku: "RPC-QTR",
    category: "Pest plan",
    initial: 149,
    price: 119,
    charges: 4,
    status: "Active",
    quotable: true,
    description:
      "Inside and out on the first visit, then the exterior every quarter; free re-treats between visits",
  },
  {
    id: "bim-pest",
    name: "Bi-Monthly Pest",
    sku: "RPC-BIM",
    category: "Pest plan",
    initial: 99,
    price: 79,
    charges: 6,
    status: "Active",
    quotable: true,
    description:
      "The exterior every other month, for homes that see ants and spiders all year",
  },
  {
    id: "msq-season",
    name: "Mosquito Season",
    sku: "RPC-MSQ",
    category: "Specialty",
    initial: 0,
    price: 69,
    charges: 6,
    status: "Active",
    quotable: true,
    description: "The yard treated monthly from April to September",
  },
  {
    id: "trm-mon",
    name: "Termite Monitoring",
    sku: "RPC-TRM",
    category: "Specialty",
    initial: 795,
    price: 45,
    charges: 12,
    status: "Active",
    quotable: true,
    description:
      "Bait stations around the foundation, checked and renewed; billed monthly",
  },
  {
    id: "rod-exc",
    name: "Rodent Exclusion",
    sku: "RPC-ROD",
    category: "Specialty",
    initial: 449,
    price: 35,
    charges: 12,
    status: "Active",
    quotable: true,
    description:
      "Entry points sealed on the first visit, then monthly trap monitoring",
  },
  {
    id: "wsp-rmv",
    name: "Wasp Nest Removal",
    sku: "RPC-WSP",
    category: "One-time",
    initial: 0,
    price: 175,
    charges: 1,
    status: "Active",
    quotable: true,
    description: "Nests at the eaves and in the yard, removed and treated",
  },
  {
    id: "flea",
    name: "Flea Treatment",
    sku: "RPC-FLE",
    category: "One-time",
    initial: 0,
    price: 225,
    charges: 1,
    status: "Active",
    quotable: true,
    description: "Inside and the yard, with a follow-up two weeks later",
  },
  {
    id: "bed-bug",
    name: "Bed Bug Heat Treatment",
    sku: "RPC-BED",
    category: "One-time",
    initial: 0,
    price: 1150,
    charges: 1,
    status: "Draft",
    quotable: false,
    description:
      "A whole-home heat treatment; the office prices it after an inspection",
  },
]

/** A plan's first-year contract value: the initial service plus a year of the recurring charge */
export const contractValue = (
  p: Pick<Product, "initial" | "price" | "charges">
) => p.initial + p.price * p.charges

/** The plans a rep sells at the door, by name */
export const PLAN_NAMES = [
  "Quarterly Pest",
  "Bi-Monthly Pest",
  "Mosquito Season",
  "Termite Monitoring",
  "Rodent Exclusion",
] as const
export type PlanName = (typeof PLAN_NAMES)[number]

/** Each plan's first-year contract value */
export const PLAN_VALUE = Object.fromEntries(
  PLAN_NAMES.map((n) => [n, contractValue(PRODUCTS.find((p) => p.name === n)!)])
) as Record<PlanName, number>
