"use client"

import { Command as CommandPrimitive } from "cmdk"
import { MapPinIcon, SearchIcon, TargetIcon, XIcon } from "lucide-react"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { CONTACTS } from "@/data/contacts"
import { DEAL_STAGES, DEALS } from "@/data/deals"
import { TERRITORIES } from "@/data/territories"
import { NAV } from "@/lib/nav"
import { cn } from "@/lib/utils"

const STAGE_LABEL = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.id, s.label])
) as Record<string, string>

/** The rail's Search button opens the same dialog as ⌘K */
const OPEN_EVENT = "search:open"
export const openSearch = () => window.dispatchEvent(new Event(OPEN_EVENT))

const PAGES = NAV.flatMap((s) => s.pages.map((p) => ({ ...p, app: s.label })))

/**
 * Search, opened by ⌘K or the rail's button (the top bar has no search box): a small centred dialog that
 * finds homeowners, territories, households and pages as you type, growing downward.
 */
export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  const go = <T extends string>(href: Route<T>) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[calc(50%-28px)] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search your workspace content.
        </DialogDescription>
        <Command className="rounded-none! bg-transparent p-0" shouldFilter>
          <div className="flex h-14 items-center gap-2 px-4">
            <SearchIcon
              aria-hidden
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              aria-label="Search"
              className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <DialogClose
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Close" />
              }
            >
              <XIcon aria-hidden />
            </DialogClose>
          </div>
          {/* Always mounted, so the input's aria-controls points at a real list; hidden until there's a query */}
          <CommandList
            className={cn("max-h-80 border-t p-1", !query && "hidden")}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            {query && (
              <>
                <CommandGroup heading="Contacts">
                  {CONTACTS.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`${c.name} ${c.address} ${c.territory} ${c.email}`}
                      onSelect={() => go(`/contacts/${c.id}`)}
                    >
                      <PersonAvatar name={c.name} size="sm" />
                      <span className="truncate">{c.name}</span>
                      <CommandShortcut className="tracking-normal">
                        {c.territory}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Territories">
                  {TERRITORIES.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={`territory ${t.name} ${t.office}`}
                      onSelect={() =>
                        go(`/contacts?territory=${encodeURIComponent(t.name)}`)
                      }
                    >
                      <MapPinIcon aria-hidden />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Households">
                  {DEALS.map((d) => (
                    <CommandItem
                      key={d.id}
                      value={`household ${d.household} ${d.address} ${d.territory}`}
                      onSelect={() => go("/pipeline")}
                    >
                      <TargetIcon aria-hidden />
                      {d.household}
                      <CommandShortcut className="tracking-normal">
                        {STAGE_LABEL[d.stage]}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Pages">
                  {PAGES.map((p) => (
                    <CommandItem
                      key={p.href}
                      value={`page ${p.app} ${p.label}`}
                      onSelect={() => go(p.href)}
                    >
                      <p.icon aria-hidden />
                      {p.label}
                      <CommandShortcut className="tracking-normal">
                        {p.app}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
