<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Knock

A CRM for a sales team: Home (dashboard, today, activity feed, quick stats, attainment, quota plan), Sales (deal
board, forecast, quotes, products, approvals), Activities, Contacts and Settings. Synthetic data only. If
`NOTES.local.md` exists, read it first: it holds the working notes and decisions that aren't committed.

## Commands

- `pnpm bootstrap`: sets the app up on a Mac with Postgres.app (env, database, migrations, seed, browsers).
- `pnpm dev`: http://localhost:3002. One dev server at a time.
- `pnpm check`: typecheck, lint, format, unused code, unit tests. Run it before every commit.
- `pnpm test:e2e`: every page in Playwright with axe, desktop and phone, against a production build on :3102.
- `pnpm db:generate` after a schema change, read the SQL in `drizzle/`, then `pnpm db:migrate`. Never
  `drizzle-kit push`. `pnpm db:seed` creates the demo account.

## How the code is laid out

- `src/app/(app)/<page>/`: the pages. The layout checks the session and draws the rail, each app's sidebar and
  the top bar.
- `src/data/`: the company's world, typed. The deals (`deals.ts`) are the source of truth: contacts, companies,
  forecast, quotes and the dashboard add up from them, on one demo day (`DEMO_TODAY`, `data/workspace.ts`).
  Interactions keep their state in the browser; a reload starts again from the data.
- `src/db/`: Postgres holds Better Auth's tables. `schema.ts`, `index.ts` (`pg` with `attachDatabasePool`),
  the demo account's seed.
- `src/lib/`: pure logic, a `.test.ts` beside each module. `env.ts` holds every env var; add new ones there and
  to `.env.example`.
- `src/components/ui/`: shadcn's components and the vendored ones built on them (data grid, kanban, timeline,
  frame). `components/shell/`: the app frame. `components/shared/`: pieces used across pages. One folder per app
  for the rest.
- Tests: `*.test.ts` beside the code (Vitest; each file gets its own copy of a migrated Postgres template);
  `e2e/*.spec.ts` (Playwright; add a page to `e2e/routes.ts`).

## Rules

- **Auth is checked where data is read**, never only in `proxy.ts`: the app's layout calls `requireUser()`.
  A server action, when one is added, comes from `authActionClient` with a Zod input schema.
- **One data world.** New data joins `src/data/` and counts from the deals where it can; the tests hold the totals
  together.
- **UI from components.** Compose screens from `components/ui/` (shadcn on Base UI: custom triggers use `render`,
  not `asChild`). Color through the theme tokens in `src/app/globals.css`. Contrast meets WCAG AA.
- The React Compiler memoizes: no `useMemo`/`useCallback` except where an effect needs a stable value. Vendored
  files that wrap TanStack Table or dnd-kit keep `"use no memo"`.

## Working

- Before calling UI work done, look at it in the browser at 1440 wide and on a phone, light and dark, and try every
  control. Before any commit, `pnpm check` passes.
- Conventional Commits (`feat(sales): …`), one change per commit, staged by path. Never push or deploy: the owner
  does both (Vercel with Neon, `docs/deployment.md`).
