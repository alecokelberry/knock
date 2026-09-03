// Home → Quota Plan: next summer's plan (the 2027 season starts Monday, May 3, 291 days from the demo's today), one row
// per rep who has signed on to come back, with a season quota in serviced accounts, each field editable in place. The
// sales managers sign off their reps' plans; Tessa signs off the team leaders'.

export const PLAN_STATUSES = ["Active", "Draft", "Blocked"] as const
export const PLAN_RISKS = ["High", "Medium", "Low"] as const
export type PlanStatus = (typeof PLAN_STATUSES)[number]
export type PlanRisk = (typeof PLAN_RISKS)[number]

export type PlanRow = {
  id: string
  rep: string
  /** The plan's code, "S27-" and the rep's initials */
  code: string
  /** Who signs the plan off */
  owner: string
  /** Serviced accounts over the season */
  quota: number
  /** Days until the plan starts (the 2027 season starts May 3) */
  startsIn: number
  /** Percent: how sure the manager is the rep comes back and makes it */
  confidence: number
  status: PlanStatus
  risk: PlanRisk
  signedOff: boolean
}

export const QUOTA_PLAN: PlanRow[] = [
  {
    id: "plan-s27-darnell",
    rep: "Darnell Brooks",
    code: "S27-DB",
    owner: "Tessa Calloway",
    quota: 340,
    startsIn: 291,
    confidence: 92,
    status: "Active",
    risk: "Low",
    signedOff: true,
  },
  {
    id: "plan-s27-ayesha",
    rep: "Ayesha Malik",
    code: "S27-AM",
    owner: "Tessa Calloway",
    quota: 320,
    startsIn: 291,
    confidence: 90,
    status: "Active",
    risk: "Low",
    signedOff: true,
  },
  {
    id: "plan-s27-sam",
    rep: "Sam Okafor",
    code: "S27-SO",
    owner: "Tessa Calloway",
    quota: 320,
    startsIn: 291,
    confidence: 84,
    status: "Active",
    risk: "Low",
    signedOff: true,
  },
  {
    id: "plan-s27-kirsten",
    rep: "Kirsten Vogt",
    code: "S27-KV",
    owner: "Julia Serrano",
    quota: 260,
    startsIn: 291,
    confidence: 78,
    status: "Active",
    risk: "Medium",
    signedOff: true,
  },
  {
    id: "plan-s27-toby",
    rep: "Toby Marsh",
    code: "S27-TM",
    owner: "Rafael Lima",
    quota: 240,
    startsIn: 291,
    confidence: 66,
    status: "Draft",
    risk: "Medium",
    signedOff: false,
  },
  {
    id: "plan-s27-haruka",
    rep: "Haruka Mori",
    code: "S27-HM",
    owner: "Mateo Alvarez",
    quota: 240,
    startsIn: 291,
    confidence: 61,
    status: "Draft",
    risk: "Medium",
    signedOff: false,
  },
  {
    id: "plan-s27-meera",
    rep: "Meera Iyer",
    code: "S27-MI",
    owner: "Rafael Lima",
    quota: 200,
    startsIn: 291,
    confidence: 72,
    status: "Draft",
    risk: "Medium",
    signedOff: false,
  },
  {
    id: "plan-s27-kyle",
    rep: "Kyle Bennett",
    code: "S27-KB",
    owner: "Julia Serrano",
    quota: 160,
    startsIn: 291,
    confidence: 48,
    status: "Blocked",
    risk: "High",
    signedOff: false,
  },
]

/** What Add rep starts a row with */
export const NEW_PLAN_ROW: Omit<PlanRow, "id"> = {
  rep: "New rep",
  code: "S27-NEW",
  owner: "Julia Serrano",
  quota: 0,
  startsIn: 291,
  confidence: 40,
  status: "Draft",
  risk: "Medium",
  signedOff: false,
}
