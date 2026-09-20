import type { Metadata } from "next"

import { Contacts } from "@/components/contacts/contacts"

export const metadata: Metadata = { title: "Contacts" }

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Contacts → All Contacts; `?lifecycle=` and `?territory=` open it filtered */
export default async function ContactsPage({
  searchParams,
}: PageProps<"/contacts">) {
  const params = await searchParams
  return (
    <Contacts
      lifecycle={one(params.lifecycle)}
      territory={one(params.territory)}
    />
  )
}
