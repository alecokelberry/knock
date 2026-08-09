"use client"

import {
  BellIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"

import { signOut } from "@/app/actions/auth"
import { BrandMark } from "@/components/shared/brand-mark"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { AppNav } from "@/components/shell/app-nav"
import { openSearch } from "@/components/shell/search-dialog"
import { SunMoon, useToggleTheme } from "@/components/shell/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { appOf, NAV, sectionFor } from "@/lib/nav"

/** Who's signed in, from the session (the shell's layout) */
export type RailUser = { name: string; email: string }

const RAIL_BUTTON = "relative size-8 justify-center max-md:size-9"

/**
 * The rail: the mark, one icon per app (each opening the app's first page and naming itself in a tooltip). At its
 * foot: Search (the ⌘K dialog), Theme (the sun and moon spinning into each other,
 * D anywhere) and Settings, then the signed-in user's face opening the account menu. On a phone the rail sits in the
 * sheet beside the app's own sidebar.
 */
export function AppRail({ user }: { user: RailUser }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const close = () => setOpenMobile(false)
  const toggleTheme = useToggleTheme()
  const here = appOf(pathname)
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      aria-label="Apps"
      role="navigation"
      className="h-auto"
    >
      <div className="flex h-full grow">
        <div className="flex h-full w-(--sidebar-width-rail) shrink-0 flex-col">
          <SidebarHeader className="items-center justify-center py-3">
            <Link
              href="/"
              onClick={close}
              aria-label="Knock, home"
              className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <BrandMark
                className="size-7 rounded-lg"
                glyphClassName="size-3.5"
              />
            </Link>
          </SidebarHeader>
          <SidebarContent className="no-scrollbar">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {NAV.filter((s) => s.app !== "settings").map((s) => (
                    <RailItem key={s.app} label={s.label}>
                      <SidebarMenuButton
                        isActive={s.app === here}
                        aria-label={s.label}
                        className={RAIL_BUTTON}
                        render={
                          <Link
                            href={s.pages[0]?.href ?? "/"}
                            onClick={close}
                            aria-current={s.app === here ? "true" : undefined}
                          />
                        }
                      >
                        <s.icon aria-hidden />
                      </SidebarMenuButton>
                    </RailItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  <RailItem label="Search">
                    <SidebarMenuButton
                      aria-label="Search"
                      aria-keyshortcuts="Meta+K"
                      className={RAIL_BUTTON}
                      onClick={() => {
                        close()
                        openSearch()
                      }}
                    >
                      <SearchIcon aria-hidden />
                    </SidebarMenuButton>
                  </RailItem>
                  <RailItem label="Theme">
                    <SidebarMenuButton
                      aria-label="Toggle theme"
                      aria-keyshortcuts="D"
                      className={RAIL_BUTTON}
                      onClick={toggleTheme}
                    >
                      <SunMoon />
                    </SidebarMenuButton>
                  </RailItem>
                  <RailItem label="Settings">
                    <SidebarMenuButton
                      isActive={here === "settings"}
                      aria-label="Settings"
                      className={RAIL_BUTTON}
                      render={
                        <Link
                          href="/settings"
                          onClick={close}
                          aria-current={
                            here === "settings" ? "true" : undefined
                          }
                        />
                      }
                    >
                      <SettingsIcon aria-hidden />
                    </SidebarMenuButton>
                  </RailItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="items-center">
            <AccountMenu user={user} />
          </SidebarFooter>
        </div>
        {/* On a phone the sheet carries the app's own pages beside the rail */}
        <div className="flex min-w-0 grow border-l md:hidden">
          <AppNav section={sectionFor(pathname)} onNavigate={close} />
        </div>
      </div>
    </Sidebar>
  )
}

/** One rail button, naming itself in a tooltip to its right */
function RailItem({
  label,
  children,
}: {
  label: string
  children: React.ReactElement
}) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger render={children} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

/**
 * The account menu: who's signed in, the account pages (Profile, Preferences, Notifications), then Sign Out in red. The
 * theme is on the rail.
 */
function AccountMenu({ user }: { user: RailUser }) {
  const { isMobile } = useSidebar()
  const [pending, startTransition] = useTransition()

  // One round trip: the session ends, its cookies clear and the sign-in page comes back in the same response
  function leave() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Open profile for ${user.name}`}
        className="flex size-7 items-center justify-center rounded-lg border border-transparent outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-sidebar-accent max-md:size-9"
      >
        <PersonAvatar name={user.name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "top" : "right"}
        align="end"
        sideOffset={isMobile ? 8 : 10}
        className="min-w-52"
        aria-label="Account"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-1.5">
            <PersonAvatar name={user.name} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs font-normal">{user.email}</span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/account/profile" />}
            className="max-md:min-h-10"
          >
            <UserIcon aria-hidden />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/account/preferences" />}
            className="max-md:min-h-10"
          >
            <SlidersHorizontalIcon aria-hidden />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/account/notifications" />}
            className="max-md:min-h-10"
          >
            <BellIcon aria-hidden />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={leave}
            className="max-md:min-h-10"
          >
            <LogOutIcon aria-hidden />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
