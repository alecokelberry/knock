"use client"

import {
  EllipsisVerticalIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react"
import { useState } from "react"

import { NewMeetingSheet } from "@/components/home/new-meeting-sheet"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import { toast } from "@/components/ui/toast"
import {
  MEETINGS,
  type Meeting,
  TODAY_RANGE_SHORT,
  TODAY_RANGES,
} from "@/data/today"
import type { MeetingDraft } from "@/lib/today"

/** Home → Today: the day's meetings as cards, two across; New meeting adds one */
export function Today() {
  const [range, setRange] = useState<string>(TODAY_RANGES[0])
  const [adding, setAdding] = useState(false)
  const [meetings, setMeetings] = useState(MEETINGS)
  const add = (d: MeetingDraft) =>
    setMeetings((all) => [
      ...all,
      {
        id: `m${all.length + 1}`,
        title: d.title,
        time: d.start,
        duration: d.duration,
        body: d.agenda || `${d.account} · ${d.type}`,
        attendees: d.attendees.slice(0, 3),
        more: Math.max(0, d.attendees.length - 3) || undefined,
        tag: d.type,
      },
    ])
  return (
    <>
      <CrumbHeader page="Today">
        <RangeMenu
          ranges={TODAY_RANGES}
          short={TODAY_RANGE_SHORT}
          value={range}
          onChange={setRange}
        />
        <Button size="sm" onClick={() => setAdding(true)}>
          <PlusIcon aria-hidden />
          New meeting
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto w-full max-w-7xl">
        <h1 className="sr-only">Today</h1>
        <div className="grid gap-5 @3xl:grid-cols-2">
          {meetings.map((m) => (
            <MeetingCard key={m.id} m={m} />
          ))}
        </div>
      </div>
      <NewMeetingSheet
        open={adding}
        onOpenChange={setAdding}
        onSchedule={add}
      />
    </>
  )
}

function MeetingCard({ m }: { m: Meeting }) {
  return (
    <Frame stacked>
      <FrameHeader className="flex-row items-center justify-between px-2 py-1">
        <FrameTitle className="font-medium">Meeting</FrameTitle>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${m.title}: more`}
              />
            }
          >
            <EllipsisVerticalIcon
              aria-hidden
              className="size-4 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() =>
                toast.add({
                  type: "info",
                  title: "Edit meeting",
                  description: `Editing ${m.title}.`,
                })
              }
            >
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${location.origin}/today#${m.id}`
                )
                toast.add({
                  type: "success",
                  title: "Link copied",
                  description: "Meeting link copied to your clipboard.",
                })
              }}
            >
              <LinkIcon aria-hidden />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </FrameHeader>
      <FramePanel id={m.id} className="flex flex-col gap-3 p-4">
        <div className="flex justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <button
              type="button"
              onClick={() =>
                toast.add({
                  type: "info",
                  title: m.title,
                  description: "Opening meeting details.",
                })
              }
              className="text-left text-sm leading-tight font-medium outline-none hover:text-primary focus-visible:underline"
            >
              {m.title}
            </button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {m.time}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {m.duration}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{m.body}</p>
        <div className="flex flex-wrap items-center gap-2">
          <AvatarGroup className="-space-x-2">
            {m.attendees.map((name) => (
              <PersonAvatar key={name} name={name} size="sm" labelled />
            ))}
            {m.more && (
              <AvatarGroupCount className="text-[10px] text-foreground/75">
                +{m.more}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
          <Badge variant="secondary">{m.tag}</Badge>
        </div>
      </FramePanel>
      <FramePanel className="px-4 py-2">
        <button
          type="button"
          onClick={() =>
            toast.add({
              type: "info",
              title: "Joining meeting",
              description: "Connect this to your video provider.",
            })
          }
          className="inline-flex items-center gap-2 text-xs font-medium text-primary outline-none hover:underline focus-visible:underline"
        >
          <span
            aria-hidden
            className="flex size-4 items-center justify-center rounded-full bg-sky-500"
          >
            <VideoIcon className="size-2.5 text-white" />
          </span>
          Join Meeting
        </button>
      </FramePanel>
    </Frame>
  )
}
