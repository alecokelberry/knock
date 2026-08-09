import type { Route } from "next"

// Vantage Marketing's workspace and the one who signs in: the top bar's two switchers and Create menu, the account menu, the demo's
// today, and /settings (General).

/** The demo's today, a Thursday in week 11 of the summer season: quotes, tasks, callbacks and the week in progress count from it */
export const DEMO_TODAY = "2026-07-16"

export type Workspace = {
  id: string
  name: string
  /** The plan under the name in the switcher menu. */
  plan: string
  /** The gradient behind the round mark (28x28 viewBox, from the top left corner to the bottom right), as [offset %, colour] stops. */
  gradient: [number, string][]
  /** The one that is active (checked in the menu, shown in the top bar). */
  current: boolean
}

export type AppSwitcherItem = {
  id: string
  name: string
  icon: string
  current: boolean
}
export type MenuItem = {
  label: string
  icon: string
  href?: Route
  shortcut?: string
}

/** The "Organizations" menu behind "Vantage Marketing ⇅" in the top bar. The last item, "Create Organization" (plus icon), sits under a separator. */
export const WORKSPACES: Workspace[] = [
  {
    id: "vantage",
    name: "Vantage Marketing",
    plan: "Pro",
    gradient: [
      [0, "#4f46e5"],
      [35, "#7c3aed"],
      [70, "#a21caf"],
      [100, "#db2777"],
    ],
    current: true,
  },
  {
    id: "vantage-sandbox",
    name: "Vantage Sandbox",
    plan: "Free",
    gradient: [
      [0, "#f43f5e"],
      [33, "#f97316"],
      [66, "#eab308"],
      [100, "#84cc16"],
    ],
    current: false,
  },
  {
    id: "vantage-2025",
    name: "Vantage 2025 Season",
    plan: "Archived",
    gradient: [
      [0, "#38bdf8"],
      [35, "#3b82f6"],
      [70, "#6366f1"],
      [100, "#14b8a6"],
    ],
    current: false,
  },
]
export const CREATE_WORKSPACE_LABEL = "Create Organization"

/** The "Applications" menu behind "CRM ⇅". The last item, "Create Application" (plus icon), sits under a separator. */
export const APPLICATIONS: AppSwitcherItem[] = [
  { id: "crm", name: "CRM", icon: "target", current: true },
  { id: "recruiting", name: "Recruiting", icon: "megaphone", current: false },
  { id: "analytics", name: "Analytics", icon: "chart-column", current: false },
]
export const CREATE_APPLICATION_LABEL = "Create Application"

/** The "+ Create" menu. */
export const CREATE_MENU: MenuItem[] = [
  { label: "New Household", icon: "target", href: "/pipeline" },
  { label: "New Contact", icon: "user-plus", href: "/contacts" },
  { label: "New Territory", icon: "building2", href: "/territories" },
  { label: "Import Data", icon: "upload", href: "/settings/integrations" },
]

export type CurrentUser = {
  id: string
  name: string
  email: string
  /** Her title, under her name on the sign-in card and in the account menu */
  role: string
  username: string
  /** Country select ("United States", value US) and the number as typed. */
  phoneCountry: string
  phone: string
  timezone: string
  /** The website field shows "https://" then this. */
  website: string
  bio: string
  emailVerified: boolean
  /** Profile Preferences card. */
  language: string
  landingView: string
  digestCadence: string
  dailyBriefing: boolean
}

/** Who signs in: Tessa Calloway, Vantage's regional director over the Boise, Raleigh and Phoenix offices. Not one of the sixteen members; `pnpm db:seed` makes her account. */
export const CURRENT_USER: CurrentUser = {
  id: "tessa-calloway",
  name: "Tessa Calloway",
  email: "tessa@vantage.example",
  role: "Regional Director",
  username: "tessacalloway",
  phoneCountry: "United States",
  phone: "+1 801 555 0188",
  timezone: "(GMT-6) Mountain Time",
  website: "vantage.example/team/tessa",
  bio: "Runs three of Vantage's summer offices for Ridgeline Pest: the Thursday pipeline review, the season forecast and the approvals desk.",
  emailVerified: true,
  language: "English (US)",
  landingView: "Approvals queue",
  digestCadence: "Daily summary",
  dailyBriefing: true,
}

// ---------------------------------------------------------------------------------------------------------------
// /settings (General)

/** An accent swatch on /settings: its name (the radio's label), value and the swatch colour. */
export type Accent = { value: string; label: string; hex: string }

export const ACCENTS: Accent[] = [
  { value: "graphite", label: "Graphite", hex: "#5B6170" },
  { value: "cobalt", label: "Cobalt", hex: "#5470F7" },
  { value: "teal", label: "Teal", hex: "#159E9A" },
  { value: "mint", label: "Mint", hex: "#44BA84" },
  { value: "orange", label: "Orange", hex: "#EA7B18" },
  { value: "rose", label: "Rose", hex: "#E65A8B" },
]

/** The Default Landing View select: value, label and the line under it in the list. */
export const LANDING_VIEWS = [
  { value: "home", label: "Home overview", hint: "The season and quota first" },
  {
    value: "pipeline",
    label: "Pipeline",
    hint: "Jump straight into households",
  },
  { value: "contacts", label: "Contacts", hint: "Start from the homeowners" },
] as const
export type LandingView = (typeof LANDING_VIEWS)[number]["value"]

export type WorkspaceSettings = {
  name: string
  /** The workspace URL's subdomain, before ".knock.example" */
  subdomain: string
  supportEmail: string
  accent: string
  landingView: LandingView
  externalSharing: boolean
  aiRecaps: boolean
}

/** The form as /settings opens */
export const WORKSPACE_SETTINGS: WorkspaceSettings = {
  name: "Vantage Marketing",
  subdomain: "vantage",
  supportEmail: "office@vantage.example",
  accent: "teal",
  landingView: "pipeline",
  externalSharing: true,
  aiRecaps: true,
}

/** The domain the workspace URL lives under */
export const WORKSPACE_DOMAIN = "knock.example"

/** Workspace Summary's fixed rows (Verified domain and Brand posture follow the saved form) */
export const DATA_REGION = {
  label: "Data region",
  value: "US West",
  note: "Primary routing for homeowner and account records.",
}
