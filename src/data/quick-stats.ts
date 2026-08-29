// Home → Quick Stats: sales by source per period (as the Dashboard's Sales Sourced), the season's open households by
// stage, and three weeks of hours each rep and sales manager logged, Monday to Saturday: on the doors, in training, or
// at the office (every cell's note is its tooltip).

import { DEMO_TODAY } from "./workspace"

/** The date menu */
export const QS_RANGES = [
  "This week",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const

export const SOURCE_PERIODS = ["Week", "Month", "Season"] as const
export type SourcePeriod = (typeof SOURCE_PERIODS)[number]
export type SourceRow = {
  source: "Door" | "Callback" | "Referral"
  /** Agreements signed */
  deals: number
  avg: string
  value: string
  share: number
}

/** Sales by Source: contract value signed, sales, and each source's share, per period */
export const PIPELINE_BY_SOURCE: Record<
  SourcePeriod,
  { created: string; deals: number; rows: SourceRow[] }
> = {
  Week: {
    created: "$71K",
    deals: 91,
    rows: [
      { source: "Door", deals: 62, avg: "$774", value: "$48K", share: 68 },
      { source: "Callback", deals: 17, avg: "$765", value: "$13K", share: 19 },
      { source: "Referral", deals: 8, avg: "$750", value: "$6K", share: 9 },
    ],
  },
  Month: {
    created: "$341K",
    deals: 437,
    rows: [
      { source: "Door", deals: 297, avg: "$781", value: "$232K", share: 68 },
      { source: "Callback", deals: 83, avg: "$783", value: "$65K", share: 19 },
      { source: "Referral", deals: 40, avg: "$775", value: "$31K", share: 9 },
    ],
  },
  Season: {
    created: "$938K",
    deals: 1182,
    rows: [
      { source: "Door", deals: 804, avg: "$794", value: "$638K", share: 68 },
      {
        source: "Callback",
        deals: 225,
        avg: "$791",
        value: "$178K",
        share: 19,
      },
      { source: "Referral", deals: 106, avg: "$792", value: "$84K", share: 9 },
    ],
  },
}
/** The share of sales with no source recorded (win-backs and office sales) */
export const SOURCE_UNTRACKED = 4
/** The source hues */
export const SOURCE_HUE = {
  Door: "oklch(0.76 0.161 80.1)",
  Callback: "oklch(0.6 0.145 181.2)",
  Referral: "oklch(0.66 0.19 42.8)",
} as const

/** Households by Stage: every open household the reps have in play, season to date (the forecast's books count the same) */
export const OPEN_BY_STAGE = [
  { stage: "Lead", deals: 386, hue: "blue" },
  { stage: "Callback", deals: 71, hue: "violet" },
  { stage: "Pitched", deals: 93, hue: "amber" },
  { stage: "Sold", deals: 43, hue: "emerald" },
  { stage: "Scheduled", deals: 92, hue: "rose" },
] as const
export const STAGE_METRICS = ["Households", "Relative"] as const

export type TimeTeam = "Boise" | "Raleigh" | "Phoenix"
export type TimeCategory = "Doors" | "Training" | "Office"
/** A person on Hours by Rep, with the weekly hours their percentage is against */
export type TimeRep = {
  name: string
  title: string
  team: TimeTeam
  target: number
}
/** A work day's log: hours, what kind, and the note its tooltip shows. Null is a work day with nothing logged yet */
export type WorkDay = [hours: number, category: TimeCategory, note: string]

export const TIME_TEAMS: TimeTeam[] = ["Boise", "Raleigh", "Phoenix"]
export const TRACKED_FILTERS = [
  "Under target",
  "On target",
  "Over target",
] as const
export const CLIENT_FILTERS = [
  "Mostly doors",
  "Mixed",
  "Off the doors",
] as const
export const TIME_CATEGORIES: TimeCategory[] = ["Doors", "Training", "Office"]

/** The week Hours by Rep opens on (its Monday), and the New log form's date hint */
export const TIME_WEEK = "2026-07-13"
export const TIME_TODAY = DEMO_TODAY
/** Days nobody knocks, and why */
export const HOLIDAYS: Record<string, string> = {
  "2026-07-04": "Independence Day: no doors.",
}
/** Who New log can log for, and where */
export const LOG_REPS = [
  "Julia Serrano",
  "Darnell Brooks",
  "Kirsten Vogt",
  "Kyle Bennett",
  "Rafael Lima",
  "Ayesha Malik",
  "Toby Marsh",
  "Meera Iyer",
  "Mateo Alvarez",
  "Sam Okafor",
  "Haruka Mori",
  "Owen Fletcher",
]
export const LOG_ACCOUNTS = [
  "Cottonwood Bench",
  "Sagebrush Hills",
  "Riverbend",
  "Oak Hollow",
  "Crabtree Pines",
  "Wakefield Glen",
  "Desert Willow",
  "Palo Verde Estates",
  "Camelback Terrace",
  "Office",
]

export const TIME_REPS: TimeRep[] = [
  { name: "Julia Serrano", title: "Sales manager", team: "Boise", target: 40 },
  { name: "Darnell Brooks", title: "Team leader", team: "Boise", target: 46 },
  { name: "Kirsten Vogt", title: "Sales rep", team: "Boise", target: 44 },
  { name: "Kyle Bennett", title: "Rookie rep", team: "Boise", target: 44 },
  { name: "Rafael Lima", title: "Sales manager", team: "Raleigh", target: 40 },
  { name: "Ayesha Malik", title: "Team leader", team: "Raleigh", target: 46 },
  { name: "Toby Marsh", title: "Sales rep", team: "Raleigh", target: 44 },
  { name: "Meera Iyer", title: "Rookie rep", team: "Raleigh", target: 44 },
  {
    name: "Mateo Alvarez",
    title: "Sales manager",
    team: "Phoenix",
    target: 40,
  },
  { name: "Sam Okafor", title: "Team leader", team: "Phoenix", target: 46 },
  { name: "Haruka Mori", title: "Sales rep", team: "Phoenix", target: 44 },
  { name: "Owen Fletcher", title: "Rookie rep", team: "Phoenix", target: 44 },
]

/** Monday to Saturday of each logged week, by its Monday (this week runs to today, Thursday); other weeks have nothing logged */
export const WORKLOGS: Record<string, Record<string, (WorkDay | null)[]>> = {
  "2026-06-29": {
    "Darnell Brooks": [
      [7.5, "Doors", "Cottonwood Bench, 72 doors"],
      [7.5, "Doors", "Cottonwood Bench, 67 doors"],
      [7, "Doors", "Cottonwood Bench, 67 doors"],
      [7.5, "Doors", "Cottonwood Bench, 71 doors"],
      [6.0, "Training", "Morning meeting and role-play, then an area drop"],
      null,
    ],
    "Kirsten Vogt": [
      [6.5, "Training", "Ride-along with the team leader"],
      [6.0, "Training", "Rebuttal practice and a short shift"],
      [7.5, "Doors", "Sagebrush Hills, 69 doors"],
      [8.5, "Doors", "Sagebrush Hills, 76 doors"],
      [5.5, "Training", "Morning meeting and role-play, then an area drop"],
      null,
    ],
    "Kyle Bennett": [
      [8.5, "Doors", "Riverbend, 75 doors"],
      [8.5, "Doors", "Riverbend, 71 doors"],
      [7, "Doors", "Riverbend, 62 doors"],
      [7.5, "Doors", "Riverbend, 69 doors"],
      [5, "Doors", "Riverbend, 49 doors"],
      null,
    ],
    "Ayesha Malik": [
      [8, "Doors", "Oak Hollow, 68 doors"],
      [7.5, "Doors", "Oak Hollow, 64 doors"],
      [5.5, "Training", "Rebuttal practice and a short shift"],
      [6.0, "Training", "Rebuttal practice and a short shift"],
      [5.5, "Training", "Ride-along with the team leader"],
      null,
    ],
    "Toby Marsh": [
      [5.5, "Training", "Morning meeting and role-play, then an area drop"],
      [8, "Doors", "Crabtree Pines, 70 doors"],
      [6.5, "Training", "Morning meeting and role-play, then an area drop"],
      [7, "Doors", "Crabtree Pines, 60 doors"],
      [5, "Doors", "Crabtree Pines, 49 doors"],
      null,
    ],
    "Meera Iyer": [
      [6.5, "Doors", "Wakefield Glen, 53 doors"],
      [6.5, "Doors", "Wakefield Glen, 52 doors"],
      [7, "Doors", "Wakefield Glen, 65 doors"],
      [7.5, "Doors", "Wakefield Glen, 62 doors"],
      [5, "Doors", "Wakefield Glen, 44 doors"],
      null,
    ],
    "Sam Okafor": [
      [7.5, "Doors", "Desert Willow, 66 doors"],
      [7, "Doors", "Desert Willow, 68 doors"],
      [7.5, "Doors", "Desert Willow, 64 doors"],
      [7, "Doors", "Desert Willow, 58 doors"],
      [5, "Doors", "Desert Willow, 46 doors"],
      null,
    ],
    "Haruka Mori": [
      [5.5, "Training", "Morning meeting and role-play, then an area drop"],
      [6.5, "Doors", "Palo Verde Estates, 62 doors"],
      [7, "Doors", "Palo Verde Estates, 61 doors"],
      [5.5, "Training", "Ride-along with the team leader"],
      [5, "Doors", "Palo Verde Estates, 46 doors"],
      null,
    ],
    "Owen Fletcher": [
      [7.5, "Doors", "Camelback Terrace, 61 doors"],
      [8.5, "Doors", "Camelback Terrace, 77 doors"],
      [7, "Doors", "Camelback Terrace, 64 doors"],
      [7, "Doors", "Camelback Terrace, 67 doors"],
      [5, "Doors", "Camelback Terrace, 41 doors"],
      null,
    ],
    "Julia Serrano": [
      [7, "Training", "Morning meeting, then a ride-along with Kyle"],
      [7, "Doors", "Area drops and knocking in Riverbend"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Kyle"],
      [7, "Doors", "Area drops and knocking in Riverbend"],
      null,
    ],
    "Rafael Lima": [
      [7, "Training", "Morning meeting, then a ride-along with Meera"],
      [7, "Doors", "Area drops and knocking in Wakefield Glen"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Meera"],
      [7, "Doors", "Area drops and knocking in Wakefield Glen"],
      null,
    ],
    "Mateo Alvarez": [
      [7, "Training", "Morning meeting, then a ride-along with Owen"],
      [7, "Doors", "Area drops and knocking in Camelback Terrace"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Owen"],
      [7, "Doors", "Area drops and knocking in Camelback Terrace"],
      null,
    ],
  },
  "2026-07-06": {
    "Darnell Brooks": [
      [7.5, "Doors", "Cottonwood Bench, 62 doors"],
      [7.5, "Doors", "Cottonwood Bench, 69 doors"],
      [6.5, "Doors", "Cottonwood Bench, 53 doors"],
      [7, "Doors", "Cottonwood Bench, 59 doors"],
      [7, "Doors", "Cottonwood Bench, 61 doors"],
      [7.5, "Doors", "Cottonwood Bench, 64 doors"],
    ],
    "Kirsten Vogt": [
      [5, "Office", "Cancel-save calls and paperwork"],
      [4.5, "Office", "Agreement fixes for the office"],
      [7.5, "Doors", "Sagebrush Hills, 69 doors"],
      [7, "Doors", "Sagebrush Hills, 66 doors"],
      [6.0, "Training", "Rebuttal practice and a short shift"],
      [6.5, "Doors", "Sagebrush Hills, 54 doors"],
    ],
    "Kyle Bennett": [
      [7.5, "Doors", "Riverbend, 74 doors"],
      [5.5, "Training", "Rebuttal practice and a short shift"],
      [8, "Doors", "Riverbend, 75 doors"],
      [7, "Doors", "Riverbend, 64 doors"],
      [7.5, "Doors", "Riverbend, 73 doors"],
      [6.5, "Doors", "Riverbend, 52 doors"],
    ],
    "Ayesha Malik": [
      [7.5, "Doors", "Oak Hollow, 61 doors"],
      [7, "Doors", "Oak Hollow, 69 doors"],
      [6.5, "Training", "Rebuttal practice and a short shift"],
      [8, "Doors", "Oak Hollow, 75 doors"],
      [4.5, "Office", "Permit renewal at city hall"],
      [6.0, "Training", "Morning meeting and role-play, then an area drop"],
    ],
    "Toby Marsh": [
      [7.5, "Doors", "Crabtree Pines, 74 doors"],
      [6.0, "Training", "Ride-along with the team leader"],
      [6.5, "Training", "Rebuttal practice and a short shift"],
      [6.5, "Doors", "Crabtree Pines, 59 doors"],
      [6.5, "Training", "Morning meeting and role-play, then an area drop"],
      [7.5, "Doors", "Crabtree Pines, 70 doors"],
    ],
    "Meera Iyer": [
      [8, "Doors", "Wakefield Glen, 75 doors"],
      [7.5, "Doors", "Wakefield Glen, 72 doors"],
      [6.5, "Training", "Morning meeting and role-play, then an area drop"],
      [6.5, "Doors", "Wakefield Glen, 58 doors"],
      [8, "Doors", "Wakefield Glen, 65 doors"],
      [8, "Doors", "Wakefield Glen, 78 doors"],
    ],
    "Sam Okafor": [
      [6.5, "Doors", "Desert Willow, 56 doors"],
      [5, "Office", "Cancel-save calls and paperwork"],
      [8.5, "Doors", "Desert Willow, 83 doors"],
      [7.5, "Doors", "Desert Willow, 67 doors"],
      [7.5, "Doors", "Desert Willow, 69 doors"],
      [7.5, "Doors", "Desert Willow, 72 doors"],
    ],
    "Haruka Mori": [
      [7, "Doors", "Palo Verde Estates, 68 doors"],
      [
        4.5,
        "Doors",
        "Heat advisory; doors after 5 in Palo Verde Estates, 33 doors",
      ],
      [7, "Doors", "Palo Verde Estates, 57 doors"],
      [
        4.5,
        "Doors",
        "Heat advisory; doors after 5 in Palo Verde Estates, 24 doors",
      ],
      [7, "Doors", "Palo Verde Estates, 67 doors"],
      [6.0, "Training", "Rebuttal practice and a short shift"],
    ],
    "Owen Fletcher": [
      [8.5, "Doors", "Camelback Terrace, 75 doors"],
      [7.5, "Doors", "Camelback Terrace, 70 doors"],
      [8.5, "Doors", "Camelback Terrace, 84 doors"],
      [6.5, "Doors", "Camelback Terrace, 62 doors"],
      [7.5, "Doors", "Camelback Terrace, 60 doors"],
      [7.5, "Doors", "Camelback Terrace, 65 doors"],
    ],
    "Julia Serrano": [
      [7, "Training", "Morning meeting, then a ride-along with Kyle"],
      [7, "Doors", "Area drops and knocking in Riverbend"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Kyle"],
      [7, "Doors", "Area drops and knocking in Riverbend"],
      [6, "Doors", "Saturday blitz in Riverbend"],
    ],
    "Rafael Lima": [
      [7, "Training", "Morning meeting, then a ride-along with Meera"],
      [7, "Doors", "Area drops and knocking in Wakefield Glen"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Meera"],
      [7, "Doors", "Area drops and knocking in Wakefield Glen"],
      [6, "Doors", "Saturday blitz in Wakefield Glen"],
    ],
    "Mateo Alvarez": [
      [7, "Training", "Morning meeting, then a ride-along with Owen"],
      [7, "Doors", "Area drops and knocking in Camelback Terrace"],
      [6.5, "Office", "Pay run review and cancellations"],
      [7, "Training", "Morning meeting, then a ride-along with Owen"],
      [7, "Doors", "Area drops and knocking in Camelback Terrace"],
      [6, "Doors", "Saturday blitz in Camelback Terrace"],
    ],
  },
  "2026-07-13": {
    "Darnell Brooks": [
      [7.5, "Doors", "Cottonwood Bench, 60 doors"],
      [4.5, "Office", "Cancel-save calls and paperwork"],
      [6.0, "Training", "Morning meeting and role-play, then an area drop"],
      null,
      null,
      null,
    ],
    "Kirsten Vogt": [
      [8.5, "Doors", "Sagebrush Hills, 68 doors"],
      [7.5, "Doors", "Sagebrush Hills, 61 doors"],
      [8, "Doors", "Sagebrush Hills, 76 doors"],
      null,
      null,
      null,
    ],
    "Kyle Bennett": [
      [8, "Doors", "Riverbend, 67 doors"],
      [7, "Doors", "Riverbend, 58 doors"],
      [6.0, "Training", "Ride-along with the team leader"],
      null,
      null,
      null,
    ],
    "Ayesha Malik": [
      [7, "Doors", "Oak Hollow, 59 doors"],
      [7.5, "Doors", "Oak Hollow, 70 doors"],
      [7.5, "Doors", "Oak Hollow, 74 doors"],
      null,
      null,
      null,
    ],
    "Toby Marsh": [
      [5, "Office", "Cancel-save calls and paperwork"],
      [6.5, "Training", "Rebuttal practice and a short shift"],
      [4.5, "Office", "Cancel-save calls and paperwork"],
      null,
      null,
      null,
    ],
    "Meera Iyer": [
      [6.5, "Doors", "Wakefield Glen, 56 doors"],
      [7.5, "Doors", "Wakefield Glen, 71 doors"],
      [7.5, "Doors", "Wakefield Glen, 64 doors"],
      null,
      null,
      null,
    ],
    "Sam Okafor": [
      [6.5, "Doors", "Desert Willow, 61 doors"],
      [8, "Doors", "Desert Willow, 78 doors"],
      [4, "Office", "Permit renewal at city hall"],
      null,
      null,
      null,
    ],
    "Haruka Mori": [
      [7, "Doors", "Palo Verde Estates, 63 doors"],
      [
        4.5,
        "Doors",
        "Heat advisory; doors after 5 in Palo Verde Estates, 29 doors",
      ],
      [8, "Doors", "Palo Verde Estates, 77 doors"],
      null,
      null,
      null,
    ],
    "Owen Fletcher": [
      [6.5, "Doors", "Camelback Terrace, 52 doors"],
      [7.5, "Doors", "Camelback Terrace, 71 doors"],
      [6.5, "Doors", "Camelback Terrace, 54 doors"],
      null,
      null,
      null,
    ],
    "Julia Serrano": [
      [7, "Training", "Morning meeting, then a ride-along with Kyle"],
      [7, "Doors", "Area drops and knocking in Riverbend"],
      [6.5, "Office", "Pay run review and cancellations"],
      null,
      null,
      null,
    ],
    "Rafael Lima": [
      [7, "Training", "Morning meeting, then a ride-along with Meera"],
      [7, "Doors", "Area drops and knocking in Wakefield Glen"],
      [6.5, "Office", "Pay run review and cancellations"],
      null,
      null,
      null,
    ],
    "Mateo Alvarez": [
      [7, "Training", "Morning meeting, then a ride-along with Owen"],
      [7, "Doors", "Area drops and knocking in Camelback Terrace"],
      [6.5, "Office", "Pay run review and cancellations"],
      null,
      null,
      null,
    ],
  },
}
