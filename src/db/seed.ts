// `pnpm db:seed`: the demo account (src/db/seed-account.ts), against DATABASE_URL or Postgres.app. Run after
// `pnpm db:migrate`. The sign-in page seeds it too, so this is for a database you want ready before anyone visits.
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { DEMO_ACCOUNT } from "../lib/demo-account"
import { databaseUrl } from "./database-url"
import { seedDemoAccount } from "./seed-account"

// A function, not top-level await: tsx runs this file as CommonJS
async function seed() {
  const pool = new Pool({
    connectionString: databaseUrl({ direct: true }),
    max: 1,
  })
  try {
    const changed = await seedDemoAccount(drizzle({ client: pool }))
    console.info(
      `${changed ? "Seeded" : "Already seeded:"} ${DEMO_ACCOUNT.name} <${DEMO_ACCOUNT.email}>.`
    )
  } finally {
    await pool.end()
  }
}

void seed()
