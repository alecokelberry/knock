// Sign-in with Better Auth 1.7: email and password against Postgres, sessions in the database, no sign-up (the demo
// account comes from the seed, `pnpm db:seed`)
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import { authSchema } from "@/db/schema"
import { env } from "@/lib/env"

/** Where sign-in may be served from: `pnpm dev` on :3002, and the browser tests' production build on :3102 */
const LOCAL = ["localhost", "*.local", "192.168.*.*", "10.*.*.*"].flatMap(
  (host) => [`${host}:3002`, `${host}:3102`]
)

/** And on Vercel: this deployment, its branch and the production domain, plus a custom domain if there is one */
const DEPLOYED = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  env.BETTER_AUTH_URL && new URL(env.BETTER_AUTH_URL).host,
].filter((host): host is string => Boolean(host))

const HOSTS = [...LOCAL, ...DEPLOYED]

export const auth = betterAuth({
  appName: "Knock",
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  // A working day, not a week. The signed cookie cache answers the session check for 5 minutes without a database
  // read; signing out clears it at once.
  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
    cookieCache: { enabled: true, maxAge: 60 * 5, strategy: "compact" },
  },
  // The base URL follows the request's host, from this list only
  baseURL: {
    allowedHosts: HOSTS,
    protocol: "auto",
    fallback: env.BETTER_AUTH_URL ?? "http://localhost:3002",
  },
  trustedOrigins: HOSTS.map((host) =>
    /:3[01]02$/.test(host) ? `http://${host}` : `https://${host}`
  ),
  // Keyed by IP: 20 a minute still stops guessing (Better Auth's default for sign-in is 3 per 10 seconds)
  rateLimit: {
    enabled: true,
    customRules: { "/sign-in/email": { window: 60, max: 20 } },
  },
  telemetry: { enabled: false },
  // Server code that signs in or out sets its cookies through Next
  plugins: [nextCookies()],
})
