"use client"

import {
  BellIcon,
  CalendarClockIcon,
  CheckIcon,
  CircleXIcon,
  CreditCardIcon,
  FileTextIcon,
  MailIcon,
  ReceiptTextIcon,
  SendIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import type { Quote } from "@/data/quotes"
import {
  canSend,
  type QuoteStep,
  type QuoteTone,
  quoteStage,
  recordDates,
} from "@/lib/quotes"
import { cn } from "@/lib/utils"

import { BADGE, PlanBadge, STATUS_BADGE } from "./quote-badges"

const CHIP = {
  destructive: "destructive-light",
  warning: "warning-light",
  info: "info-light",
  success: "success-light",
  muted: "secondary",
  secondary: "secondary",
  outline: "outline",
} as const
const BAR: Record<QuoteTone, string> = {
  destructive: "**:data-[slot=progress-indicator]:bg-destructive",
  warning: "**:data-[slot=progress-indicator]:bg-warning",
  info: "**:data-[slot=progress-indicator]:bg-info",
  success: "**:data-[slot=progress-indicator]:bg-success",
  muted: "**:data-[slot=progress-indicator]:bg-muted-foreground",
}
const DOT: Record<QuoteTone, string> = {
  destructive:
    "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/15",
  warning: "border-warning/20 bg-warning/10 text-warning dark:bg-warning/15",
  info: "border-info/20 bg-info/10 text-info dark:bg-info/15",
  success: "border-success/20 bg-success/10 text-success dark:bg-success/15",
  muted: "border-border bg-muted text-muted-foreground",
}
const STEP_ICON: Record<QuoteStep["kind"], typeof BellIcon> = {
  issued: ReceiptTextIcon,
  "followed-up": SendIcon,
  "follow-up": BellIcon,
  escalation: TriangleAlertIcon,
  window: CalendarClockIcon,
  deal: CreditCardIcon,
  send: MailIcon,
  accepted: CheckIcon,
  report: FileTextIcon,
  stopped: CircleXIcon,
}
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const SECTION =
  "text-xs font-medium tracking-wide text-muted-foreground uppercase"

/** The quote sheet: the quote's amount and stage, its record facts, owner and acceptance path, and Send quote */
export function QuoteSheet({
  quote,
  onOpenChange,
  onSend,
}: {
  quote: Quote | null
  onOpenChange: (open: boolean) => void
  onSend: (q: Quote) => void
}) {
  return (
    <Sheet open={!!quote} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="inset-y-4! right-4! left-auto z-[60] flex h-[calc(100svh-2rem)]! w-[min(34rem,calc(100vw-2rem))]! max-w-none! flex-col gap-0 overflow-hidden rounded-xl border-0! bg-popover p-0 outline-none"
      >
        {quote && <Body q={quote} onSend={onSend} />}
      </SheetContent>
    </Sheet>
  )
}

function Body({ q, onSend }: { q: Quote; onSend: (q: Quote) => void }) {
  const stage = quoteStage(q)
  const dates = recordDates(q)
  const facts: [string, string, boolean?][] = [
    ["Quote", q.id, true],
    ["Address", q.address, true],
    ["Issued", dates.issued],
    ["Valid until", dates.valid],
    ["Household", q.dealId ?? "No deal"],
    ["Memo", q.memo],
  ]
  return (
    <>
      <SheetHeader className="shrink-0 gap-0 border-b p-0">
        <div className="flex min-h-11 items-center justify-between gap-2 px-5">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ReceiptTextIcon aria-hidden className="size-3.5" />
            {q.id}
          </span>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label="Close quote details"
              />
            }
          >
            <XIcon aria-hidden />
          </SheetClose>
        </div>
        <div className="flex min-w-0 flex-col gap-3 px-5 pt-1 pb-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-background">
              <PersonAvatar name={q.household} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <SheetTitle className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
                  {q.household}
                </SheetTitle>
                <Badge variant={STATUS_BADGE[q.status]} className={BADGE}>
                  {q.status}
                </Badge>
              </div>
              <SheetDescription className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <span>{q.memo}</span>
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
                />
                <span>{q.address}</span>
              </SheetDescription>
            </div>
          </div>
        </div>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className={SECTION}>Quote amount</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {USD.format(q.amount)}
                </span>
                <PlanBadge plan={q.plan} />
              </div>
            </div>
            <Badge
              variant={CHIP[stage.chipTone]}
              className={cn(BADGE, "mb-1 rounded-full")}
            >
              {stage.chip}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative h-1 overflow-hidden rounded-full bg-muted/55">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_1px,transparent_0,transparent_4px)] text-muted-foreground opacity-20"
              />
              <Progress
                value={stage.percent}
                aria-label={stage.label}
                className={cn(
                  "absolute inset-0 gap-0 **:data-[slot=progress-track]:h-full **:data-[slot=progress-track]:bg-transparent",
                  BAR[stage.tone]
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{stage.label}</span>
              <span className="tabular-nums">{stage.percent}% complete</span>
            </div>
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            {stage.note}
          </p>
        </div>
        <Separator className="opacity-60" />
        <div className="flex flex-col gap-3 px-5 py-4">
          <h3 className={SECTION}>Record Facts</h3>
          <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2.5">
            {facts.map(([label, value, mono]) => (
              <div key={label} className="contents">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd
                  className={cn(
                    "min-w-0 text-foreground",
                    mono ? "font-mono text-xs leading-5" : "text-sm"
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <Separator className="opacity-60" />
        <div className="flex flex-col gap-3 px-5 py-4">
          <h3 className={SECTION}>Quote Owner</h3>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <PersonAvatar name={q.owner} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {q.owner}
                </p>
                <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">Quote owner</span>
                  <span
                    aria-hidden
                    className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
                  />
                  <span className="truncate">{q.address}</span>
                </p>
              </div>
            </div>
            <Badge variant="outline" className={BADGE}>
              Owner
            </Badge>
          </div>
        </div>
        <Separator className="opacity-60" />
        <div className="flex flex-col gap-3 px-5 py-4">
          <h3 className={SECTION}>Acceptance Path</h3>
          <Timeline defaultValue={0}>
            {stage.steps.map((s, i) => {
              const Icon = STEP_ICON[s.kind]
              return (
                <TimelineItem key={s.kind} step={i + 1} className="gap-0.5">
                  <TimelineHeader className="flex min-w-0 items-start justify-between gap-2.5">
                    <TimelineSeparator className="bg-border group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem-0.5rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
                    <TimelineIndicator
                      className={cn(
                        "flex size-5 items-center justify-center border [&_svg]:size-3",
                        DOT[s.tone]
                      )}
                    >
                      <Icon aria-hidden className="size-3.5" />
                    </TimelineIndicator>
                    <TimelineTitle className="min-w-0 text-sm leading-5">
                      <span className="font-medium text-foreground">
                        {s.title}
                      </span>
                    </TimelineTitle>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {s.when}
                    </span>
                  </TimelineHeader>
                  <TimelineContent className="flex min-w-0 flex-col items-start gap-1 pb-1">
                    <p className="max-w-[52ch] text-sm leading-5 text-muted-foreground">
                      {s.text}
                    </p>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        </div>
      </ScrollArea>
      <SheetFooter className="mt-0 shrink-0 border-t px-5 py-3">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Changes sync with pipeline totals and follow-up workflow.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Close
            </SheetClose>
            <Button size="sm" disabled={!canSend(q)} onClick={() => onSend(q)}>
              <SendIcon aria-hidden data-icon="inline-start" />
              Send quote
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  )
}
