import {
  ActivityIcon,
  BoxesIcon,
  CalendarIcon,
  ChartColumnIcon,
  CircleCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  GaugeIcon,
  HistoryIcon,
  HouseIcon,
  LayoutDashboardIcon,
  ListIcon,
  MapIcon,
  type LucideIcon,
  PencilRulerIcon,
  PuzzleIcon,
  SettingsIcon,
  TargetIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
  ZapIcon,
  FunnelIcon,
} from "lucide-react"
import type { Route } from "next"

/** The apps, in the rail's order */
export type App =
  | "home"
  | "sales"
  | "activities"
  | "contacts"
  | "reports"
  | "settings"
type NavPage = { href: Route; label: string; icon: LucideIcon }
/** A labelled group of an app's pages ("Overview", "Goals") */
type NavGroup = { label: string; pages: NavPage[] }
export type NavSection = {
  app: App
  label: string
  icon: LucideIcon
  groups: NavGroup[]
  pages: NavPage[]
}

const section = (
  app: App,
  label: string,
  icon: LucideIcon,
  groups: NavGroup[]
): NavSection => ({
  app,
  label,
  icon,
  groups,
  pages: groups.flatMap((g) => g.pages),
})

/** Home: where every path falls back to */
const HOME_SECTION = section("home", "Home", HouseIcon, [
  {
    label: "Overview",
    pages: [
      { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/today", label: "Today", icon: CalendarIcon },
      { href: "/activity-feed", label: "Activity Feed", icon: HistoryIcon },
      { href: "/quick-stats", label: "Quick Stats", icon: ZapIcon },
    ],
  },
  {
    label: "Goals",
    pages: [
      { href: "/attainment", label: "Attainment", icon: GaugeIcon },
      { href: "/quota-plan", label: "Quota Plan", icon: PencilRulerIcon },
    ],
  },
])

/** The apps and their pages; `label` is the rail's tooltip (the Sales app's says "Pipeline") */
export const NAV: NavSection[] = [
  HOME_SECTION,
  section("sales", "Pipeline", TargetIcon, [
    {
      label: "Households",
      pages: [
        { href: "/pipeline", label: "Pipeline", icon: LayoutDashboardIcon },
        { href: "/forecast", label: "Forecast", icon: TrendingUpIcon },
      ],
    },
    {
      label: "Sales",
      pages: [
        { href: "/quotes", label: "Quotes", icon: FileTextIcon },
        { href: "/products", label: "Products", icon: BoxesIcon },
        { href: "/approvals", label: "Approvals", icon: CircleCheckIcon },
      ],
    },
  ]),
  section("activities", "Activities", ActivityIcon, [
    {
      label: "Work",
      pages: [
        { href: "/activities", label: "All Activities", icon: ListIcon },
        { href: "/tasks", label: "Tasks", icon: CircleCheckIcon },
      ],
    },
  ]),
  section("contacts", "Contacts", UsersIcon, [
    {
      label: "Homeowners",
      pages: [
        { href: "/contacts", label: "All Contacts", icon: UsersIcon },
        { href: "/territories", label: "Territories", icon: MapIcon },
      ],
    },
  ]),
  section("reports", "Reports", ChartColumnIcon, [
    {
      label: "Dashboards",
      pages: [
        { href: "/reports", label: "Overview", icon: LayoutDashboardIcon },
        { href: "/reports/conversion", label: "Conversion", icon: FunnelIcon },
      ],
    },
  ]),
  section("settings", "Settings", SettingsIcon, [
    {
      label: "Workspace",
      pages: [
        { href: "/settings", label: "General", icon: SettingsIcon },
        { href: "/settings/billing", label: "Billing", icon: CreditCardIcon },
        { href: "/settings/team", label: "Team Members", icon: UserPlusIcon },
      ],
    },
    {
      label: "Configuration",
      pages: [
        {
          href: "/settings/integrations",
          label: "Integrations",
          icon: PuzzleIcon,
        },
      ],
    },
  ]),
]

/** Pages outside the sidebar that still belong to an app (a record under its list, a form under its app) */
const HOMES: [prefix: string, app: App][] = [
  ["/quotes/", "sales"],
  ["/contacts/", "contacts"],
  ["/account/", "settings"],
]

/** The app a path belongs to: the one listing it, else the one its path sits under; Home when none does */
export function appOf(pathname: string): App {
  const [path = pathname] = pathname.split(/[?#]/)
  const listed = NAV.find((s) => s.pages.some((p) => p.href === path))
  if (listed) return listed.app
  const home = HOMES.find(([prefix]) => path.startsWith(prefix))
  if (home) return home[1]
  const first = path.split("/")[1]
  return (
    NAV.find((s) =>
      s.pages.some((p) => p.href.split("/")[1] === first && first)
    )?.app ?? "home"
  )
}

/** The section to show for a path: its app's, else Home's */
export function sectionFor(pathname: string): NavSection {
  const app = appOf(pathname)
  return NAV.find((s) => s.app === app) ?? HOME_SECTION
}
