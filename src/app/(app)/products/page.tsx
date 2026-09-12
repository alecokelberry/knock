import type { Metadata } from "next"

import { Products } from "@/components/sales/products"

export const metadata: Metadata = { title: "Products" }

/** Sales → Products */
export default function ProductsPage() {
  return <Products />
}
