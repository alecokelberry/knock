"use client"

import {
  CalendarCheckIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  FileCheckIcon,
  FilePenLineIcon,
  FunnelIcon,
  HandshakeIcon,
  HeadphonesIcon,
  InboxIcon,
  type LucideIcon,
  MailOpenIcon,
  MessageSquareIcon,
  MonitorPlayIcon,
  NotebookPenIcon,
  PhoneCallIcon,
  PhoneForwardedIcon,
  PhoneIncomingIcon,
  PhoneMissedIcon,
  PhoneOutgoingIcon,
  PlusIcon,
  ReplyIcon,
  SparklesIcon,
  SprayCanIcon,
  TriangleAlertIcon,
  TrophyIcon,
  UsersIcon,
  VoicemailIcon,
} from "lucide-react"
import { useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Frame, FrameHeader, FramePanel } from "@/components/ui/frame"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import { toast } from "@/components/ui/toast"
import { ACTIVITIES, ACTIVITY_TABS, type Activity } from "@/data/activities"
import { ACTIVITY_OWNER_IDS, memberName } from "@/data/team"
import {
  type ActivityTab,
  ALL_OWNERS,
  emptyDescription,
  filterActivities,
  foldDay,
  groupActivities,
  inViewLabel,
  type LoggedActivity,
  loggedActivity,
  settleTimeline,
  statusVariant,
} from "@/lib/activities"
import { cn } from "@/lib/utils"

import { IconStack } from "./icon-stack"
import { LogActivitySheet } from "./log-activity-sheet"

const ICONS: Record<string, LucideIcon> = {
  "phone-call": PhoneCallIcon,
  reply: ReplyIcon,
  trophy: TrophyIcon,
  "triangle-alert": TriangleAlertIcon,
  "monitor-play": MonitorPlayIcon,
  voicemail: VoicemailIcon,
  "phone-incoming": PhoneIncomingIcon,
  "phone-outgoing": PhoneOutgoingIcon,
  "file-check": FileCheckIcon,
  "calendar-clock": CalendarClockIcon,
  "phone-missed": PhoneMissedIcon,
  "phone-forwarded": PhoneForwardedIcon,
  headphones: HeadphonesIcon,
  handshake: HandshakeIcon,
  "mail-open": MailOpenIcon,
  "notebook-pen": NotebookPenIcon,
  "message-square": MessageSquareIcon,
  "door-open": DoorOpenIcon,
  "door-closed": DoorClosedIcon,
  "file-pen-line": FilePenLineIcon,
  "spray-can": SprayCanIcon,
  "calendar-check": CalendarCheckIcon,
  sparkles: SparklesIcon,
}

const OWNER_ITEMS = [
  { value: ALL_OWNERS, label: "All owners" },
  ...ACTIVITY_OWNER_IDS.map((id) => ({ value: id, label: memberName(id) })),
]

/** Activities → All Activities: the timeline of touches by day, with the type tabs, the owner filter and Log activity */
export function ActivityTimeline() {
  const [activities, setActivities] = useState(ACTIVITIES)
  const [tab, setTab] = useState<ActivityTab>("All")
  const [owner, setOwner] = useState(ALL_OWNERS)
  const [logOpen, setLogOpen] = useState(false)
  const [view, setView] = useState(() =>
    settleTimeline(null, groupActivities(ACTIVITIES))
  )

  const list = filterActivities(activities, tab, owner)
  const groups = groupActivities(list)
  const filtered = tab !== "All" || owner !== ALL_OWNERS
  // Every change of what's shown settles which days and details stay open (see settleTimeline)
  const show = (next: {
    activities?: Activity[]
    tab?: ActivityTab
    owner?: string
  }) => {
    const all = next.activities ?? activities
    setView((v) =>
      settleTimeline(
        v,
        groupActivities(
          filterActivities(all, next.tab ?? tab, next.owner ?? owner)
        )
      )
    )
    if (next.activities) setActivities(next.activities)
    if (next.tab) setTab(next.tab)
    if (next.owner) setOwner(next.owner)
  }
  const clearFilters = () => show({ tab: "All", owner: ALL_OWNERS })
  // Log activity toasts and lands the touch at the top of its day
  const log = (f: LoggedActivity) =>
    show({
      activities: [loggedActivity(activities, f, new Date()), ...activities],
    })

  return (
    <section
      className="mx-auto w-full max-w-7xl"
      aria-labelledby="activity-timeline-title"
    >
      <h1 className="sr-only">Activity timeline</h1>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h1
            id="activity-timeline-title"
            className="text-xl font-semibold tracking-tight"
          >
            Activity
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            {inViewLabel(list.length)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            aria-label="Filter by activity type"
            value={tab}
            onValueChange={(v) => show({ tab: v as ActivityTab })}
          >
            <TabsList>
              {ACTIVITY_TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Select
            items={OWNER_ITEMS}
            value={owner}
            onValueChange={(v) => v && show({ owner: v })}
          >
            <SelectTrigger
              size="sm"
              aria-label="Owner"
              className="w-[150px] sm:ml-auto"
            >
              <UsersIcon className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              {OWNER_ITEMS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setLogOpen(true)}>
            <PlusIcon />
            Log activity
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex min-h-[360px] w-full items-center justify-center px-4 py-10 md:py-12">
          <Empty className="w-full flex-none gap-6 border-0 bg-transparent p-0 md:p-0">
            <EmptyHeader className="max-w-108 gap-5">
              <EmptyMedia className="mb-0">
                <IconStack>
                  <InboxIcon className="size-6" strokeWidth={1.9} />
                </IconStack>
              </EmptyMedia>
              <div className="flex flex-col items-center gap-2">
                <EmptyTitle className="text-xl font-semibold sm:text-2xl">
                  No Matching Activity
                </EmptyTitle>
                <EmptyDescription className="max-w-96">
                  {emptyDescription(tab)}
                </EmptyDescription>
              </div>
            </EmptyHeader>
            <EmptyContent className="max-w-none items-center gap-0">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ group, items }) => {
            // Each day is a heading for its items' h3 titles, so the outline doesn't skip from the h1 to them
            const body = (
              <Timeline>
                {items.map((a, i) => (
                  <ActivityItem
                    key={a.id}
                    activity={a}
                    step={i + 1}
                    open={!!view.open[a.id]}
                    onOpenChange={(o) =>
                      setView((v) => ({ ...v, open: { ...v.open, [a.id]: o } }))
                    }
                  />
                ))}
              </Timeline>
            )
            const label = (
              <>
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group}
                </span>
                <span
                  aria-hidden
                  className="h-2.5 grow rounded-full border border-border/50 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_1px,transparent_1px,transparent_5px)] text-muted-foreground/30"
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </>
            )
            // A lone item's day has no fold
            if (items.length < 2)
              return (
                <div key={group}>
                  <h2 className="sr-only">{group}</h2>
                  <div className="mb-4 flex items-center gap-3">{label}</div>
                  {body}
                </div>
              )
            return (
              <Collapsible
                key={group}
                open={!view.folded.includes(group)}
                onOpenChange={(o) =>
                  setView((v) => foldDay(v, groups, group, !o))
                }
                className="group/bucket"
              >
                <h2 className="sr-only">{group}</h2>
                <CollapsibleTrigger
                  aria-label={`Toggle ${group} activities`}
                  className="mb-4 flex w-full cursor-pointer items-center gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {label}
                  <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open/bucket:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>{body}</CollapsibleContent>
              </Collapsible>
            )
          })}
          {filtered && (
            <div className="flex justify-center pt-1">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FunnelIcon className="size-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      <LogActivitySheet open={logOpen} onOpenChange={setLogOpen} onLog={log} />
    </section>
  )
}

function ActivityItem({
  activity: a,
  step,
  open,
  onOpenChange,
}: {
  activity: Activity
  step: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const Icon = ICONS[a.icon] ?? PhoneCallIcon
  const ownerName = memberName(a.ownerId)
  function copy() {
    void navigator.clipboard.writeText(a.id).catch(() => {})
    toast.add({
      type: "success",
      title: "Reference copied",
      description: `${a.id} for ${a.household} is on your clipboard.`,
      timeout: 4000,
    })
  }
  return (
    <TimelineItem step={step + 99} className="ms-10 pb-6">
      <TimelineHeader>
        <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.5rem)] group-data-[orientation=vertical]/timeline:w-px! group-data-[orientation=vertical]/timeline:translate-y-7" />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TimelineTitle className="font-semibold">{a.title}</TimelineTitle>
          <Badge variant={statusVariant(a.dot)} className="gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", a.dot)} />
            {a.status}
          </Badge>
        </div>
        <TimelineIndicator className="flex size-6 items-center justify-center border border-border bg-background text-muted-foreground group-data-completed/timeline-item:border-border group-data-[orientation=vertical]/timeline:-left-5 [&_svg]:size-3.5">
          <Icon />
        </TimelineIndicator>
      </TimelineHeader>
      <TimelineContent className="mt-1.5">
        <Frame spacing="sm" stacked dense>
          <Collapsible
            open={open}
            onOpenChange={onOpenChange}
            className="group/collapsible"
          >
            <CollapsibleTrigger
              aria-label={`Toggle ${a.title} details`}
              className="flex w-full cursor-pointer text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {a.household}
                  </span>
                  <span className="min-w-0 truncate text-xs text-muted-foreground">
                    {a.address ? `${a.address} · ${a.time}` : a.time}
                  </span>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </FrameHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <FramePanel className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {a.text}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-t pt-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <PersonAvatar name={ownerName} className="size-6" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-medium text-foreground">
                          {ownerName}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {a.ownerRole}
                        </span>
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={copy}>
                      <CopyIcon className="size-3.5" />
                      {a.id}
                    </Button>
                  </div>
                </div>
              </FramePanel>
            </CollapsibleContent>
          </Collapsible>
        </Frame>
      </TimelineContent>
    </TimelineItem>
  )
}
