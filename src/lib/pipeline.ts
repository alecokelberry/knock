import {
  DEAL_STAGES,
  type Deal,
  type DealStageId,
  type DealStatus,
  type DealType,
} from "@/data/deals"
import { PLAN_VALUE, type PlanName } from "@/data/products"
import type { Market } from "@/data/team"
import { TERRITORIES } from "@/data/territories"

export type ProbTone = {
  text: string
  bar: string
  /** The band's base class, as the data records it */
  band: Deal["probTone"]
}

/**
 * The odds bands, as the board renders them: under 35 amber, 35 to 54 violet, 55 to 69 sky, 70 and up emerald. The
 * figure's ink is a shade darker than the band's base where the base misses AA contrast.
 */
export function probTone(pct: number): ProbTone {
  if (pct < 35)
    return {
      text: "text-amber-700 dark:text-amber-400",
      bar: "**:data-[slot=progress-indicator]:bg-amber-500",
      band: "text-amber-600",
    }
  if (pct < 55)
    return {
      text: "text-violet-600 dark:text-violet-400",
      bar: "**:data-[slot=progress-indicator]:bg-violet-500",
      band: "text-violet-600",
    }
  if (pct < 70)
    return {
      text: "text-sky-700 dark:text-sky-400",
      bar: "**:data-[slot=progress-indicator]:bg-sky-500",
      band: "text-sky-600",
    }
  return {
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "**:data-[slot=progress-indicator]:bg-emerald-500",
    band: "text-emerald-600",
  }
}

/** The board's columns as the Kanban wants them: one list of households per stage, in the stage order. */
export function groupByStage(deals: Deal[]): Record<DealStageId, Deal[]> {
  const columns = Object.fromEntries(
    DEAL_STAGES.map((s) => [s.id, [] as Deal[]])
  ) as Record<DealStageId, Deal[]>
  for (const d of deals) columns[d.stage].push(d)
  return columns
}

/** What the card's date means in a stage: "Callback", "First service" */
export const dateKind = (stage: DealStageId) =>
  DEAL_STAGES.find((s) => s.id === stage)?.dateKind ?? "Next step"

/** A household's plans and their first-year contract value */
export const planValue = (plan: PlanName, addOn?: PlanName) =>
  PLAN_VALUE[plan] + (addOn ? PLAN_VALUE[addOn] : 0)

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
export const usd = (n: number) => USD.format(n)

export type DealForm = {
  household: string
  address: string
  date: string
}
export type DealFormErrors = Partial<Record<keyof DealForm, string>>

/** The Add deal sheet's checks: a homeowner, an address and a date for the next step (any text) */
export function validateDeal(form: DealForm): DealFormErrors {
  const errors: DealFormErrors = {}
  if (!form.household.trim()) errors.household = "Enter the homeowner's name"
  if (!form.address.trim()) errors.address = "Enter the address"
  if (!form.date.trim()) errors.date = "Enter a date"
  return errors
}

/** The "Deal created" toast's line: stage, status, the contract value and the odds */
export const dealCreatedLine = (
  stage: string,
  status: string,
  value: number,
  win: string
) => `${stage} · ${status} · ${usd(value)} · ${win.trim()}%`

/**
 * A card for a household made in Add deal: priced from its plans, in the rep's territory in the office picked (or the
 * office's first), the date as typed.
 */
export function dealFromForm(
  id: string,
  f: DealForm & {
    type: DealType
    stage: DealStageId
    plan: PlanName
    addOn?: PlanName
    win: string
    owner: string
    status: DealStatus
    office: Market
  }
): Deal {
  const territory =
    TERRITORIES.find((t) => t.office === f.office && t.repId === f.owner) ??
    TERRITORIES.find((t) => t.office === f.office)!
  const value = planValue(f.plan, f.addOn)
  const win = Math.min(100, Math.max(0, Math.round(Number(f.win) || 0)))
  return {
    id,
    territoryId: territory.id,
    territory: territory.name,
    office: f.office,
    household: f.household.trim(),
    address: f.address.trim(),
    stage: f.stage,
    type: f.type,
    plan: f.plan,
    ...(f.addOn && { addOn: f.addOn }),
    source: "Door",
    date: "",
    dateLabel: f.date.trim(),
    value,
    valueLabel: usd(value),
    winProbability: win,
    probTone: probTone(win).band,
    status: f.status,
    statusDot: "",
    note: "Added on the board",
    ownerId: f.owner,
  }
}

/** The board's filters: the statuses and offices to keep (none picked keeps all) */
export const dealMatches = (
  d: Deal,
  statuses: DealStatus[],
  offices: Market[]
) =>
  (!statuses.length || statuses.includes(d.status)) &&
  (!offices.length || offices.includes(d.office))
