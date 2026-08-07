// The demo account, created or brought up to date (name, email, the demo password), so running it again is safe. The
// password is hashed with Better Auth's own scrypt. Both `pnpm db:seed` and the sign-in page run it, so a freshly
// migrated database (a new Neon or Supabase project) needs no seed step.
import { hashPassword, verifyPassword } from "better-auth/crypto"
import { and, eq } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"

import { DEMO_ACCOUNT, DEMO_PASSWORD } from "../lib/demo-account"
import { authAccounts, authUsers } from "./schema"

/** Creates or updates the demo account; returns whether anything changed */
export async function seedDemoAccount<S extends Record<string, unknown>>(
  database: PgDatabase<PgQueryResultHKT, S>
) {
  const db = database as unknown as PgDatabase<PgQueryResultHKT>
  const now = new Date()
  const { id, name, email } = DEMO_ACCOUNT
  let changed = false

  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id))
  if (!user) {
    await db.insert(authUsers).values({
      id,
      name,
      email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    changed = true
  } else if (user.name !== name || user.email !== email) {
    await db
      .update(authUsers)
      .set({ name, email, updatedAt: now })
      .where(eq(authUsers.id, id))
    changed = true
  }

  const [account] = await db
    .select()
    .from(authAccounts)
    .where(
      and(
        eq(authAccounts.userId, id),
        eq(authAccounts.providerId, "credential")
      )
    )
  if (!account) {
    await db.insert(authAccounts).values({
      id: `${id}-credential`,
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword(DEMO_PASSWORD),
      createdAt: now,
      updatedAt: now,
    })
    changed = true
  } else if (
    !account.password ||
    !(await verifyPassword({ hash: account.password, password: DEMO_PASSWORD }))
  ) {
    await db
      .update(authAccounts)
      .set({ password: await hashPassword(DEMO_PASSWORD), updatedAt: now })
      .where(eq(authAccounts.id, account.id))
    changed = true
  }
  return changed
}
