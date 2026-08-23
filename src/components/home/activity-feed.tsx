"use client"

import {
  ArchiveIcon,
  CalendarClockIcon,
  CalendarIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  TargetIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "lucide-react"
import { useState } from "react"

import { LogActivitySheet } from "@/components/activities/log-activity-sheet"
import { FollowUpSheet } from "@/components/home/follow-up-sheet"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { StripedBar } from "@/components/shell/nav-feet"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import { toast } from "@/components/ui/toast"
import { FEED, FEED_RANGES, type FeedItem } from "@/data/activity-feed"
import { cn } from "@/lib/utils"

const TAG = {
  info: "info-light",
  secondary: "secondary",
  destructive: "destructive-light",
  outline: "outline",
} as const

/** Home → Activity Feed: the workspace's recent moves on a timeline; Log activity; each move's menu */
export function ActivityFeed() {
  const [range, setRange] = useState<string>(FEED_RANGES[0])
  const [items, setItems] = useState(FEED)
  const [logging, setLogging] = useState(false)
  const [following, setFollowing] = useState(false)
  const archive = (a: FeedItem) => {
    setItems((all) => all.filter((x) => x.id !== a.id))
    toast.add({
      type: "success",
      title: "Update archived",
      description: `${a.object} moved out of your feed.`,
    })
  }
  return (
    <>
      <CrumbHeader page="Activity Feed">
        <RangeMenu
          ranges={FEED_RANGES}
          short={FEED_RANGES[0]}
          value={range}
          onChange={setRange}
        />
        <Button size="sm" onClick={() => setLogging(true)}>
          <PlusIcon aria-hidden />
          Log activity
        </Button>
      </CrumbHeader>
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="sr-only">Activity feed</h1>
        <Frame>
          <FrameHeader>
            <FrameTitle>Recent Activity</FrameTitle>
            <FrameDescription>
              Latest moves across the workspace
            </FrameDescription>
          </FrameHeader>
          <FramePanel>
            <section aria-labelledby="activity-title">
              <h2 id="activity-title" className="sr-only">
                Recent activity
              </h2>
              <Timeline>
                {items.map((a, i) => (
                  <FeedRow
                    key={a.id}
                    a={a}
                    step={i + 1}
                    last={i === items.length - 1}
                    onArchive={() => archive(a)}
                    onFollowUp={() => setFollowing(true)}
                  />
                ))}
              </Timeline>
              {!items.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nothing new in your feed.
                </p>
              )}
            </section>
          </FramePanel>
        </Frame>
      </div>
      <LogActivitySheet open={logging} onOpenChange={setLogging} />
      <FollowUpSheet open={following} onOpenChange={setFollowing} />
    </>
  )
}

function FeedRow({
  a,
  step,
  last,
  onArchive,
  onFollowUp,
}: {
  a: FeedItem
  step: number
  last: boolean
  onArchive: () => void
  onFollowUp: () => void
}) {
  const Icon =
    "icon" in a.lead
      ? a.lead.icon === "calendar-clock"
        ? CalendarClockIcon
        : TriangleAlertIcon
      : null
  return (
    <TimelineItem
      id={a.id}
      step={step}
      className={cn(
        "group-data-[orientation=vertical]/timeline:ms-9",
        !last && "pb-6"
      )}
    >
      <TimelineHeader className="flex min-w-0 items-start justify-between gap-2.5">
        {!last && (
          <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.75rem)] group-data-[orientation=vertical]/timeline:w-px! group-data-[orientation=vertical]/timeline:translate-y-7" />
        )}
        <TimelineIndicator className="flex size-6 items-center justify-center border-0 bg-background group-data-[orientation=vertical]/timeline:-top-0.5 group-data-[orientation=vertical]/timeline:-left-7">
          {"person" in a.lead ? (
            <PersonAvatar name={a.lead.person} size="sm" />
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full border text-muted-foreground [&_svg]:size-3.5">
              {Icon && <Icon aria-hidden />}
            </span>
          )}
        </TimelineIndicator>
        <TimelineTitle className="min-w-0 text-sm leading-5 font-medium">
          <span className="font-medium">{a.actor}</span>{" "}
          <span className="font-normal text-muted-foreground">{a.verb}</span>{" "}
          <span className="font-medium">{a.object}</span>
        </TimelineTitle>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="-my-0.5"
                aria-label={`Open actions for ${a.object}`}
              />
            }
          >
            <EllipsisVerticalIcon aria-hidden className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                const url = `${location.origin}/activity-feed#${a.id}`
                void navigator.clipboard.writeText(url)
                toast.add({
                  type: "success",
                  title: "Link copied",
                  description: url,
                })
              }}
            >
              <LinkIcon aria-hidden />
              Copy Activity Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFollowUp}>
              <UserPlusIcon aria-hidden />
              Add Follow-Up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <ArchiveIcon aria-hidden />
              Archive Update
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TimelineHeader>
      <TimelineContent className="flex min-w-0 flex-col items-start gap-2 pb-1 text-sm text-muted-foreground">
        {a.body && (
          <p className="max-w-[60ch] text-sm leading-5 text-muted-foreground">
            {a.body}
          </p>
        )}
        {a.files && (
          <div className="flex max-w-full flex-wrap gap-1.5">
            {a.files.map((f) => (
              <ButtonGroup key={f.name}>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-0 gap-1.5 font-normal"
                  onClick={() =>
                    toast.add({
                      type: "info",
                      title: "Opening attachment",
                      description: `${f.name} is opening in a new tab.`,
                    })
                  }
                >
                  <PaperclipIcon aria-hidden />
                  <span className="min-w-0 truncate">{f.name}</span>
                  <span className="text-muted-foreground">({f.size})</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Download ${f.name}`}
                  onClick={() =>
                    toast.add({
                      type: "success",
                      title: "Downloading attachment",
                      description: `${f.name} (${f.size}) is downloading.`,
                    })
                  }
                >
                  <DownloadIcon aria-hidden />
                </Button>
              </ButtonGroup>
            ))}
          </div>
        )}
        {a.attendees && (
          <AvatarGroup className="-space-x-1">
            {a.attendees.names.map((n) => (
              <PersonAvatar key={n} name={n} size="sm" labelled />
            ))}
            <AvatarGroupCount className="size-6 text-[10px] text-foreground/75">
              +{a.attendees.more}
            </AvatarGroupCount>
          </AvatarGroup>
        )}
        {a.event && (
          <div className="inline-flex items-center gap-1.5 rounded-sm border border-border/50 bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
            <CalendarIcon aria-hidden className="size-3 shrink-0 opacity-60" />
            <span className="font-medium text-foreground">{a.event.day}</span>
            <span>{a.event.time}</span>
          </div>
        )}
        {a.mention && (
          <Button
            variant="outline"
            className="h-auto max-w-full justify-start gap-2 py-2 font-normal whitespace-normal"
            onClick={() =>
              toast.add({
                type: "info",
                title: "Opening mention",
                description: "Taking you to the full thread.",
              })
            }
          >
            <MessageSquareIcon aria-hidden className="text-muted-foreground" />
            <span className="min-w-0 flex-1 text-left text-sm leading-5">
              {a.mention}
            </span>
            <span className="shrink-0 font-medium text-primary">View</span>
          </Button>
        )}
        {a.badges && (
          <div className="flex flex-wrap gap-1.5">
            {a.badges.map((b) => (
              <Badge
                key={b.label}
                variant={b.tone === "warning" ? "warning-light" : "outline"}
              >
                {b.icon === "phone" ? (
                  <PhoneIcon aria-hidden />
                ) : (
                  <TargetIcon aria-hidden />
                )}
                {b.label}
              </Badge>
            ))}
          </div>
        )}
        {a.progress !== undefined && (
          <StripedBar
            value={a.progress}
            label="Timeline progress"
            fill="bg-emerald-500"
            className="w-full max-w-48"
          />
        )}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <TimelineDate className="mb-0 text-xs font-medium text-muted-foreground">
            {a.time}
          </TimelineDate>
          <Badge
            variant={TAG[a.tag.tone]}
            aria-label={`${a.tag.label} ${a.tag.value}`}
          >
            <span className="font-normal">{a.tag.label}</span>
            <span>{a.tag.value}</span>
          </Badge>
        </div>
      </TimelineContent>
    </TimelineItem>
  )
}
