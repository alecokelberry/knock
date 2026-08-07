import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SignInForm } from "@/components/auth/sign-in-form"
import { ensureDemoAccount } from "@/db/demo-account"
import { safeNextPath } from "@/lib/redirect"
import { getSession } from "@/lib/session"

export const metadata: Metadata = { title: "Sign in" }

/**
 * Sign-in. Someone already signed in goes straight on to where they were headed, or the Dashboard.
 * The demo account is seeded first if it isn't yet (a freshly migrated database), so the card always signs in.
 */
export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const asked = (await searchParams).next
  const next = asked ? safeNextPath(asked) : null
  const [session] = await Promise.all([getSession(), ensureDemoAccount()])
  if (session) redirect(next ?? "/")
  return <SignInForm next={next} />
}
