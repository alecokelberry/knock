import {
  ACTIVITY_GROUPS,
  type Activity,
  type ActivityGroup,
} from "@/data/activities"

/** The tabs after All map to the activity's kind; "All" keeps everything */
export type ActivityTab = "All" | Activity["kind"]
export const ALL_OWNERS = "all"

/** The list for a tab and an owner ("all" keeps every owner), in the data's order */
export function filterActivities(
  list: Activity[],
  tab: ActivityTab,
  owner: string
): Activity[] {
  return list.filter(
    (a) =>
      (tab === "All" || a.kind === tab) &&
      (owner === ALL_OWNERS || a.ownerId === owner)
  )
}

/** The groups that have something in them, in Today / Yesterday / This week / Earlier order */
export function groupActivities(
  list: Activity[]
): { group: ActivityGroup; items: Activity[] }[] {
  return ACTIVITY_GROUPS.map((group) => ({
    group,
    items: list.filter((a) => a.group === group),
  })).filter((g) => g.items.length > 0)
}

/** "16 activities in view.", "1 activity in view." */
export const inViewLabel = (n: number) =>
  `${n} ${n === 1 ? "activity" : "activities"} in view.`

/** The word the empty state uses for a tab: "No note activity logged for this filter." */
const TAB_WORD: Record<Exclude<ActivityTab, "All">, string> = {
  Doors: "door",
  Callbacks: "callback",
  Texts: "text",
  Services: "service",
  Notes: "note",
}
export function emptyDescription(tab: ActivityTab): string {
  const word = tab === "All" ? "" : `${TAB_WORD[tab]} `
  return `No ${word}activity logged for this filter. Knocks, callbacks and services land here as the reps work their territories.`
}

/** The toast after Log activity: "Knock · Pitched · Darnell Brooks" */
export const loggedDescription = (
  type: string,
  outcome: string,
  owner: string
) => [type, outcome, owner].join(" · ")

const LOGGED_DOT = "bg-muted-foreground/60"

/** The outcome's dot, as the Outcome select and the badges show it */
export const OUTCOME_DOT: Record<string, string> = {
  Logged: LOGGED_DOT,
  Pitched: "bg-success",
  Signed: "bg-success",
  "Callback set": "bg-primary",
  "Not home": "bg-warning",
  "Not interested": "bg-muted-foreground/60",
}

/** A status dot's class picks the badge's tone */
export function statusVariant(
  dot: string
): "success-light" | "warning-light" | "primary-light" | "secondary" {
  if (dot === "bg-success") return "success-light"
  if (dot === "bg-warning") return "warning-light"
  if (dot === "bg-primary") return "primary-light"
  return "secondary"
}

/**
 * Which days and details the timeline shows open, kept as React state: a day keeps its fold and its
 * items keep their details open or shut for as long as the day stays on screen in the same shape (a lone item has no
 * fold, so a day going from one item to several, or back, starts afresh). Anything newly shown opens its details
 * while fewer than two items above it are open, which is why the first two open on load.
 */
export type TimelineView = {
  shape: Partial<Record<ActivityGroup, boolean>>
  folded: ActivityGroup[]
  open: Record<string, boolean>
}
type Groups = ReturnType<typeof groupActivities>

/** The view for these groups, carried over from the last one */
export function settleTimeline(
  prev: TimelineView | null,
  groups: Groups
): TimelineView {
  const view: TimelineView = { shape: {}, folded: [], open: {} }
  let opened = 0
  for (const { group, items } of groups) {
    const foldable = items.length > 1
    view.shape[group] = foldable
    const kept = prev?.shape[group] === foldable
    if (kept && prev.folded.includes(group)) {
      view.folded.push(group)
      continue
    }
    for (const a of items) {
      const open = (kept ? prev.open[a.id] : undefined) ?? opened < 2
      view.open[a.id] = open
      if (open) opened++
    }
  }
  return view
}

/** Fold a day away (its items forget their details) or open it again (they start afresh) */
export function foldDay(
  view: TimelineView,
  groups: Groups,
  group: ActivityGroup,
  fold: boolean
): TimelineView {
  const items = groups.find((g) => g.group === group)?.items ?? []
  const open = Object.fromEntries(
    Object.entries(view.open).filter(([id]) => !items.some((a) => a.id === id))
  )
  const folded = fold
    ? [...view.folded, group]
    : view.folded.filter((g) => g !== group)
  return settleTimeline({ ...view, open, folded }, groups)
}

const KIND_OF_TYPE: Record<string, Activity["kind"]> = {
  Knock: "Doors",
  Callback: "Callbacks",
  Text: "Texts",
  Service: "Services",
  Note: "Notes",
}
const ICON_OF_TYPE: Record<string, string> = {
  Knock: "door-open",
  Callback: "phone-call",
  Text: "message-square",
  Service: "spray-can",
  Note: "notebook-pen",
}

/** The next reference after the highest one: ACT-2842 */
const nextActivityId = (list: Activity[]) =>
  `ACT-${Math.max(0, ...list.map((a) => Number(a.id.slice(4)))) + 1}`

/** "9:12 AM" for a clock time */
const clockTime = (at: Date) =>
  at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

/** What the Log activity sheet records, as a timeline item */
export type LoggedActivity = {
  type: string
  summary: string
  notes: string
  outcome: string
  ownerId: string
  ownerRole: string
  household: string
  address: string
  when: string
  time: string
}
export function loggedActivity(
  list: Activity[],
  f: LoggedActivity,
  now: Date
): Activity {
  const household = f.household.trim()
  return {
    id: nextActivityId(list),
    group: ACTIVITY_GROUPS.find((g) => g === f.when) ?? "Today",
    kind: KIND_OF_TYPE[f.type] ?? "Notes",
    title: f.summary.trim(),
    status: f.outcome,
    dot: OUTCOME_DOT[f.outcome] ?? LOGGED_DOT,
    icon: ICON_OF_TYPE[f.type] ?? "notebook-pen",
    household: household || "No homeowner",
    address: f.address.trim(),
    time: f.time.trim() || clockTime(now),
    text: f.notes.trim() || f.summary.trim(),
    ownerId: f.ownerId,
    ownerRole: f.ownerRole,
    defaultOpen: true,
  }
}
