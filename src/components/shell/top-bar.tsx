"use client"

import {
  Building2Icon,
  ChartColumnIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  MegaphoneIcon,
  PlusIcon,
  TargetIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Notifications } from "@/components/shell/notifications"
import { SearchCommand } from "@/components/shell/search-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import {
  APPLICATIONS,
  CREATE_APPLICATION_LABEL,
  CREATE_MENU,
  CREATE_WORKSPACE_LABEL,
  WORKSPACES,
  type Workspace,
} from "@/data/workspace"
import { NAV } from "@/lib/nav"

const ICON = {
  target: TargetIcon,
  megaphone: MegaphoneIcon,
  "chart-column": ChartColumnIcon,
  "user-plus": UserPlusIcon,
  building2: Building2Icon,
  upload: UploadIcon,
  "file-text": FileTextIcon,
} as const

/** A workspace's round mark: its gradient, top left to bottom right */
function WorkspaceDot({ w, className }: { w: Workspace; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        borderRadius: 9999,
        backgroundImage: `linear-gradient(135deg, ${w.gradient.map(([at, c]) => `${c} ${at}%`).join(", ")})`,
      }}
    />
  )
}

/**
 * The top bar: the workspace and the application as switchers on the left, then Create and the bell
 * (search is ⌘K and the rail's button). On a phone the menu button opens the rail and the app's pages in a sheet.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex h-[calc(var(--header-height)+env(safe-area-inset-top))] w-full shrink-0 items-center gap-2 border-b bg-background ps-2.5 pe-2 pt-[env(safe-area-inset-top)] md:rounded-t-xl md:ps-0">
      <div className="flex flex-1 items-center gap-1.5 md:flex-none">
        <SidebarTrigger className="md:hidden" />
        <Switchers />
      </div>
      <SearchCommand />
      <div className="ml-auto flex items-center gap-1">
        <CreateMenu />
        <Notifications />
      </div>
    </header>
  )
}

/** The workspace ("Vantage Marketing") and the application ("CRM"), each a menu to switch or create one */
function Switchers() {
  const [workspace, setWorkspace] = useState(
    WORKSPACES.find((w) => w.current)!.id
  )
  const [app, setApp] = useState(APPLICATIONS.find((a) => a.current)!.id)
  const ws = WORKSPACES.find((w) => w.id === workspace)!
  const current = APPLICATIONS.find((a) => a.id === app)!
  return (
    <Breadcrumb aria-label="Workspace">
      <BreadcrumbList className="gap-0.5">
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-foreground aria-expanded:bg-muted"
                />
              }
            >
              <WorkspaceDot w={ws} className="size-3 shrink-0" />
              <span className="sr-only sm:not-sr-only">{ws.name}</span>
              <ChevronsUpDownIcon aria-hidden className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className="w-56"
              aria-label="Organizations"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                {WORKSPACES.map((w) => (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => setWorkspace(w.id)}
                    className="gap-2"
                  >
                    <WorkspaceDot w={w} className="size-5 shrink-0" />
                    <span className="grid flex-1 leading-tight">
                      <span className="truncate font-medium">{w.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {w.plan}
                      </span>
                    </span>
                    {w.id === workspace && (
                      <CheckIcon aria-hidden className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  toast.add({
                    type: "info",
                    title: "Create organization",
                    description: "Opening the organization setup.",
                  })
                }
              >
                <PlusIcon aria-hidden />
                {CREATE_WORKSPACE_LABEL}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-xs opacity-60">
          /
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-foreground aria-expanded:bg-muted"
                />
              }
            >
              {current.name}
              <ChevronsUpDownIcon aria-hidden className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className="w-48"
              aria-label="Applications"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Applications</DropdownMenuLabel>
                {APPLICATIONS.map((a) => {
                  const Icon = ICON[a.icon as keyof typeof ICON]
                  return (
                    <DropdownMenuItem key={a.id} onClick={() => setApp(a.id)}>
                      <Icon aria-hidden />
                      <span className="flex-1">{a.name}</span>
                      {a.id === app && (
                        <CheckIcon aria-hidden className="size-4" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  toast.add({
                    type: "info",
                    title: "Create application",
                    description: "Opening the application setup.",
                  })
                }
              >
                <PlusIcon aria-hidden />
                {CREATE_APPLICATION_LABEL}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/** The Create menu: new records, then import and reporting, each opening its page (once that page is built) */
function CreateMenu() {
  const built = (href: string) =>
    NAV.some((s) => s.pages.some((p) => p.href === href))
  const items = CREATE_MENU.filter((i) => i.href && built(i.href))
  if (!items.length) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1 aria-expanded:bg-muted max-sm:size-7 max-sm:px-0"
          />
        }
        aria-label="Create"
      >
        <PlusIcon aria-hidden />
        <span className="hidden sm:inline">Create</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-48"
        aria-label="Create"
      >
        {[
          items.filter((i) => CREATE_MENU.indexOf(i) < 3),
          items.filter((i) => CREATE_MENU.indexOf(i) >= 3),
        ]
          .filter((g) => g.length)
          .map((group, i) => (
            <DropdownMenuGroup key={group[0]?.label}>
              {i > 0 && <DropdownMenuSeparator />}
              {group.map((item) => {
                const Icon = ICON[item.icon as keyof typeof ICON]
                return (
                  <DropdownMenuItem
                    key={item.label}
                    render={<Link href={item.href!} />}
                    className="max-md:min-h-10"
                  >
                    <Icon aria-hidden />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
