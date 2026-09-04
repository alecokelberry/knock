// The households in play for Thursday's pipeline review: 18 on /pipeline, three to a stage, from a door not yet answered
// to an account Ridgeline has serviced. Each is priced from the plans (products.ts): the first-year contract value of the
// plan and any add-on. The homeowners (contacts.ts), the territories and the dashboard's open pipeline add up from these.
// Add deal's option lists are DEAL_TYPES, DEAL_STAGES, DEAL_OWNER_IDS (team.ts), DEAL_STATUSES and MARKETS (team.ts).
// Money is whole US dollars. Written by a script from one spec; edit by hand from here on.

import type { PlanName } from "./products"
import type { Market } from "./team"

export type DealStageId =
  | "lead"
  | "callback"
  | "pitched"
  | "sold"
  | "scheduled"
  | "serviced"
/** A new account, a plan added to an existing one, or a former customer coming back */
export type DealType = "New" | "Add-on" | "Win-back"
export type DealStatus =
  | "New"
  | "Working"
  | "On track"
  | "At risk"
  | "Committed"
/** How the household came in */
type DealSource = "Door" | "Callback" | "Referral"

export type DealStage = {
  id: DealStageId
  /** The column title. */
  label: string
  /** The column's aria description: "Lead: Marked, not pitched" is label + ": " + description. */
  description: string
  /** The dot in the column header. */
  dot: string
  /** The column's "+" button label, worded for its stage. */
  addLabel: string
  /** What the card's date is, in this stage ("Callback Jul 17, 2026"). */
  dateKind: string
}

export type Deal = {
  /** deal-101 ... deal-603; the hundreds digit is the stage. */
  id: string
  territoryId: string
  territory: string
  office: Market
  /** The homeowner the household runs through; none on one added on the board */
  contactId?: number
  /** The homeowner's name, the card's title */
  household: string
  address: string
  stage: DealStageId
  type: DealType
  /** The plan sold or priced, and a second plan beside it; none on one added on the board */
  plan?: PlanName
  addOn?: PlanName
  source: DealSource
  /** ISO day and its label: the next step, per the stage's dateKind */
  date: string
  dateLabel: string
  /** The first-year contract value, and as the card prints it ("$1,039") */
  value: number
  valueLabel: string
  /** Percent: the odds it's serviced. Bands as rendered: under 35 amber, 35 to 54 violet, 55 to 69 sky, 70 and up emerald. */
  winProbability: number
  probTone:
    | "text-amber-600"
    | "text-violet-600"
    | "text-sky-600"
    | "text-emerald-600"
  status: DealStatus
  /** The dot class in the status badge; DEAL_STATUS_DOT has the same mapping. */
  statusDot: string
  /** The muted text at the card's foot */
  note: string
  /** The rep: a team member id. */
  ownerId: string
}

/** The six columns of /pipeline, left to right. */
export const DEAL_STAGES: DealStage[] = [
  {
    id: "lead",
    label: "Lead",
    description: "Marked, not pitched",
    dot: "bg-slate-400 dark:bg-slate-500",
    addLabel: "Add lead",
    dateKind: "Knock again",
  },
  {
    id: "callback",
    label: "Callback",
    description: "Asked to come back",
    dot: "bg-sky-500",
    addLabel: "Add callback",
    dateKind: "Callback",
  },
  {
    id: "pitched",
    label: "Pitched",
    description: "Price left at the door",
    dot: "bg-blue-500",
    addLabel: "Add pitched household",
    dateKind: "Follow up",
  },
  {
    id: "sold",
    label: "Sold",
    description: "Signed, in the three-day window",
    dot: "bg-violet-500",
    addLabel: "Add sale",
    dateKind: "Window closes",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    description: "First service booked",
    dot: "bg-cyan-500",
    addLabel: "Add scheduled account",
    dateKind: "First service",
  },
  {
    id: "serviced",
    label: "Serviced",
    description: "Initial service done",
    dot: "bg-teal-500",
    addLabel: "Add serviced account",
    dateKind: "Serviced",
  },
]

/** The 18 cards, column by column, top to bottom */
export const DEALS: Deal[] = [
  {
    id: "deal-101",
    territoryId: "sagebrush-hills",
    territory: "Sagebrush Hills",
    office: "Boise",
    contactId: 1,
    household: "Walter Greaves",
    address: "2871 E Sagebrush Ct",
    stage: "lead",
    type: "New",
    plan: "Quarterly Pest",
    source: "Door",
    date: "2026-07-18",
    dateLabel: "Jul 18, 2026",
    value: 625,
    valueLabel: "$625",
    winProbability: 20,
    probTone: "text-amber-600",
    status: "New",
    statusDot: "bg-muted-foreground",
    note: "Not home twice",
    ownerId: "kirsten-vogt",
  },
  {
    id: "deal-102",
    territoryId: "wakefield-glen",
    territory: "Wakefield Glen",
    office: "Raleigh",
    contactId: 2,
    household: "Layla Khoury",
    address: "1906 Glen Laurel Dr",
    stage: "lead",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Mosquito Season",
    source: "Referral",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 1039,
    valueLabel: "$1,039",
    winProbability: 25,
    probTone: "text-amber-600",
    status: "New",
    statusDot: "bg-muted-foreground",
    note: "Neighbor referral",
    ownerId: "meera-iyer",
  },
  {
    id: "deal-103",
    territoryId: "desert-willow",
    territory: "Desert Willow",
    office: "Phoenix",
    contactId: 3,
    household: "Pablo Navarro",
    address: "3310 W Desert Willow Ln",
    stage: "lead",
    type: "Win-back",
    plan: "Bi-Monthly Pest",
    source: "Door",
    date: "2026-07-20",
    dateLabel: "Jul 20, 2026",
    value: 573,
    valueLabel: "$573",
    winProbability: 30,
    probTone: "text-amber-600",
    status: "Working",
    statusDot: "bg-sky-500",
    note: "Cancelled last fall",
    ownerId: "sam-okafor",
  },
  {
    id: "deal-201",
    territoryId: "cottonwood-bench",
    territory: "Cottonwood Bench",
    office: "Boise",
    contactId: 4,
    household: "Harriet Lawson",
    address: "612 N Cottonwood Bench Rd",
    stage: "callback",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Mosquito Season",
    source: "Door",
    date: "2026-07-16",
    dateLabel: "Jul 16, 2026",
    value: 1039,
    valueLabel: "$1,039",
    winProbability: 40,
    probTone: "text-violet-600",
    status: "Working",
    statusDot: "bg-sky-500",
    note: "Spouse decides",
    ownerId: "darnell-brooks",
  },
  {
    id: "deal-202",
    territoryId: "crabtree-pines",
    territory: "Crabtree Pines",
    office: "Raleigh",
    contactId: 5,
    household: "Kenji Watanabe",
    address: "4407 Pine Needle Ct",
    stage: "callback",
    type: "New",
    plan: "Termite Monitoring",
    source: "Door",
    date: "2026-07-18",
    dateLabel: "Jul 18, 2026",
    value: 1335,
    valueLabel: "$1,335",
    winProbability: 35,
    probTone: "text-violet-600",
    status: "Working",
    statusDot: "bg-sky-500",
    note: "Wants termite info",
    ownerId: "toby-marsh",
  },
  {
    id: "deal-203",
    territoryId: "palo-verde-estates",
    territory: "Palo Verde Estates",
    office: "Phoenix",
    contactId: 6,
    household: "Valentina Ospina",
    address: "7719 E Palo Verde Dr",
    stage: "callback",
    type: "New",
    plan: "Bi-Monthly Pest",
    source: "Door",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 573,
    valueLabel: "$573",
    winProbability: 32,
    probTone: "text-amber-600",
    status: "At risk",
    statusDot: "bg-amber-500",
    note: "Holding another quote",
    ownerId: "haruka-mori",
  },
  {
    id: "deal-301",
    territoryId: "riverbend",
    territory: "Riverbend",
    office: "Boise",
    contactId: 7,
    household: "Graham Pritchard",
    address: "1180 S Riverbend Way",
    stage: "pitched",
    type: "New",
    plan: "Quarterly Pest",
    source: "Door",
    date: "2026-07-18",
    dateLabel: "Jul 18, 2026",
    value: 625,
    valueLabel: "$625",
    winProbability: 48,
    probTone: "text-violet-600",
    status: "On track",
    statusDot: "bg-violet-500",
    note: "Wants a Saturday service",
    ownerId: "kyle-bennett",
  },
  {
    id: "deal-302",
    territoryId: "oak-hollow",
    territory: "Oak Hollow",
    office: "Raleigh",
    contactId: 8,
    household: "Ingrid Nyberg",
    address: "305 Hollow Oak Ln",
    stage: "pitched",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Rodent Exclusion",
    source: "Referral",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 1494,
    valueLabel: "$1,494",
    winProbability: 55,
    probTone: "text-sky-600",
    status: "On track",
    statusDot: "bg-violet-500",
    note: "Mice in the garage",
    ownerId: "ayesha-malik",
  },
  {
    id: "deal-303",
    territoryId: "camelback-terrace",
    territory: "Camelback Terrace",
    office: "Phoenix",
    contactId: 9,
    household: "Emeka Obi",
    address: "5122 N 38th Pl",
    stage: "pitched",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Mosquito Season",
    source: "Door",
    date: "2026-07-19",
    dateLabel: "Jul 19, 2026",
    value: 1039,
    valueLabel: "$1,039",
    winProbability: 45,
    probTone: "text-violet-600",
    status: "At risk",
    statusDot: "bg-amber-500",
    note: "Comparing two companies",
    ownerId: "owen-fletcher",
  },
  {
    id: "deal-401",
    territoryId: "cottonwood-bench",
    territory: "Cottonwood Bench",
    office: "Boise",
    contactId: 10,
    household: "Margaret Doyle",
    address: "640 N Cottonwood Bench Rd",
    stage: "sold",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Termite Monitoring",
    source: "Door",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 1960,
    valueLabel: "$1,960",
    winProbability: 78,
    probTone: "text-emerald-600",
    status: "On track",
    statusDot: "bg-violet-500",
    note: "Window ends Friday",
    ownerId: "darnell-brooks",
  },
  {
    id: "deal-402",
    territoryId: "wakefield-glen",
    territory: "Wakefield Glen",
    office: "Raleigh",
    contactId: 11,
    household: "Joon Park",
    address: "1942 Glen Laurel Dr",
    stage: "sold",
    type: "New",
    plan: "Bi-Monthly Pest",
    source: "Door",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 573,
    valueLabel: "$573",
    winProbability: 72,
    probTone: "text-emerald-600",
    status: "At risk",
    statusDot: "bg-amber-500",
    note: "Asked about cancelling",
    ownerId: "meera-iyer",
  },
  {
    id: "deal-403",
    territoryId: "desert-willow",
    territory: "Desert Willow",
    office: "Phoenix",
    contactId: 12,
    household: "Fatou Ndiaye",
    address: "3388 W Desert Willow Ln",
    stage: "sold",
    type: "Add-on",
    plan: "Mosquito Season",
    source: "Callback",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 414,
    valueLabel: "$414",
    winProbability: 80,
    probTone: "text-emerald-600",
    status: "On track",
    statusDot: "bg-violet-500",
    note: "Adding mosquito",
    ownerId: "sam-okafor",
  },
  {
    id: "deal-501",
    territoryId: "sagebrush-hills",
    territory: "Sagebrush Hills",
    office: "Boise",
    contactId: 13,
    household: "Nathan Pryce",
    address: "2890 E Sagebrush Ct",
    stage: "scheduled",
    type: "New",
    plan: "Quarterly Pest",
    source: "Door",
    date: "2026-07-17",
    dateLabel: "Jul 17, 2026",
    value: 625,
    valueLabel: "$625",
    winProbability: 88,
    probTone: "text-emerald-600",
    status: "Committed",
    statusDot: "bg-emerald-500",
    note: "Gate code on file",
    ownerId: "kirsten-vogt",
  },
  {
    id: "deal-502",
    territoryId: "crabtree-pines",
    territory: "Crabtree Pines",
    office: "Raleigh",
    contactId: 14,
    household: "Chiara Romano",
    address: "4415 Pine Needle Ct",
    stage: "scheduled",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Mosquito Season",
    source: "Referral",
    date: "2026-07-20",
    dateLabel: "Jul 20, 2026",
    value: 1039,
    valueLabel: "$1,039",
    winProbability: 90,
    probTone: "text-emerald-600",
    status: "Committed",
    statusDot: "bg-emerald-500",
    note: "Service Monday",
    ownerId: "toby-marsh",
  },
  {
    id: "deal-503",
    territoryId: "palo-verde-estates",
    territory: "Palo Verde Estates",
    office: "Phoenix",
    contactId: 15,
    household: "Stefan Richter",
    address: "7735 E Palo Verde Dr",
    stage: "scheduled",
    type: "New",
    plan: "Rodent Exclusion",
    source: "Door",
    date: "2026-07-21",
    dateLabel: "Jul 21, 2026",
    value: 869,
    valueLabel: "$869",
    winProbability: 85,
    probTone: "text-emerald-600",
    status: "At risk",
    statusDot: "bg-amber-500",
    note: "Asked to reschedule",
    ownerId: "haruka-mori",
  },
  {
    id: "deal-601",
    territoryId: "riverbend",
    territory: "Riverbend",
    office: "Boise",
    contactId: 16,
    household: "Tereza Horak",
    address: "1196 S Riverbend Way",
    stage: "serviced",
    type: "New",
    plan: "Quarterly Pest",
    source: "Door",
    date: "2026-07-14",
    dateLabel: "Jul 14, 2026",
    value: 625,
    valueLabel: "$625",
    winProbability: 100,
    probTone: "text-emerald-600",
    status: "Committed",
    statusDot: "bg-emerald-500",
    note: "Initial done Tuesday",
    ownerId: "kyle-bennett",
  },
  {
    id: "deal-602",
    territoryId: "oak-hollow",
    territory: "Oak Hollow",
    office: "Raleigh",
    contactId: 17,
    household: "Johan Lindberg",
    address: "318 Hollow Oak Ln",
    stage: "serviced",
    type: "New",
    plan: "Quarterly Pest",
    addOn: "Termite Monitoring",
    source: "Door",
    date: "2026-07-13",
    dateLabel: "Jul 13, 2026",
    value: 1960,
    valueLabel: "$1,960",
    winProbability: 100,
    probTone: "text-emerald-600",
    status: "Committed",
    statusDot: "bg-emerald-500",
    note: "Stations in",
    ownerId: "ayesha-malik",
  },
  {
    id: "deal-603",
    territoryId: "camelback-terrace",
    territory: "Camelback Terrace",
    office: "Phoenix",
    contactId: 18,
    household: "Naomie Pierre",
    address: "5140 N 38th Pl",
    stage: "serviced",
    type: "New",
    plan: "Bi-Monthly Pest",
    source: "Door",
    date: "2026-07-15",
    dateLabel: "Jul 15, 2026",
    value: 573,
    valueLabel: "$573",
    winProbability: 100,
    probTone: "text-emerald-600",
    status: "Committed",
    statusDot: "bg-emerald-500",
    note: "Owen's first this week",
    ownerId: "owen-fletcher",
  },
]

export const DEAL_TYPES: DealType[] = ["New", "Add-on", "Win-back"]
export const DEAL_STATUSES: DealStatus[] = [
  "New",
  "Working",
  "On track",
  "At risk",
  "Committed",
]
export const DEAL_STATUS_DOT: Record<DealStatus, string> = {
  New: "bg-muted-foreground",
  Working: "bg-sky-500",
  "On track": "bg-violet-500",
  "At risk": "bg-amber-500",
  Committed: "bg-emerald-500",
}
/** A household still counts as open until Ridgeline has serviced it */
export const isOpen = (d: Pick<Deal, "stage">) => d.stage !== "serviced"
