// Vantage's people on Knock, under Tessa Calloway (workspace.ts, the one who signs in), the regional director over three
// summer offices: the sixteen seats on /settings/team, who can own a household or an activity, and the Dashboard's Team
// Performance table. Each office has a sales manager and a team of three reps under a team leader; Provo handles the
// partner, payroll and the office (permits, housing). The reps' season numbers are in season.ts.

export const MARKETS = ["Boise", "Raleigh", "Phoenix"] as const
export type Market = (typeof MARKETS)[number]

/** The Role, Billing and Auth tabs of the members' Filters menu (Role is also Add member's Role select) */
export const MEMBER_ROLES = [
  "Admin",
  "Sales Manager",
  "Team Leader",
  "Sales Rep",
  "Partner Relations",
  "Payroll",
  "Office",
]
export const BILLING_STATUSES = [
  "Active",
  "Pending invoice",
  "Manual review",
  "Past due",
] as const
export const AUTHENTICATIONS = [
  "SSO",
  "Two-factor",
  "Passwordless",
  "Password",
] as const
export type BillingStatus = (typeof BILLING_STATUSES)[number]
export type Authentication = (typeof AUTHENTICATIONS)[number]
/** The dot beside each billing status */
export const BILLING_DOT: Record<BillingStatus, string> = {
  Active: "bg-emerald-500",
  "Pending invoice": "bg-sky-500",
  "Manual review": "bg-amber-500",
  "Past due": "bg-rose-500",
}

export type TeamMember = {
  id: string
  name: string
  username: string
  email: string
  /** The role column on /settings/team. */
  role: string
  /** The short title on the Dashboard's Team Performance table and Approvals ("Team Leader · Boise"). */
  title: string | null
  /** The role printed under the name in the Activities timeline; null for those who log none. */
  activityRole: string | null
  /** The summer market they work; null for the office. */
  market: Market | null
  billingStatus: BillingStatus
  /** The dot colour class on the billing status cell. */
  billingDot: string
  authentication: Authentication
  /** As shown on /settings/team, for example "Apr 06, 2026". */
  joined: string
  joinedISO: string
}

export type TeamPerformanceRow = {
  memberId: string
  /** Title under the name, for example "Team Leader · Boise". */
  title: string
  /** Serviced accounts as a percent of the season quota, with the note beside it. */
  quota: number
  quotaNote: string
  /** Bar fill class: bg-success, bg-warning, bg-destructive or bg-violet-500. */
  quotaBar: string
  /** Sales per pitch this season, as printed ("36%"). */
  closeRate: string
  /** Sold and not yet serviced. */
  pending: number
  status: "Stable" | "Watch" | "Critical" | "Pending"
  /** Badge tone: success, warning, destructive or info. */
  statusTone: "success" | "warning" | "destructive" | "info"
}

const member = (
  id: string,
  name: string,
  role: string,
  title: string | null,
  market: Market | null,
  joinedISO: string,
  joined: string,
  authentication: Authentication,
  billingStatus: BillingStatus = "Active",
  activityRole: string | null = title && role
): TeamMember => ({
  id,
  name,
  username: id.replace("-", "."),
  email: `${id.replace("-", ".")}@vantage.example`,
  role,
  title,
  activityRole,
  market,
  billingStatus,
  billingDot: BILLING_DOT[billingStatus],
  authentication,
  joined,
  joinedISO,
})

/** /settings/team's 16 members: the table opens sorted by name, and this order breaks ties when it's sorted by another column. */
export const TEAM_MEMBERS: TeamMember[] = [
  member(
    "julia-serrano",
    "Julia Serrano",
    "Sales Manager",
    "Sales Manager · Boise",
    "Boise",
    "2024-02-12",
    "Feb 12, 2024",
    "SSO"
  ),
  member(
    "darnell-brooks",
    "Darnell Brooks",
    "Team Leader",
    "Team Leader · Boise",
    "Boise",
    "2025-04-07",
    "Apr 07, 2025",
    "SSO"
  ),
  member(
    "kirsten-vogt",
    "Kirsten Vogt",
    "Sales Rep",
    "Sales Rep · Boise",
    "Boise",
    "2025-04-07",
    "Apr 07, 2025",
    "Two-factor"
  ),
  member(
    "kyle-bennett",
    "Kyle Bennett",
    "Sales Rep",
    "Rookie Rep · Boise",
    "Boise",
    "2026-04-06",
    "Apr 06, 2026",
    "Passwordless",
    "Pending invoice",
    "Sales Rep"
  ),
  member(
    "rafael-lima",
    "Rafael Lima",
    "Sales Manager",
    "Sales Manager · Raleigh",
    "Raleigh",
    "2024-03-04",
    "Mar 04, 2024",
    "SSO"
  ),
  member(
    "ayesha-malik",
    "Ayesha Malik",
    "Team Leader",
    "Team Leader · Raleigh",
    "Raleigh",
    "2025-04-07",
    "Apr 07, 2025",
    "SSO"
  ),
  member(
    "toby-marsh",
    "Toby Marsh",
    "Sales Rep",
    "Sales Rep · Raleigh",
    "Raleigh",
    "2025-04-07",
    "Apr 07, 2025",
    "Two-factor"
  ),
  member(
    "meera-iyer",
    "Meera Iyer",
    "Sales Rep",
    "Rookie Rep · Raleigh",
    "Raleigh",
    "2026-04-06",
    "Apr 06, 2026",
    "Passwordless",
    "Active",
    "Sales Rep"
  ),
  member(
    "mateo-alvarez",
    "Mateo Alvarez",
    "Sales Manager",
    "Sales Manager · Phoenix",
    "Phoenix",
    "2024-01-15",
    "Jan 15, 2024",
    "SSO"
  ),
  member(
    "sam-okafor",
    "Sam Okafor",
    "Team Leader",
    "Team Leader · Phoenix",
    "Phoenix",
    "2025-04-07",
    "Apr 07, 2025",
    "SSO"
  ),
  member(
    "haruka-mori",
    "Haruka Mori",
    "Sales Rep",
    "Sales Rep · Phoenix",
    "Phoenix",
    "2025-04-07",
    "Apr 07, 2025",
    "Two-factor"
  ),
  member(
    "owen-fletcher",
    "Owen Fletcher",
    "Sales Rep",
    "Rookie Rep · Phoenix",
    "Phoenix",
    "2026-04-06",
    "Apr 06, 2026",
    "Password",
    "Manual review",
    "Sales Rep"
  ),
  member(
    "grant-lowell",
    "Grant Lowell",
    "Partner Relations",
    "Partner Relations",
    null,
    "2023-09-18",
    "Sep 18, 2023",
    "Two-factor",
    "Active",
    "Partner Relations"
  ),
  member(
    "daniel-seo",
    "Daniel Seo",
    "Admin",
    "Sales Operations",
    null,
    "2024-11-04",
    "Nov 04, 2024",
    "SSO",
    "Active",
    null
  ),
  member(
    "karim-nassar",
    "Karim Nassar",
    "Payroll",
    "Payroll",
    null,
    "2025-01-27",
    "Jan 27, 2025",
    "Two-factor",
    "Active",
    null
  ),
  member(
    "niamh-kelly",
    "Niamh Kelly",
    "Office",
    "Office Manager",
    null,
    "2025-03-10",
    "Mar 10, 2025",
    "Password",
    "Past due",
    null
  ),
]

/** The nine who sell, office by office, team leader first */
export const SELLER_IDS = [
  "darnell-brooks",
  "kirsten-vogt",
  "kyle-bennett",
  "ayesha-malik",
  "toby-marsh",
  "meera-iyer",
  "sam-okafor",
  "haruka-mori",
  "owen-fletcher",
] as const

/** The Dashboard's Team Performance table: the nine reps, best first. Pace at week 10 of 16 is 62.5% of quota. */
export const TEAM_PERFORMANCE: TeamPerformanceRow[] = [
  {
    memberId: "darnell-brooks",
    title: "Team Leader · Boise",
    quota: 66,
    quotaNote: "Ahead of pace",
    quotaBar: "bg-success",
    closeRate: "36%",
    pending: 17,
    status: "Stable",
    statusTone: "success",
  },
  {
    memberId: "ayesha-malik",
    title: "Team Leader · Raleigh",
    quota: 65,
    quotaNote: "Ahead of pace",
    quotaBar: "bg-success",
    closeRate: "36%",
    pending: 13,
    status: "Stable",
    statusTone: "success",
  },
  {
    memberId: "kirsten-vogt",
    title: "Sales Rep · Boise",
    quota: 59,
    quotaNote: "10 behind pace",
    quotaBar: "bg-success",
    closeRate: "32%",
    pending: 15,
    status: "Stable",
    statusTone: "success",
  },
  {
    memberId: "sam-okafor",
    title: "Team Leader · Phoenix",
    quota: 57,
    quotaNote: "21 waiting on service",
    quotaBar: "bg-violet-500",
    closeRate: "34%",
    pending: 21,
    status: "Pending",
    statusTone: "info",
  },
  {
    memberId: "toby-marsh",
    title: "Sales Rep · Raleigh",
    quota: 52,
    quotaNote: "24 behind pace",
    quotaBar: "bg-warning",
    closeRate: "30%",
    pending: 17,
    status: "Watch",
    statusTone: "warning",
  },
  {
    memberId: "meera-iyer",
    title: "Rookie Rep · Raleigh",
    quota: 51,
    quotaNote: "Best rookie week yet",
    quotaBar: "bg-warning",
    closeRate: "28%",
    pending: 11,
    status: "Watch",
    statusTone: "warning",
  },
  {
    memberId: "haruka-mori",
    title: "Sales Rep · Phoenix",
    quota: 51,
    quotaNote: "Heat days off",
    quotaBar: "bg-warning",
    closeRate: "30%",
    pending: 17,
    status: "Watch",
    statusTone: "warning",
  },
  {
    memberId: "kyle-bennett",
    title: "Rookie Rep · Boise",
    quota: 41,
    quotaNote: "Ride-along Saturday",
    quotaBar: "bg-destructive",
    closeRate: "25%",
    pending: 13,
    status: "Critical",
    statusTone: "destructive",
  },
  {
    memberId: "owen-fletcher",
    title: "Rookie Rep · Phoenix",
    quota: 29,
    quotaNote: "8 cancelled this season",
    quotaBar: "bg-destructive",
    closeRate: "23%",
    pending: 11,
    status: "Critical",
    statusTone: "destructive",
  },
]

/** Who can own a homeowner on /contacts: the reps, and partner relations for accounts whose rep has gone home */
export const CONTACT_OWNER_IDS = [...SELLER_IDS, "grant-lowell"]
/** Owners the Activities "All owners" filter and Log activity offer: the reps, their sales managers and partner relations */
export const ACTIVITY_OWNER_IDS = [
  ...SELLER_IDS,
  "julia-serrano",
  "rafael-lima",
  "mateo-alvarez",
  "grant-lowell",
]

export const TEAM_BY_ID: Record<string, TeamMember> = Object.fromEntries(
  TEAM_MEMBERS.map((m) => [m.id, m])
)

/** A team member's name from an id; falls back to the id for anyone not on the team. */
export function memberName(id: string): string {
  return TEAM_BY_ID[id]?.name ?? id
}
