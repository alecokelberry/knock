// The demo's one account: an invented person and a password that is in the code on purpose. This is a portfolio demo,
// so anyone looking at it should be able to get in with one tap.
import { CURRENT_USER } from "@/data/workspace"

/** The demo password (at least 12 characters, as `auth.ts` asks) */
export const DEMO_PASSWORD = "knock-demo-2026"

/** Who the sign-in card signs in as */
export const DEMO_ACCOUNT = {
  id: CURRENT_USER.id,
  name: CURRENT_USER.name,
  email: CURRENT_USER.email,
  title: CURRENT_USER.role,
}
