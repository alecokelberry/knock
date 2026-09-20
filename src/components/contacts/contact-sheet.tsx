"use client"

import { MessageSquareIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ACTIVITY_KIND, type Contact } from "@/data/contacts"
import { memberName } from "@/data/team"

import { logTextFor } from "./contacts-store"
import { ActivityIcon, Dot, LifecycleBadge } from "./marks"

/** The floating sheet the contact sheets share */
const FLOATING_SHEET =
  "inset-y-4! right-4! left-auto z-50 flex h-[calc(100svh-2rem)]! w-[min(26rem,calc(100vw-2rem))]! max-w-none! flex-col gap-0 overflow-hidden rounded-xl border-0! bg-popover p-0 outline-none"

/** A homeowner's facts as label-and-value rows */
export function ContactFacts({ contact: c }: { contact: Contact }) {
  const owner = memberName(c.ownerId)
  return (
    <dl className="flex flex-col gap-3">
      <Fact label="Address">{c.address}</Fact>
      <Fact label="Email">{c.email}</Fact>
      <Fact label="Territory">
        {c.territory} · {c.office}
      </Fact>
      <Fact label="Owner">
        <span className="flex items-center justify-end gap-1.5">
          <PersonAvatar
            name={owner}
            size="sm"
            className="data-[size=sm]:size-5"
          />
          {owner}
        </span>
      </Fact>
      <Fact label="Open deals">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          {c.openDeals.count ? (
            <>
              <span>{c.openDeals.count}</span>
              <Dot />
              <span>{c.openDeals.short}</span>
            </>
          ) : (
            "No open deals"
          )}
        </span>
      </Fact>
    </dl>
  )
}

function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="min-w-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium wrap-anywhere text-foreground">
        {children}
      </dd>
    </div>
  )
}

/** The row menu's View Details: who, their stage and last touch, the facts, and Log Text */
export function ContactSheet({
  contact,
  onOpenChange,
}: {
  contact: Contact | null
  onOpenChange: (open: boolean) => void
}) {
  // The last contact stays in the sheet while it slides away
  const [shown, setShown] = useState(contact)
  if (contact && contact !== shown) setShown(contact)
  const c = contact ?? shown
  return (
    <Sheet open={!!contact} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className={FLOATING_SHEET}>
        {c && (
          <>
            <SheetHeader className="shrink-0 gap-3 border-b px-4 pt-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <PersonAvatar name={c.name} className="size-9 shrink-0" />
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-sm">
                      {c.name}
                    </SheetTitle>
                    <SheetDescription className="truncate text-xs">
                      {c.address}
                    </SheetDescription>
                  </div>
                </div>
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="-me-1.5 -mt-1.5"
                      aria-label="Close"
                    />
                  }
                >
                  <XIcon aria-hidden className="size-4" />
                </SheetClose>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LifecycleBadge lifecycle={c.lifecycle} />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ActivityIcon icon={c.lastActivity.icon} />
                  <span>{ACTIVITY_KIND[c.lastActivity.icon]}</span>
                  <Dot />
                  <span>{c.lastActivity.when}</span>
                </span>
              </div>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  <section
                    className="flex flex-col gap-3"
                    aria-labelledby={`${c.id}-summary`}
                  >
                    <h3
                      id={`${c.id}-summary`}
                      className="text-sm font-semibold text-foreground"
                    >
                      Homeowner
                    </h3>
                    <ContactFacts contact={c} />
                  </section>
                </div>
              </ScrollArea>
            </div>
            <SheetFooter className="shrink-0 border-t px-4 py-3">
              <Button
                size="sm"
                className="w-full"
                onClick={() => logTextFor(c)}
              >
                <MessageSquareIcon aria-hidden className="size-4" />
                Log Text
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
