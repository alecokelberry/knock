import { cookies } from "next/headers"

import { AppNavAside } from "@/components/shell/app-nav"
import { AppRail } from "@/components/shell/app-rail"
import { ThemeHotkey } from "@/components/shell/theme-toggle"
import { TopBar } from "@/components/shell/top-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireUser } from "@/lib/session"

// The shell tokens: the rail on the sidebar's grey, active rows tinted with 5% of the primary, a 50px top bar
const SHELL_TOKENS =
  "[--sidebar-border:transparent] [--sidebar-accent:color-mix(in_oklab,var(--color-primary)_5%,transparent)] [--sidebar-accent-foreground:var(--color-primary)] [--header-height:50px] md:h-svh md:overflow-hidden"

/**
 * The shell: the rail of apps, the inset panel with its top bar, the app's own pages beside the page on
 * a desktop (in the sheet on a phone), and the page. From a tablet up the panel stays put and the page
 * scrolls inside it; on a phone the page scrolls, so Safari's toolbar can hide.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Signed in, or off to /sign-in (the proxy's cookie check is only optimistic)
  const user = await requireUser()
  const jar = await cookies()
  const navOpen = jar.get("app_nav")?.value !== "0"
  const navWidth = Math.min(
    320,
    Math.max(200, Number(jar.get("app_nav_width")?.value) || 200)
  )
  return (
    <SidebarProvider
      className={SHELL_TOKENS}
      style={{ "--sidebar-width": "3.9375rem" } as React.CSSProperties}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <ThemeHotkey />
      <AppRail user={{ name: user.name, email: user.email }} />
      <SidebarInset className="min-w-0 md:border md:shadow-none">
        <TopBar />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
          <AppNavAside open={navOpen} width={navWidth} />
          {/* `isolate`: the page is its own stacking layer, so nothing in it can paint over the sticky top bar */}
          <div
            id="content"
            // the page scrolls here, so it takes focus for the keyboard (and the skip link)
            tabIndex={0}
            role="region"
            aria-label="Page"
            className="@container/main isolate flex min-w-0 flex-1 flex-col p-4 outline-none md:overflow-y-auto"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
