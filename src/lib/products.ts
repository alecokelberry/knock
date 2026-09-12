// Sales → Products: checking an edited cell or the Add product sheet, counting what's unsaved against the saved
// catalog, the row actions, the search and Status filter, and the CSV that Export writes and Import reads.

import {
  contractValue,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/data/products"
import { toCsv } from "@/lib/csv"

export type ProductField = "name" | "initial" | "price" | "charges"

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
export const money = (n: number) => USD.format(n)

/** "$1,250", "1,250" or "1250.40" as a number, or NaN */
const amount = (raw: string) => Number(raw.replace(/[$,\s]/g, ""))

/**
 * Parses an edited cell. A blank money or charges cell keeps the old value (null); money may be written "$1,500" and is
 * kept to whole dollars. The initial service may be $0 (Mosquito Season has none); a plan is charged at least once.
 */
export function parseProductField(
  field: ProductField,
  raw: string
): { value: string | number } | { error: string } | null {
  if (field === "name")
    return raw.trim() ? { value: raw.trim() } : { error: "Name is required." }
  if (!raw.trim()) return null
  const n = amount(raw)
  if (field === "initial" || field === "price") {
    if (!Number.isFinite(n)) return { error: "Enter a valid number." }
    if (n < 0) return { error: "Price cannot be negative." }
    return { value: Math.round(n) }
  }
  if (!Number.isInteger(n)) return { error: "Use a whole number." }
  if (n < 1) return { error: "Charges must be at least 1." }
  return { value: n }
}

export type ProductForm = {
  name: string
  sku: string
  category: ProductCategory
  initial: string
  price: string
  charges: string
  status: ProductStatus
  description: string
  quotable: boolean
}
export const EMPTY_PRODUCT_FORM: ProductForm = {
  name: "",
  sku: "",
  category: "Pest plan",
  initial: "",
  price: "",
  charges: "4",
  status: "Draft",
  description: "",
  quotable: false,
}

type ProductErrors = Partial<
  Record<"name" | "initial" | "price" | "charges", string>
>

/** The Add product sheet's checks: a name, a recurring price above 0, an initial of $0 or more, whole charges */
export function productErrors(f: ProductForm): ProductErrors {
  const e: ProductErrors = {}
  if (!f.name.trim()) e.name = "Enter a product name"
  const price = amount(f.price)
  if (!f.price.trim()) e.price = "Enter a price"
  else if (!Number.isFinite(price) || price <= 0)
    e.price = "Enter a price greater than 0"
  const initial = f.initial.trim() ? amount(f.initial) : 0
  if (!Number.isFinite(initial) || initial < 0) e.initial = "Enter $0 or more"
  const charges = f.charges.trim() ? amount(f.charges) : 1
  if (!Number.isInteger(charges)) e.charges = "Use a whole number"
  else if (charges < 1) e.charges = "Charges must be at least 1"
  return e
}

/** A product from the sheet; a blank SKU becomes NEW-0001, NEW-0002… */
export function newProduct(f: ProductForm, id: string, seq: number): Product {
  const sku =
    f.sku.trim().toUpperCase() || `NEW-${String(seq).padStart(4, "0")}`
  const description = f.description.trim()
  return {
    id,
    name: f.name.trim(),
    sku,
    category: f.category,
    initial: f.initial.trim() ? Math.round(amount(f.initial)) : 0,
    price: Math.round(amount(f.price)),
    charges: f.charges.trim() ? amount(f.charges) : 1,
    status: f.status,
    quotable: f.quotable,
    ...(description && { description }),
  }
}

/** The Product added toast's line: "Pest plan · Draft · $625 first year" */
export const productLine = (p: Product) =>
  `${p.category} · ${p.status} · ${money(contractValue(p))} first year`

const same = (a: Product, b: Product) =>
  (Object.keys({ ...a, ...b }) as (keyof Product)[]).every((k) => a[k] === b[k])

/** Rows changed, added or removed since the last save */
export function unsavedCount(saved: Product[], rows: Product[]) {
  const before = new Map(saved.map((r) => [r.id, r]))
  const now = new Set(rows.map((r) => r.id))
  return (
    rows.filter((r) => !before.has(r.id) || !same(before.get(r.id)!, r))
      .length + saved.filter((r) => !now.has(r.id)).length
  )
}

/** Whether a row differs from its saved version (a new row always does) */
export const isDirty = (saved: Product[], row: Product) => {
  const was = saved.find((r) => r.id === row.id)
  return !was || !same(was, row)
}

export const unsavedLabel = (n: number) =>
  n ? `${n} unsaved ${n === 1 ? "change" : "changes"}` : "All changes saved"

/** Duplicate: "<name> Copy", its SKU with "-C", as a draft reps can't quote yet, right under it */
export function duplicateProduct(
  rows: Product[],
  id: string,
  newId: string
): Product[] {
  const i = rows.findIndex((r) => r.id === id)
  const r = rows[i]
  if (!r) return rows
  return [
    ...rows.slice(0, i + 1),
    {
      ...r,
      id: newId,
      name: `${r.name} Copy`,
      sku: `${r.sku}-C`,
      status: "Draft",
      quotable: false,
    },
    ...rows.slice(i + 1),
  ]
}

/** The search (name, SKU or category) and the Status filter */
export function filterProducts(
  rows: Product[],
  query: string,
  statuses: ProductStatus[]
) {
  const q = query.trim().toLowerCase()
  return rows.filter(
    (r) =>
      (!q ||
        [r.name, r.sku, r.category].some((s) => s.toLowerCase().includes(q))) &&
      (!statuses.length || statuses.includes(r.status))
  )
}

const HEADERS = [
  "Name",
  "SKU",
  "Category",
  "Initial",
  "Price",
  "Charges",
  "Status",
  "Quotable",
  "Description",
]

/** What Export downloads, and the shape Import reads back: the catalog as it stands on screen */
export function productsCsv(rows: Product[]): string {
  return toCsv([
    HEADERS,
    ...rows.map((r) => [
      r.name,
      r.sku,
      r.category,
      r.initial,
      r.price,
      r.charges,
      r.status,
      r.quotable ? "Yes" : "No",
      r.description ?? "",
    ]),
  ])
}

/** Splits CSV text into rows of fields (quoted fields, doubled quotes and line breaks inside quotes) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field || row.length) rows.push([...row, field])
  return rows.filter((r) => r.some((f) => f.trim()))
}

const pick = <T extends string>(
  options: readonly T[],
  raw: string | undefined,
  fallback: T
): T =>
  options.find((o) => o.toLowerCase() === raw?.trim().toLowerCase()) ?? fallback

/**
 * Import: each CSV row with a name updates the product with its SKU, or adds one. Columns are found by their
 * header (Export's), in any order; what a row leaves out keeps the product's value, or the sheet's default.
 */
export function importProducts(
  rows: Product[],
  text: string,
  nextId: () => string,
  nextSeq: () => number
): { rows: Product[]; added: number; updated: number } {
  const [head, ...lines] = parseCsv(text)
  const col = (name: string) =>
    head?.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase()) ?? -1
  const at = (line: string[], name: string) =>
    col(name) >= 0 ? line[col(name)]?.trim() : undefined
  let next = rows
  let added = 0
  let updated = 0
  for (const line of lines) {
    const name = at(line, "Name")
    const sku = at(line, "SKU")?.toUpperCase()
    const old = sku ? next.find((r) => r.sku === sku) : undefined
    if (!name && !old) continue
    const initial = amount(at(line, "Initial") ?? "")
    const price = amount(at(line, "Price") ?? "")
    const charges = amount(at(line, "Charges") ?? "")
    const quotable = at(line, "Quotable")
    const base: Product = old ?? {
      id: nextId(),
      name: "",
      sku: sku || `NEW-${String(nextSeq()).padStart(4, "0")}`,
      category: "Pest plan",
      initial: 0,
      price: 0,
      charges: 1,
      status: "Draft",
      quotable: false,
    }
    const description = at(line, "Description")
    const product: Product = {
      ...base,
      name: name || base.name,
      category: pick(PRODUCT_CATEGORIES, at(line, "Category"), base.category),
      initial:
        Number.isFinite(initial) && initial >= 0 && at(line, "Initial")
          ? Math.round(initial)
          : base.initial,
      price:
        Number.isFinite(price) && price >= 0 && at(line, "Price")
          ? Math.round(price)
          : base.price,
      charges:
        Number.isInteger(charges) && charges >= 1 ? charges : base.charges,
      status: pick(PRODUCT_STATUSES, at(line, "Status"), base.status),
      quotable: quotable ? /^(yes|true|1|y)$/i.test(quotable) : base.quotable,
      ...(description ? { description } : {}),
    }
    if (old) {
      next = next.map((r) => (r.id === old.id ? product : r))
      updated++
    } else {
      next = [product, ...next]
      added++
    }
  }
  return { rows: next, added, updated }
}
