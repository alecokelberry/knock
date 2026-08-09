"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useRef, useState } from "react"

import {
  LifecycleLinks,
  LiveMetrics,
  SeasonQuota,
  SecurityStatus,
  TipStack,
  UpNext,
} from "@/components/shell/nav-feet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { NAV_COUNTS } from "@/data/shell"
import { type NavSection, sectionFor } from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * The app's own sidebar: the app's pages in their groups (with a count where
 * something waits), what the app keeps beside them (Activities' meetings, Contacts' lifecycle stages), and
 * its foot. Beside the rail on a desktop; in the sheet on a phone.
 */
export function AppNav({
  section,
  onNavigate,
}: {
  section: NavSection
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <ScrollArea className="min-h-0 grow">
        <nav aria-label={section.label} className="flex flex-col py-1">
          {section.groups.map((group, i) => (
            <div key={group.label}>
              {i > 0 && <Separator className="my-2" />}
              <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-foreground/70 uppercase">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5 px-2">
                {group.pages.map((page) => {
                  const active = pathname === page.href
                  const count = NAV_COUNTS[page.href]
                  return (
                    <Button
                      key={page.href}
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={page.href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                        />
                      }
                      className={cn(
                        "justify-start gap-2.5 font-normal max-md:h-9",
                        active && "bg-muted font-medium text-primary"
                      )}
                    >
                      <span
                        aria-hidden
                        className="flex size-4 items-center justify-center [&_svg]:size-3.5"
                      >
                        <page.icon />
                      </span>
                      <span className="truncate">{page.label}</span>
                      {count ? (
                        <Badge
                          variant="outline"
                          className="ms-auto tabular-nums"
                        >
                          {count}
                        </Badge>
                      ) : null}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        {section.app === "activities" && <UpNext onNavigate={onNavigate} />}
        {section.app === "contacts" && (
          <Suspense>
            <LifecycleLinks onNavigate={onNavigate} />
          </Suspense>
        )}
      </ScrollArea>
      <div className="shrink-0">
        {section.app === "home" && <TipStack />}
        {section.app === "sales" && <SeasonQuota />}
        {section.app === "activities" && <LiveMetrics app="activities" />}
        {section.app === "contacts" && <LiveMetrics app="contacts" />}
        {section.app === "settings" && <SecurityStatus />}
      </div>
    </div>
  )
}

const WIDTH = { min: 200, max: 320 }

/**
 * The app's sidebar in the inset panel on a desktop: 200px, wider by dragging its
 * edge, folded away and back with the handle. Both are cookies, so the server renders them right.
 */
export function AppNavAside({
  open: initial,
  width: initialWidth,
}: {
  open: boolean
  width: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(initial)
  const [width, setWidth] = useState(initialWidth)
  const drag = useRef<{ x: number; w: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const section = sectionFor(pathname)
  const remember = (name: string, value: string | number) =>
    // the server reads this cookie to render the nav open or shut
    (document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`)
  const toggle = () =>
    setOpen((o) => {
      remember("app_nav", o ? 0 : 1)
      return !o
    })
  return (
    <aside
      aria-label={`${section.label} pages`}
      className={cn(
        "relative hidden shrink-0 overflow-hidden border-r md:flex",
        !dragging &&
          "transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
        !open && "border-r-0"
      )}
      style={
        {
          width: open ? width : 0,
          "--sidebar-width-inner": `${width}px`,
        } as React.CSSProperties
      }
    >
      <div className="flex w-(--sidebar-width-inner) shrink-0 flex-col overflow-hidden">
        <AppNav section={section} />
      </div>
      {open && (
        <div
          aria-hidden
          className="group/resize absolute inset-y-0 right-0 z-20 flex w-2 cursor-col-resize touch-none justify-end"
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, w: width }
            setDragging(true)
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) =>
            drag.current &&
            setWidth(
              Math.min(
                WIDTH.max,
                Math.max(WIDTH.min, drag.current.w + e.clientX - drag.current.x)
              )
            )
          }
          onPointerUp={() => {
            drag.current = null
            setDragging(false)
            remember("app_nav_width", width)
          }}
        >
          <span className="h-full w-px bg-transparent transition-colors group-hover/resize:bg-ring/50" />
        </div>
      )}
      <FoldHandle open={open} width={width} onToggle={toggle} />
    </aside>
  )
}

/** The fold handle: a short line on the sidebar's edge that bends into a chevron on hover and says what it'll do */
function FoldHandle({
  open,
  width,
  onToggle,
}: {
  open: boolean
  width: number
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Collapse inner sidebar" : "Expand inner sidebar"}
      aria-expanded={open}
      onClick={onToggle}
      style={{
        // On the content's edge, its bar a step inside the page, as the rail's own handle sits
        left: open
          ? `calc(var(--sidebar-width) + ${width}px)`
          : "var(--sidebar-width)",
      }}
      className="group/rail fixed top-1/2 z-30 hidden h-12 w-7 -translate-y-1/2 cursor-pointer items-center pl-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:flex"
    >
      <span className="flex h-4 w-0.5 flex-col items-center">
        <span
          className={cn(
            "block h-2 w-0.5 origin-bottom rounded-t-full bg-foreground/40 transition-all duration-100 ease-linear group-hover/rail:bg-foreground/60",
            open ? "group-hover/rail:rotate-40" : "group-hover/rail:-rotate-40"
          )}
        />
        <span
          className={cn(
            "block h-2 w-0.5 origin-top rounded-b-full bg-foreground/40 transition-all duration-100 ease-linear group-hover/rail:bg-foreground/60",
            open ? "group-hover/rail:-rotate-40" : "group-hover/rail:rotate-40"
          )}
        />
      </span>
      <span className="pointer-events-none absolute left-full -ml-2 rounded-lg border bg-foreground px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-background opacity-0 transition-opacity group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100">
        {open ? "Collapse" : "Expand"}
      </span>
    </button>
  )
}
