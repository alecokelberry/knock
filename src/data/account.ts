// The account pages (/account/profile, /preferences, /notifications): the choices on Tessa's profile, her preferences, and
// which notices reach her where. Her own details are CURRENT_USER in workspace.ts.

/** Profile → Public Details */
export const PROFILE_ROLES = [
  "Regional Director",
  "Sales Manager",
  "Team Leader",
  "Partner Relations",
]
export const TIME_ZONES = [
  "(GMT-7) Arizona",
  "(GMT-6) Mountain Time",
  "(GMT-5) Central Time",
  "(GMT-4) Eastern Time",
]
export const PHONE_COUNTRIES = [
  { value: "United States", flag: "🇺🇸", code: "+1" },
  { value: "Canada", flag: "🇨🇦", code: "+1" },
  { value: "Mexico", flag: "🇲🇽", code: "+52" },
]

/** Profile Preferences */
export const LANGUAGES = ["English (US)", "Español (US)"]
export const PROFILE_LANDING = [
  "Home overview",
  "Pipeline",
  "Approvals queue",
  "Reports",
]
export const DIGEST_CADENCES = ["Daily summary", "Weekly summary", "Off"]

/** A row on Preferences: what it does, an optional plan badge, and whether it's a switch or a button */
export type Preference = {
  id: string
  icon:
    | "search"
    | "mail-check"
    | "activity"
    | "calendar"
    | "id-card"
    | "chart-column"
    | "bell"
  title: string
  badge?: "Pro" | "Beta"
  description: string
  control: "switch" | "connect" | "all-email"
  on?: boolean
}

export const PREFERENCES: Preference[] = [
  {
    id: "search",
    icon: "search",
    title: "Appear in workspace search",
    badge: "Pro",
    description: "Let the offices find you in @-mentions and assignee pickers.",
    control: "switch",
    on: false,
  },
  {
    id: "receipts",
    icon: "mail-check",
    title: "Read receipts",
    badge: "Pro",
    description:
      "Show the managers when you've seen their notes and approvals.",
    control: "switch",
    on: false,
  },
  {
    id: "status",
    icon: "activity",
    title: "Activity status",
    description: "Show when you're active, so the offices know you're around.",
    control: "switch",
    on: true,
  },
  {
    id: "calendar",
    icon: "calendar",
    title: "Calendar sync",
    badge: "Beta",
    description: "Connect your calendar so reviews and ride-alongs land on it.",
    control: "connect",
  },
  {
    id: "card",
    icon: "id-card",
    title: "Public profile card",
    description: "Let the team see your role, time zone and bio.",
    control: "switch",
    on: true,
  },
  {
    id: "analytics",
    icon: "chart-column",
    title: "Usage analytics",
    description: "Share anonymous usage to help improve Knock.",
    control: "switch",
    on: false,
  },
  {
    id: "email",
    icon: "bell",
    title: "All email notifications",
    badge: "Beta",
    description:
      "Turn every household, mention and report email on or off at once.",
    control: "all-email",
  },
]

/** Where a notice can reach her */
export const CHANNELS = ["Email", "Slack", "In-app"] as const
export type Channel = (typeof CHANNELS)[number]

type NoticeRow = { id: string; label: string; on: Channel[] }
export type NoticeGroup = { title: string; rows: NoticeRow[] }

/** Notifications' tabs, each a set of groups of notices and the channels each reaches */
export const NOTICE_TABS: {
  id: string
  label: string
  groups: NoticeGroup[]
}[] = [
  {
    id: "households",
    label: "Households",
    groups: [
      {
        title: "Household activity",
        rows: [
          {
            id: "assigned",
            label: "Household assigned to you",
            on: ["Email", "In-app"],
          },
          { id: "callback", label: "Callback coming up", on: ["Email"] },
          { id: "stage", label: "Stage changed", on: ["In-app"] },
          {
            id: "mentioned",
            label: "Mentioned on a household",
            on: ["Email", "Slack", "In-app"],
          },
          { id: "agreement", label: "Agreement attached", on: [] },
        ],
      },
      {
        title: "Account updates",
        rows: [
          {
            id: "serviced",
            label: "Account serviced",
            on: ["Email", "In-app"],
          },
          { id: "accepted", label: "Quote accepted", on: ["Email"] },
          {
            id: "reassigned",
            label: "Household reassigned to you",
            on: ["In-app"],
          },
          { id: "cancelled", label: "Account cancelled", on: ["Email"] },
        ],
      },
    ],
  },
  {
    id: "mentions",
    label: "Mentions",
    groups: [
      {
        title: "Mentions",
        rows: [
          {
            id: "note",
            label: "Mentioned in a note",
            on: ["Email", "Slack", "In-app"],
          },
          {
            id: "approval",
            label: "Mentioned on an approval",
            on: ["Email", "In-app"],
          },
          { id: "reply", label: "Reply to your comment", on: ["In-app"] },
        ],
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    groups: [
      {
        title: "Scheduled reports",
        rows: [
          { id: "daily", label: "Daily summary", on: ["Email"] },
          {
            id: "weekly",
            label: "Weekly season report",
            on: ["Email", "Slack"],
          },
          { id: "pace", label: "A rep falls behind pace", on: ["In-app"] },
          {
            id: "office",
            label: "An office misses its week",
            on: ["Email", "In-app"],
          },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    groups: [
      {
        title: "Workspace",
        rows: [
          { id: "member", label: "New member joins", on: ["In-app"] },
          {
            id: "permit",
            label: "Solicitor permit expiring",
            on: ["Email", "In-app"],
          },
          {
            id: "sync",
            label: "Ridgeline file failed to sync",
            on: ["Email", "Slack"],
          },
          { id: "receipt", label: "Billing receipt", on: ["Email"] },
        ],
      },
    ],
  },
]
