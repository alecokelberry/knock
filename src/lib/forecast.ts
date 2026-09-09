// Pipeline → Forecast: the season's call for a set of categories, the books table's filters, and the Export CSV.

import {
  FORECAST_BOOKS,
  type ForecastBook,
  type ForecastCategory,
} from "@/data/forecast"
import { toCsv } from "@/lib/csv"

const SHORT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumSignificantDigits: 3,
})
/** "$3.2M", "$1.38M", "$934K" */
export const shortMoney = (n: number) => SHORT.format(n)

export const weighted = (d: ForecastBook) =>
  Math.round((d.amount * d.probability) / 100)
const openTotal = (deals: readonly ForecastBook[]) =>
  deals.reduce((s, d) => s + d.amount, 0)

/** The call: each counted category's accounts, value and share of the call, the total, and its share of all that's open */
export function forecastCall(
  categories: readonly ForecastCategory[],
  deals: readonly ForecastBook[] = FORECAST_BOOKS
) {
  const rows = categories.map((category) => {
    const mine = deals.filter((d) => d.category === category)
    return {
      category,
      accounts: mine.reduce((s, d) => s + d.accounts, 0),
      value: openTotal(mine),
    }
  })
  const total = rows.reduce((s, r) => s + r.value, 0)
  const open = openTotal(deals)
  return {
    rows: rows.map((r) => ({
      ...r,
      share: Math.round((r.value / total) * 100),
    })),
    total,
    ofOpen: Math.round((total / open) * 100),
    remainder: open - total,
  }
}

/** A book's text for the filter bar's fields */
export function forecastField(d: ForecastBook, field: string): string {
  const read: Record<string, string> = {
    book: `${d.owner} ${d.office} ${d.stage}`,
    office: d.office,
    category: d.category,
    stage: d.stage,
    owner: d.owner,
    movement: d.movement,
  }
  return read[field] ?? ""
}

/** What Export downloads: every book in the forecast */
export function forecastCsv(
  books: readonly ForecastBook[] = FORECAST_BOOKS
): string {
  return toCsv([
    [
      "Rep",
      "Office",
      "Stage",
      "Category",
      "Accounts",
      "Amount",
      "Weighted",
      "Probability",
      "Next",
      "Movement",
    ],
    ...books.map((d) => [
      d.owner,
      d.office,
      d.stage,
      d.category,
      d.accounts,
      d.amount,
      weighted(d),
      `${d.probability}%`,
      d.next,
      d.movement,
    ]),
  ])
}
