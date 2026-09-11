"use client"

import { useSyncExternalStore } from "react"

import { QUOTES, type Quote } from "@/data/quotes"

// The ledger both quote pages share for the visit: a quote saved on /quotes/new is in /quotes when you go back,
// and what the ledger's actions change stays changed. A reload starts again from the data's 16.
let quotes: Quote[] = QUOTES
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useQuotes = () =>
  useSyncExternalStore(
    subscribe,
    () => quotes,
    () => QUOTES
  )

export function updateQuotes(change: (all: Quote[]) => Quote[]) {
  quotes = change(quotes)
  for (const l of listeners) l()
}
