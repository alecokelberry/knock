import { describe, expect, it } from "vitest"

import { contractValue, PLAN_VALUE, PRODUCTS } from "@/data/products"

import {
  duplicateProduct,
  EMPTY_PRODUCT_FORM,
  filterProducts,
  importProducts,
  newProduct,
  parseCsv,
  parseProductField,
  productErrors,
  productLine,
  productsCsv,
  unsavedCount,
  unsavedLabel,
} from "./products"

describe("products", () => {
  it("values a plan's first year as the initial plus a year of charges", () => {
    expect(PLAN_VALUE).toEqual({
      "Quarterly Pest": 625,
      "Bi-Monthly Pest": 573,
      "Mosquito Season": 414,
      "Termite Monitoring": 1335,
      "Rodent Exclusion": 869,
    })
    expect(contractValue({ initial: 0, price: 175, charges: 1 })).toBe(175)
  })

  it("checks edited cells", () => {
    expect(parseProductField("name", "  ")).toEqual({
      error: "Name is required.",
    })
    expect(parseProductField("name", "  Spaced  ")).toEqual({ value: "Spaced" })
    expect(parseProductField("price", "abc")).toEqual({
      error: "Enter a valid number.",
    })
    expect(parseProductField("initial", "-5")).toEqual({
      error: "Price cannot be negative.",
    })
    expect(parseProductField("initial", "0")).toEqual({ value: 0 })
    expect(parseProductField("price", "1.5")).toEqual({ value: 2 })
    expect(parseProductField("price", "$1,500")).toEqual({ value: 1500 })
    expect(parseProductField("price", "")).toBeNull()
    expect(parseProductField("charges", "0")).toEqual({
      error: "Charges must be at least 1.",
    })
    expect(parseProductField("charges", "2.5")).toEqual({
      error: "Use a whole number.",
    })
    expect(parseProductField("charges", " 12 ")).toEqual({ value: 12 })
  })

  it("checks the Add product sheet and makes the row", () => {
    expect(productErrors(EMPTY_PRODUCT_FORM)).toEqual({
      name: "Enter a product name",
      price: "Enter a price",
    })
    expect(
      productErrors({
        ...EMPTY_PRODUCT_FORM,
        name: "X",
        price: "abc",
        initial: "-1",
        charges: "0",
      })
    ).toEqual({
      price: "Enter a price greater than 0",
      initial: "Enter $0 or more",
      charges: "Charges must be at least 1",
    })
    const p = newProduct(
      {
        ...EMPTY_PRODUCT_FORM,
        name: "Spider Sweep",
        initial: "99",
        price: "65",
      },
      "n1",
      1
    )
    expect(p).toMatchObject({
      sku: "NEW-0001",
      initial: 99,
      price: 65,
      charges: 4,
      status: "Draft",
      quotable: false,
    })
    expect(productLine(p)).toBe("Pest plan · Draft · $359 first year")
  })

  it("counts unsaved changes, duplicates as a draft copy, and filters", () => {
    const edited = PRODUCTS.map((r) =>
      r.sku === "RPC-TRM" ? { ...r, status: "Archived" as const } : r
    )
    expect(unsavedLabel(unsavedCount(PRODUCTS, edited))).toBe(
      "1 unsaved change"
    )
    expect(unsavedLabel(unsavedCount(PRODUCTS, PRODUCTS))).toBe(
      "All changes saved"
    )
    const copied = duplicateProduct(PRODUCTS, "trm-mon", "c1")
    expect(copied[4]).toMatchObject({
      name: "Termite Monitoring Copy",
      sku: "RPC-TRM-C",
      status: "Draft",
      quotable: false,
    })
    expect(unsavedCount(PRODUCTS, copied)).toBe(1)
    expect(filterProducts(PRODUCTS, "pest", []).map((r) => r.sku)).toEqual([
      "RPC-QTR",
      "RPC-BIM",
    ])
    expect(filterProducts(PRODUCTS, "one-time", []).map((r) => r.sku)).toEqual([
      "RPC-WSP",
      "RPC-FLE",
      "RPC-BED",
    ])
    expect(filterProducts(PRODUCTS, "", ["Draft"]).map((r) => r.sku)).toEqual([
      "RPC-BED",
    ])
  })

  it("imports what Export writes, updating by SKU and adding the rest", () => {
    expect(parseCsv('a,"b, c","d ""e"""\r\n1,2,3\n')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "2", "3"],
    ])
    let id = 0
    const same = importProducts(
      PRODUCTS,
      productsCsv(PRODUCTS),
      () => `i${++id}`,
      () => ++id
    )
    expect(same).toMatchObject({ added: 0, updated: 8 })
    expect(unsavedCount(PRODUCTS, same.rows)).toBe(0)
    const csv =
      'SKU,Name,Initial,Price,Status\nRPC-QTR,Quarterly Pest,129,109,Active\n,Spider Sweep,,"65",Active\n'
    const out = importProducts(
      PRODUCTS,
      csv,
      () => "new",
      () => 1
    )
    expect(out).toMatchObject({ added: 1, updated: 1 })
    expect(out.rows[0]).toMatchObject({
      name: "Spider Sweep",
      sku: "NEW-0001",
      initial: 0,
      price: 65,
      status: "Active",
    })
    expect(out.rows.find((r) => r.sku === "RPC-QTR")).toMatchObject({
      initial: 129,
      price: 109,
    })
  })
})
