import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContactPage } from "@/components/contacts/contact-page"
import { CONTACT_BY_ID } from "@/data/contacts"

const idOf = (id: string) => (/^[1-9]\d*$/.test(id) ? Number(id) : null)

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const id = idOf((await params).id)
  const name = id ? CONTACT_BY_ID[id]?.name : undefined
  return { title: name ? `${name} · Contact` : "Contact" }
}

/** A homeowner: the data's 40, and any added on /contacts this visit */
export default async function Contact({ params }: PageProps<"/contacts/[id]">) {
  const id = idOf((await params).id)
  if (!id) notFound()
  return <ContactPage id={id} />
}
