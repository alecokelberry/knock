// Vantage's nine territories, three to an office: the neighborhoods its reps work, each a card on /territories. Doors,
// knocked and sold are the season to date; contact counts, open pipeline, segments and owners are derived from the
// homeowners (lib/contacts.ts `territoryCard` counts the same and the tests hold them equal). Money is whole US dollars.

import type { Lifecycle } from "./contacts"
import type { Market } from "./team"

type TerritoryTile =
  | {
      kind: "initials"
      text: string
      /** Tailwind background class of the tile: bg-orange-600 ... */
      bg: string
    }
  | { kind: "icon"; /** Lucide icon name in an outlined tile. */ icon: string }

export type Territory = {
  id: string
  name: string
  office: Market
  /** The rep assigned to work it: a team member id */
  repId: string
  /** The Lucide icon the Contacts table shows beside this territory. */
  icon: string
  /** How the card draws the territory's mark. */
  tile: TerritoryTile
  /** Homes in the territory, homes knocked at least once, and agreements signed this season */
  doors: number
  knocked: number
  sold: number
  contactCount: number
  /** Sum of its homeowners' open deals, whole dollars, and as the card prints it. */
  openPipeline: number
  pipelineShort: string
  /** Sum of its homeowners' open-deal counts. */
  openDeals: number
  /** The card's bar: one segment per lifecycle that has contacts, in lifecycle order; widths are count / contactCount. */
  segments: { lifecycle: Lifecycle; count: number }[]
  /** Distinct contact owners, sorted by name: the order the card stacks their avatars (team member ids). */
  ownerIds: string[]
  /** Contact ids, in the order /contacts?territory=<name> lists them. */
  contactIds: number[]
  /** Set on a territory made with Add territory during the visit; its card leads the grid. */
  added?: true
}

/** /territories header: "9 territories", "40 homeowners", open pipeline. */
export const TERRITORIES_SUMMARY = {
  territories: 9,
  contacts: 40,
  openPipeline: 13822,
  openPipelineShort: "$13.8K",
}

/** The nine territories, office by office. */
export const TERRITORIES: Territory[] = [
  {
    id: "cottonwood-bench",
    name: "Cottonwood Bench",
    office: "Boise",
    repId: "darnell-brooks",
    icon: "trees",
    tile: { kind: "initials", text: "CB", bg: "bg-emerald-600" },
    doors: 1240,
    knocked: 1105,
    sold: 142,
    contactCount: 5,
    openPipeline: 2999,
    pipelineShort: "$2,999",
    openDeals: 2,
    segments: [
      { lifecycle: "Lead", count: 1 },
      { lifecycle: "Callback", count: 1 },
      { lifecycle: "Sold", count: 1 },
      { lifecycle: "Customer", count: 2 },
    ],
    ownerIds: ["darnell-brooks", "grant-lowell"],
    contactIds: [19, 20, 35, 4, 10],
  },
  {
    id: "sagebrush-hills",
    name: "Sagebrush Hills",
    office: "Boise",
    repId: "kirsten-vogt",
    icon: "mountain",
    tile: { kind: "icon", icon: "mountain" },
    doors: 980,
    knocked: 860,
    sold: 96,
    contactCount: 4,
    openPipeline: 1250,
    pipelineShort: "$1,250",
    openDeals: 2,
    segments: [
      { lifecycle: "Lead", count: 1 },
      { lifecycle: "Sold", count: 1 },
      { lifecycle: "Customer", count: 2 },
    ],
    ownerIds: ["kirsten-vogt"],
    contactIds: [21, 22, 13, 1],
  },
  {
    id: "riverbend",
    name: "Riverbend",
    office: "Boise",
    repId: "kyle-bennett",
    icon: "waves",
    tile: { kind: "initials", text: "RB", bg: "bg-sky-500" },
    doors: 1120,
    knocked: 790,
    sold: 58,
    contactCount: 4,
    openPipeline: 625,
    pipelineShort: "$625",
    openDeals: 1,
    segments: [
      { lifecycle: "Lead", count: 1 },
      { lifecycle: "Pitched", count: 1 },
      { lifecycle: "Customer", count: 2 },
    ],
    ownerIds: ["grant-lowell", "kyle-bennett"],
    contactIds: [23, 7, 36, 16],
  },
  {
    id: "oak-hollow",
    name: "Oak Hollow",
    office: "Raleigh",
    repId: "ayesha-malik",
    icon: "tree-deciduous",
    tile: { kind: "initials", text: "OH", bg: "bg-green-600" },
    doors: 1310,
    knocked: 1140,
    sold: 151,
    contactCount: 5,
    openPipeline: 1494,
    pipelineShort: "$1,494",
    openDeals: 1,
    segments: [
      { lifecycle: "Lead", count: 1 },
      { lifecycle: "Pitched", count: 1 },
      { lifecycle: "Customer", count: 3 },
    ],
    ownerIds: ["ayesha-malik"],
    contactIds: [24, 25, 37, 8, 17],
  },
  {
    id: "crabtree-pines",
    name: "Crabtree Pines",
    office: "Raleigh",
    repId: "toby-marsh",
    icon: "tree-pine",
    tile: { kind: "icon", icon: "tree-pine" },
    doors: 1050,
    knocked: 900,
    sold: 94,
    contactCount: 4,
    openPipeline: 2374,
    pipelineShort: "$2,374",
    openDeals: 2,
    segments: [
      { lifecycle: "Callback", count: 1 },
      { lifecycle: "Sold", count: 1 },
      { lifecycle: "Customer", count: 2 },
    ],
    ownerIds: ["grant-lowell", "toby-marsh"],
    contactIds: [14, 26, 27, 5],
  },
  {
    id: "wakefield-glen",
    name: "Wakefield Glen",
    office: "Raleigh",
    repId: "meera-iyer",
    icon: "house",
    tile: { kind: "initials", text: "WG", bg: "bg-violet-600" },
    doors: 960,
    knocked: 770,
    sold: 66,
    contactCount: 4,
    openPipeline: 1612,
    pipelineShort: "$1,612",
    openDeals: 2,
    segments: [
      { lifecycle: "Lead", count: 2 },
      { lifecycle: "Sold", count: 1 },
      { lifecycle: "Customer", count: 1 },
    ],
    ownerIds: ["meera-iyer"],
    contactIds: [38, 28, 11, 2],
  },
  {
    id: "desert-willow",
    name: "Desert Willow",
    office: "Phoenix",
    repId: "sam-okafor",
    icon: "sun",
    tile: { kind: "initials", text: "DW", bg: "bg-amber-500" },
    doors: 1380,
    knocked: 1190,
    sold: 139,
    contactCount: 5,
    openPipeline: 987,
    pipelineShort: "$987",
    openDeals: 2,
    segments: [
      { lifecycle: "Lead", count: 2 },
      { lifecycle: "Customer", count: 3 },
    ],
    ownerIds: ["grant-lowell", "sam-okafor"],
    contactIds: [12, 29, 30, 3, 39],
  },
  {
    id: "palo-verde-estates",
    name: "Palo Verde Estates",
    office: "Phoenix",
    repId: "haruka-mori",
    icon: "flower",
    tile: { kind: "icon", icon: "flower" },
    doors: 1160,
    knocked: 930,
    sold: 91,
    contactCount: 4,
    openPipeline: 1442,
    pipelineShort: "$1,442",
    openDeals: 2,
    segments: [
      { lifecycle: "Callback", count: 1 },
      { lifecycle: "Sold", count: 1 },
      { lifecycle: "Customer", count: 2 },
    ],
    ownerIds: ["haruka-mori"],
    contactIds: [31, 32, 15, 6],
  },
  {
    id: "camelback-terrace",
    name: "Camelback Terrace",
    office: "Phoenix",
    repId: "owen-fletcher",
    icon: "mountain-snow",
    tile: { kind: "initials", text: "CT", bg: "bg-orange-600" },
    doors: 1020,
    knocked: 690,
    sold: 44,
    contactCount: 5,
    openPipeline: 1039,
    pipelineShort: "$1,039",
    openDeals: 1,
    segments: [
      { lifecycle: "Lead", count: 1 },
      { lifecycle: "Pitched", count: 1 },
      { lifecycle: "Customer", count: 3 },
    ],
    ownerIds: ["grant-lowell", "owen-fletcher"],
    contactIds: [9, 33, 18, 40, 34],
  },
]

/** Add territory's Brand color swatches: the name read out and the tile's background class. */
export const BRAND_COLORS = [
  { name: "sky", bg: "bg-sky-500" },
  { name: "violet", bg: "bg-violet-600" },
  { name: "emerald", bg: "bg-emerald-600" },
  { name: "amber", bg: "bg-amber-500" },
  { name: "rose", bg: "bg-rose-500" },
  { name: "fuchsia", bg: "bg-fuchsia-600" },
  { name: "orange", bg: "bg-orange-600" },
  { name: "green", bg: "bg-green-600" },
]
