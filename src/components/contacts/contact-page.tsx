"use client"

import { ChevronLeftIcon, MessageSquareIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState } from "react"

import { DealAddSheet } from "@/components/sales/deal-add-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
} from "@/components/ui/frame"
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import type { ContactEvent } from "@/data/contacts"
import { memberName } from "@/data/team"
import { addDeal } from "@/lib/contacts"
import { cn } from "@/lib/utils"

import { ContactFacts } from "./contact-sheet"
import { logTextFor, updateContact, useContacts } from "./contacts-store"
import { ActivityIcon, BADGE, Dot, LifecycleBadge } from "./marks"

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** An event's status badge takes its dot's tone: green, amber, or the plain grey */
const STATUS_BADGE = (dot: string) =>
  dot === "bg-success"
    ? "success-light"
    : dot === "bg-warning"
      ? "warning-light"
      : "secondary"

/** Contacts → a homeowner: who they are, their open deal and their activity */
export function ContactPage({ id }: { id: number }) {
  const contact = useContacts().find((c) => c.id === id)
  const [dealing, setDealing] = useState(false)
  // Deleted this visit, or never there
  if (!contact) notFound()
  const c = contact
  const owner = memberName(c.ownerId)
  return (
    <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
      <div className="flex flex-col gap-4">
        <Link
          href="/contacts"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ms-2.5 w-fit text-muted-foreground"
          )}
        >
          <ChevronLeftIcon aria-hidden />
          Back to contacts
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar name={c.name} className="size-12 shrink-0" />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {c.name}
                </h1>
                <LifecycleBadge lifecycle={c.lifecycle} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <span className="min-w-0 truncate">{c.address}</span>
                <Dot />
                <span className="min-w-0 truncate">{c.territory}</span>
                <Dot />
                <span className="flex min-w-0 items-center gap-1.5">
                  <PersonAvatar
                    name={owner}
                    size="sm"
                    className="shrink-0 data-[size=sm]:size-5"
                  />
                  <span className="truncate">{owner}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => logTextFor(c)}>
              <MessageSquareIcon aria-hidden />
              Log text
            </Button>
            {/* Add deal, priced for this home; it joins the homeowner's open deals */}
            <Button size="sm" onClick={() => setDealing(true)}>
              <PlusIcon aria-hidden />
              New deal
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-5 @3xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Frame spacing="sm">
            <FrameHeader>
              <h2
                data-slot="frame-panel-title"
                className="text-sm font-semibold"
              >
                Homeowner
              </h2>
            </FrameHeader>
            <FramePanel>
              <ContactFacts contact={c} />
            </FramePanel>
          </Frame>
          <Frame spacing="sm">
            <FrameHeader className="flex-row items-center justify-between gap-3">
              <h2
                data-slot="frame-panel-title"
                className="text-sm font-semibold"
              >
                Open deals
              </h2>
              <Badge variant="secondary" className={BADGE}>
                {c.openDeals.count}
              </Badge>
            </FrameHeader>
            <FramePanel>
              {c.openDeals.count ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-2xl font-semibold text-foreground tabular-nums">
                    {USD.format(c.openDeals.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.openDeals.count} open{" "}
                    {c.openDeals.count === 1 ? "deal" : "deals"} on{" "}
                    {c.territory}
                  </span>
                </div>
              ) : (
                <p className="text-sm leading-5 text-muted-foreground">
                  Nothing open for {c.name}. Add a deal when they're pitched or
                  add a plan.
                </p>
              )}
            </FramePanel>
          </Frame>
        </div>
        <Frame spacing="sm">
          <FrameHeader className="flex-row items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2
                data-slot="frame-panel-title"
                className="text-sm font-semibold"
              >
                Activity
              </h2>
              <FrameDescription className="text-xs">
                {c.activity.length}{" "}
                {c.activity.length === 1 ? "event" : "events"} with {c.name}
              </FrameDescription>
            </div>
          </FrameHeader>
          <FramePanel>
            {c.activity.length ? (
              <Timeline value={c.activity.length}>
                {c.activity.map((e, i) => (
                  <Event
                    // oxlint-disable-next-line react/no-array-index-key -- the timeline is fixed, and two events can share a title and time
                    key={`${e.title}-${e.when}-${i}`}
                    event={e}
                    step={i + 1}
                  />
                ))}
              </Timeline>
            ) : (
              <p className="text-sm leading-5 text-muted-foreground">
                No activity with {c.name} yet.
              </p>
            )}
          </FramePanel>
        </Frame>
      </div>
      <DealAddSheet
        open={dealing}
        onOpenChange={setDealing}
        onCreate={(deal) => updateContact(c.id, (x) => addDeal(x, deal.value))}
      />
    </div>
  )
}

function Event({ event: e, step }: { event: ContactEvent; step: number }) {
  const actor = memberName(e.actorId)
  return (
    <TimelineItem step={step} className="ms-10 pb-6 last:pb-0">
      <TimelineHeader>
        <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.5rem)] group-data-[orientation=vertical]/timeline:w-px! group-data-[orientation=vertical]/timeline:translate-y-7" />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TimelineTitle className="text-sm font-semibold">
            {e.title}
          </TimelineTitle>
          <Badge variant={STATUS_BADGE(e.dot)} className={cn(BADGE, "gap-1.5")}>
            <span
              aria-hidden
              className={cn("size-1.5 shrink-0 rounded-full", e.dot)}
            />
            {e.status}
          </Badge>
        </div>
        <TimelineIndicator className="flex size-6 items-center justify-center border border-border bg-background text-muted-foreground group-data-completed/timeline-item:border-border group-data-[orientation=vertical]/timeline:-left-5 [&_svg]:size-3.5">
          <ActivityIcon icon={e.icon} />
        </TimelineIndicator>
      </TimelineHeader>
      <TimelineContent className="mt-1.5 flex flex-col gap-2.5">
        <p className="text-xs leading-5 text-muted-foreground">{e.text}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <PersonAvatar
              name={actor}
              size="sm"
              className="shrink-0 data-[size=sm]:size-5"
            />
            <span className="truncate font-medium text-foreground">
              {actor}
            </span>
          </span>
          <Dot />
          <span>{e.when}</span>
        </div>
      </TimelineContent>
    </TimelineItem>
  )
}
