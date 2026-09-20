"use client"

import { useSyncExternalStore } from "react"

import { toast } from "@/components/ui/toast"
import { CONTACTS, type Contact } from "@/data/contacts"
import { TERRITORIES, type Territory } from "@/data/territories"
import { logText } from "@/lib/contacts"

// The directory the Contacts pages share for the visit: a homeowner added, reassigned, texted or deleted on /contacts
// is that way on their own page and on their territory's card, and a territory added on /territories is one to pick.
// A reload starts again from the data's 40 homeowners and nine territories.
let contacts: Contact[] = CONTACTS
let territories: Territory[] = TERRITORIES
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const emit = () => {
  for (const l of listeners) l()
}

export const useContacts = () =>
  useSyncExternalStore(
    subscribe,
    () => contacts,
    () => CONTACTS
  )
export const useTerritories = () =>
  useSyncExternalStore(
    subscribe,
    () => territories,
    () => TERRITORIES
  )

export function updateContacts(change: (all: Contact[]) => Contact[]) {
  contacts = change(contacts)
  emit()
}

export function updateContact(id: number, change: (c: Contact) => Contact) {
  updateContacts((all) => all.map((c) => (c.id === id ? change(c) : c)))
}

export function addTerritory(territory: Territory) {
  territories = [...territories, territory]
  emit()
}

/** Log text, from the row menu, the contact sheet or the contact's page: it goes on the timeline */
export function logTextFor(c: Contact) {
  updateContact(c.id, logText)
  toast.add({
    type: "success",
    title: "Text logged",
    description: `Texted ${c.name}. Next step: a callback.`,
  })
}
