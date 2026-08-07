// The session, checked where the pages are drawn (Next's data access layer pattern): the shell's layout calls
// `requireUser`, so a missing or expired session never sees the app even if a page slipped past the proxy's cookie
// check. `cache` makes it one lookup per request.
import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "@/lib/auth"

/** The signed-in session, or null */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
)

export type User = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"]

/** The signed-in user; anyone else is sent to sign in */
export async function requireUser(): Promise<User> {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session.user
}
