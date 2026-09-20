"use client"

import { ArrowRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { LIFECYCLE_DOT } from "@/data/contacts"
import { memberName } from "@/data/team"
import type { Territory } from "@/data/territories"
import { directorySummary, knockedShare, territoryCards } from "@/lib/contacts"
import { cn } from "@/lib/utils"

import { AddTerritorySheet } from "./add-territory-sheet"
import { useContacts, useTerritories } from "./contacts-store"
import { Dot, TerritoryIcon, tileInk } from "./marks"

/** Contacts → Territories: the neighborhoods the reps work, as cards that open their homeowners */
export function Territories() {
  const contacts = useContacts()
  const territories = useTerritories()
  const summary = directorySummary(contacts, territories)
  const cards = territoryCards(territories, contacts)
  const [adding, setAdding] = useState(false)
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="sr-only">Territories</h1>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-foreground">
              Territories
            </h2>
            <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
              <span>{summary.territories} territories</span>
              <Dot />
              <span>{summary.contacts} homeowners</span>
              <Dot />
              <span>{summary.openPipelineShort} open pipeline</span>
            </p>
          </div>
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusIcon aria-hidden />
            Add Territory
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((t) => (
            <Card key={t.id} territory={t} />
          ))}
        </div>
      </div>
      <AddTerritorySheet open={adding} onOpenChange={setAdding} />
    </div>
  )
}

function Card({ territory: t }: { territory: Territory }) {
  const knocked = knockedShare(t)
  return (
    <Link
      href={`/contacts?territory=${encodeURIComponent(t.name)}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40 hover:bg-accent/40"
    >
      <div className="flex items-center gap-3">
        <TerritoryTile territory={t} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {t.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.office} · {t.contactCount}{" "}
            {t.contactCount === 1 ? "homeowner" : "homeowners"}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        <Figure label="Doors" value={t.doors.toLocaleString("en-US")} />
        <Figure label="Sold" value={t.sold.toLocaleString("en-US")} />
        <Figure label="Open" value={t.pipelineShort} />
      </dl>
      <Progress value={knocked} className="gap-1.5">
        <ProgressLabel className="text-xs font-normal text-muted-foreground">
          {knocked}% knocked
        </ProgressLabel>
      </Progress>
      <div
        aria-hidden
        className="flex h-1.5 overflow-hidden rounded-full bg-muted"
      >
        {t.segments.map((s) => (
          <span
            key={s.lifecycle}
            className={LIFECYCLE_DOT[s.lifecycle]}
            style={{ width: `${(s.count / t.contactCount) * 100}%` }}
            title={`${s.lifecycle}: ${s.count}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <AvatarGroup className="-space-x-1.5 *:data-[slot=avatar]:ring-card">
          {t.ownerIds.map((id) => (
            <PersonAvatar key={id} name={memberName(id)} size="sm" labelled />
          ))}
        </AvatarGroup>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          View homeowners
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  )
}

/** One of the card's three figures: a small label over the number */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[11px] font-medium text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="truncate text-lg font-semibold text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  )
}

/** A territory's tile: its initials on its colour, or its icon in an outlined tile */
function TerritoryTile({
  territory: t,
  className,
}: {
  territory: Pick<Territory, "tile" | "icon">
  className?: string
}) {
  // The tile sits beside the name, so it's hidden from screen readers
  if (t.tile.kind === "initials")
    return (
      <div
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
          tileInk(t.tile.bg),
          className
        )}
      >
        {t.tile.text}
      </div>
    )
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground",
        className
      )}
    >
      <TerritoryIcon icon={t.tile.icon} className="size-5" />
    </div>
  )
}
