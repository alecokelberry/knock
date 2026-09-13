// Pipeline → Approvals: the exceptions Vantage's reps ask for (a price below the sheet, a waived initial service, an
// advance on the season-end back-end check, a sale in another rep's territory), waiting on the desk or already
// decided, each with its checks against the Approval rules (lib/approvals.ts).

export const APPROVAL_STATUSES = [
  "Pending",
  "Approved",
  "Denied",
  "Expired",
] as const
export const REQUEST_TYPES = [
  "Price override",
  "Waived initial",
  "Back-end advance",
  "Out of territory",
] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]
export type RequestType = (typeof REQUEST_TYPES)[number]
/** A check's verdict: passes, a warning, or one that blocks sign-off */
export type CheckState = "pass" | "warn" | "block"
export type ApprovalCheck = { label: string; detail: string; state: CheckState }

export type Approval = {
  /** The id, shown on the detail sheet (apr_8f21c0a4) */
  id: string
  rep: string
  /** "15% off Quarterly Pest", "$800 back-end advance"… */
  request: string
  type: RequestType
  /** The homeowner, or the rep's back-end for an advance */
  account: string
  quote: string
  justification: string
  /** How long ago it came in ("18m ago", "Yesterday") */
  requested: string
  /** The contract value, or the advance, whole dollars */
  value: number
  approver: string
  status: ApprovalStatus
  checks: ApprovalCheck[]
}

const rep = (name: string, title: string) => ({
  title,
  email: `${name.toLowerCase().replace(" ", ".")}@vantage.example`,
})
/** The reps who ask, with the title and email shown beside them */
export const REQUESTERS: Record<string, { title: string; email: string }> = {
  "Darnell Brooks": rep("Darnell Brooks", "Team Leader · Boise"),
  "Kirsten Vogt": rep("Kirsten Vogt", "Sales Rep · Boise"),
  "Kyle Bennett": rep("Kyle Bennett", "Rookie Rep · Boise"),
  "Ayesha Malik": rep("Ayesha Malik", "Team Leader · Raleigh"),
  "Toby Marsh": rep("Toby Marsh", "Sales Rep · Raleigh"),
  "Meera Iyer": rep("Meera Iyer", "Rookie Rep · Raleigh"),
  "Sam Okafor": rep("Sam Okafor", "Team Leader · Phoenix"),
  "Haruka Mori": rep("Haruka Mori", "Sales Rep · Phoenix"),
  "Owen Fletcher": rep("Owen Fletcher", "Rookie Rep · Phoenix"),
}
/** Who New request lets a rep ask as */
export const REQUESTER_NAMES = Object.keys(REQUESTERS)

/** The desk: who signs off, and their title. Each office's sales manager takes price overrides to the 20% ceiling,
 * waived initials and territory calls; Karim takes back-end advances; Tessa anything past the ceiling or over $1,000. */
export const APPROVERS: Record<string, string> = {
  "Julia Serrano": "Sales Manager · Boise",
  "Rafael Lima": "Sales Manager · Raleigh",
  "Mateo Alvarez": "Sales Manager · Phoenix",
  "Karim Nassar": "Payroll",
  "Tessa Calloway": "Regional Director",
}
export const APPROVER_NAMES = Object.keys(APPROVERS)

/** Each request type's dot, on the request badge */
export const TYPE_DOT: Record<RequestType, string> = {
  "Price override": "bg-amber-500 dark:bg-amber-400",
  "Waived initial": "bg-sky-500 dark:bg-sky-400",
  "Back-end advance": "bg-emerald-500 dark:bg-emerald-400",
  "Out of territory": "bg-muted-foreground",
}

/** The ten requests: pending first, then the decided ones, newest first */
export const APPROVALS: Approval[] = [
  {
    id: "apr_8f21c0a4",
    rep: "Darnell Brooks",
    request: "15% off Quarterly Pest",
    type: "Price override",
    account: "Harriet Lawson",
    quote: "Q-2033",
    justification:
      "The house next door pays $101 a quarter with another company; matching it brings the whole cul-de-sac.",
    requested: "18m ago",
    value: 1039,
    approver: "Julia Serrano",
    status: "Pending",
    checks: [
      {
        label: "Within the ceiling",
        detail: "15% sits under the 20% ceiling.",
        state: "pass",
      },
      {
        label: "Price match",
        detail: "Matching a competitor; note it on the agreement.",
        state: "warn",
      },
    ],
  },
  {
    id: "apr_3b97d115",
    rep: "Sam Okafor",
    request: "Waived initial",
    type: "Waived initial",
    account: "Pablo Navarro",
    quote: "Q-2039",
    justification:
      "Cancelled last fall over a billing date; he comes back if the $99 initial is waived.",
    requested: "42m ago",
    value: 474,
    approver: "Mateo Alvarez",
    status: "Pending",
    checks: [
      {
        label: "Win-back",
        detail: "A former customer, cancelled more than 60 days ago.",
        state: "pass",
      },
      {
        label: "Initial waived",
        detail: "Ridgeline still bills the first visit; the office absorbs it.",
        state: "warn",
      },
    ],
  },
  {
    id: "apr_a04e72f8",
    rep: "Haruka Mori",
    request: "22% off Bi-Monthly Pest",
    type: "Price override",
    account: "Valentina Ospina",
    quote: "Q-2035",
    justification:
      "She's holding a lower quote from another company; 22% keeps her on the scorpion plan.",
    requested: "1h ago",
    value: 573,
    approver: "Tessa Calloway",
    status: "Pending",
    checks: [
      {
        label: "Within the ceiling",
        detail: "22% exceeds the 20% ceiling; needs the regional director.",
        state: "block",
      },
      {
        label: "Commission tier",
        detail: "Below $62 a service the rep drops a commission tier.",
        state: "warn",
      },
    ],
  },
  {
    id: "apr_c5d8b933",
    rep: "Toby Marsh",
    request: "$800 back-end advance",
    type: "Back-end advance",
    account: "Back-end · Toby Marsh",
    quote: "No quote",
    justification: "Car repair; paid back from the season-end check.",
    requested: "2h ago",
    value: 800,
    approver: "Karim Nassar",
    status: "Pending",
    checks: [
      {
        label: "Retention",
        detail: "91% of Toby's accounts are still active.",
        state: "pass",
      },
      {
        label: "Under $1,000",
        detail: "Payroll signs off advances up to $1,000.",
        state: "pass",
      },
    ],
  },
  {
    id: "apr_17e0b6d2",
    rep: "Toby Marsh",
    request: "Out-of-territory sale",
    type: "Out of territory",
    account: "Marcus Hollis",
    quote: "Q-2023",
    justification:
      "A referral from his cousin in Wakefield Glen; Meera agreed to split it.",
    requested: "Yesterday",
    value: 625,
    approver: "Rafael Lima",
    status: "Approved",
    checks: [
      {
        label: "Territory rep told",
        detail: "Meera Iyer agreed; the account is split 50/50.",
        state: "pass",
      },
    ],
  },
  {
    id: "apr_5c2a9e41",
    rep: "Darnell Brooks",
    request: "10% off Termite Monitoring",
    type: "Price override",
    account: "Margaret Doyle",
    quote: "Q-2025",
    justification: "Two plans signed at once; 10% on the termite monitoring.",
    requested: "Yesterday",
    value: 1960,
    approver: "Julia Serrano",
    status: "Approved",
    checks: [
      {
        label: "Within the ceiling",
        detail: "10% sits under the 20% ceiling.",
        state: "pass",
      },
    ],
  },
  {
    id: "apr_90d4f3a7",
    rep: "Ayesha Malik",
    request: "Waived initial",
    type: "Waived initial",
    account: "Johan Lindberg",
    quote: "No quote",
    justification:
      "Referred by Eli Rosen; the referral promo waives the initial.",
    requested: "2 days ago",
    value: 1811,
    approver: "Rafael Lima",
    status: "Approved",
    checks: [
      {
        label: "Referral promo",
        detail: "Referred by a current customer.",
        state: "pass",
      },
    ],
  },
  {
    id: "apr_2f6b8c10",
    rep: "Owen Fletcher",
    request: "30% off Quarterly Pest",
    type: "Price override",
    account: "Emeka Obi",
    quote: "Q-2038",
    justification: "Matching the cheapest of his three quotes.",
    requested: "3 days ago",
    value: 1039,
    approver: "Tessa Calloway",
    status: "Denied",
    checks: [
      {
        label: "Within the ceiling",
        detail: "30% exceeds the 20% ceiling; needs the regional director.",
        state: "block",
      },
      {
        label: "Commission tier",
        detail: "Below $62 a service the rep drops a commission tier.",
        state: "warn",
      },
    ],
  },
  {
    id: "apr_d81c4e5b",
    rep: "Kyle Bennett",
    request: "$1,500 back-end advance",
    type: "Back-end advance",
    account: "Back-end · Kyle Bennett",
    quote: "No quote",
    justification: "August rent, before the season-end check.",
    requested: "3 days ago",
    value: 1500,
    approver: "Karim Nassar",
    status: "Denied",
    checks: [
      {
        label: "Retention",
        detail: "84% of Kyle's accounts are still active.",
        state: "warn",
      },
      {
        label: "Over $1,000",
        detail: "Advances over $1,000 need the regional director.",
        state: "warn",
      },
    ],
  },
  {
    id: "apr_6a3f0d92",
    rep: "Sam Okafor",
    request: "Out-of-territory sale",
    type: "Out of territory",
    account: "Grace Tan",
    quote: "No quote",
    justification:
      "Knocked her on the way back from an area drop in Palo Verde Estates.",
    requested: "Last week",
    value: 625,
    approver: "Mateo Alvarez",
    status: "Expired",
    checks: [
      {
        label: "Territory rep told",
        detail: "Haruka Mori hasn't answered yet.",
        state: "warn",
      },
    ],
  },
]
