import "server-only"
import { db } from "@/db"

import { seedDemoAccount } from "./seed-account"

// Once per server instance: the first sign-in page after a cold start checks the account, the rest reuse the answer
let ready: Promise<unknown> | undefined

/** The demo account exists with the demo password, so the sign-in card always works (a failed check retries next time) */
export function ensureDemoAccount() {
  ready ??= seedDemoAccount(db).catch((error) => {
    ready = undefined
    throw error
  })
  return ready
}
