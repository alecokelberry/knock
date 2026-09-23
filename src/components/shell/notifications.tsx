"use client"

import {
  ActivityIcon,
  BellIcon,
  CalendarIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CreditCardIcon,
  DownloadIcon,
  PaperclipIcon,
  RocketIcon,
  ShieldAlertIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { StripedBar } from "@/components/shell/nav-feet"
import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NOTIFICATIONS,
  type Notification,
  UNREAD_NOTIFICATIONS,
} from "@/data/shell"
import { cn } from "@/lib/utils"

const ICONS = {
  "trending-up": TrendingUpIcon,
  "circle-check": CircleCheckIcon,
  users: UsersIcon,
  star: StarIcon,
  calendar: CalendarIcon,
  "credit-card": CreditCardIcon,
  "shield-alert": ShieldAlertIcon,
  activity: ActivityIcon,
  rocket: RocketIcon,
  "circle-alert": CircleAlertIcon,
} as const
const TONE = {
  warning: "text-warning",
  success: "text-success",
  info: "text-info",
  destructive: "text-destructive",
} as const

/**
 * The bell: a dot while anything is unread, opening the notifications sheet (a count beside the title,
 * Mark all as read, the feed, View all). The buttons act: the first of a pair does it
 * and clears the notification, Dismiss and Decline just clear it.
 */
export function Notifications() {
  const [items, setItems] = useState(NOTIFICATIONS)
  const [unread, setUnread] = useState(UNREAD_NOTIFICATIONS)
  const clear = (n: Notification, verb: string, primary: boolean) => {
    setItems((all) => all.filter((x) => x.id !== n.id))
    setUnread((u) => Math.max(0, u - 1))
    if (primary)
      toast.add({
        type: "success",
        title: verb,
        description: n.title.map((r) => r.text).join(""),
      })
  }
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={
              unread ? `Notifications, ${unread} unread` : "Notifications"
            }
          />
        }
      >
        <BellIcon aria-hidden className="size-4" />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-0.5 right-1 size-1.5 rounded-full bg-primary"
          />
        )}
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="w-96 gap-0 sm:max-w-96">
        <SheetHeader className="gap-0.5 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-sm">Notifications</SheetTitle>
              {unread > 0 && <Badge className="rounded-full!">{unread}</Badge>}
            </div>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mark all as read"
                      disabled={!unread}
                      onClick={() => setUnread(0)}
                    />
                  }
                >
                  <CheckCheckIcon aria-hidden className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Mark all as read</TooltipContent>
              </Tooltip>
              <SheetClose
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Close" />
                }
              >
                <XIcon aria-hidden className="size-3.5" />
              </SheetClose>
            </div>
          </div>
          <SheetDescription className="sr-only">
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 grow">
          <div className="flex flex-col">
            {items.map((n, i) => (
              <Fragment key={n.id}>
                {i > 0 && <Separator className="opacity-60" />}
                <NotificationRow
                  n={n}
                  onAct={(verb, primary) => clear(n, verb, primary)}
                />
              </Fragment>
            ))}
            {!items.length && (
              <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                You&apos;re all caught up.
              </p>
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-3 py-2">
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                nativeButton={false}
                render={<Link href="/activity-feed" />}
              />
            }
          >
            View all notifications
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NotificationRow({
  n,
  onAct,
}: {
  n: Notification
  onAct: (verb: string, primary: boolean) => void
}) {
  const Icon = "icon" in n.lead ? ICONS[n.lead.icon] : null
  return (
    <div className="flex w-full items-start gap-2 px-4 py-2 text-left">
      <div className="shrink-0">
        {"person" in n.lead ? (
          <PersonAvatar name={n.lead.person} size="sm" />
        ) : (
          <div
            className={cn(
              "flex size-6 items-center justify-center [&_svg]:size-4",
              TONE[n.lead.tone]
            )}
          >
            {Icon && <Icon aria-hidden />}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs leading-snug text-foreground">
            {n.title.map((r, i) => (
              <span
                // oxlint-disable-next-line react/no-array-index-key -- a title's text runs never reorder
                key={i}
                className={cn(
                  r.kind === "name" && "font-medium text-primary",
                  r.kind === "bold" && "font-medium"
                )}
              >
                {r.text}
              </span>
            ))}
          </p>
          {n.badge && (
            <Badge variant="outline" className="shrink-0">
              {n.badge}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
        {n.rating && (
          <div
            role="img"
            aria-label={`${n.rating} out of 5 stars`}
            className="mt-0.5 flex items-center"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                // Five stars, which never reorder
                key={i}
                aria-hidden
                className={cn(
                  "size-4",
                  i < n.rating!
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}
        {n.avatars && (
          <AvatarGroup className="mt-1.5 -space-x-1">
            {n.avatars.map((name) => (
              <PersonAvatar key={name} name={name} size="sm" />
            ))}
          </AvatarGroup>
        )}
        {n.progress !== undefined && (
          <StripedBar
            value={n.progress}
            label={`${n.progress}%`}
            className="mt-1.5"
            fill={"icon" in n.lead ? BAR[n.lead.tone] : undefined}
          />
        )}
        {n.event && (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-sm border border-border/50 bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
            <CalendarIcon aria-hidden className="size-3 shrink-0 opacity-60" />
            <span className="font-medium text-foreground">{n.event.date}</span>
            <span className="opacity-70">{n.event.time}</span>
          </div>
        )}
        {n.file && (
          <div className="flex items-center gap-1 py-1">
            <ButtonGroup>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  toast.add({
                    type: "info",
                    title: "Opening",
                    description: n.file!.name,
                  })
                }
              >
                <PaperclipIcon aria-hidden />
                {n.file.name}
                <span className="opacity-60">({n.file.size})</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Download ${n.file.name}`}
                onClick={() =>
                  toast.add({
                    type: "success",
                    title: "Download started",
                    description: n.file!.name,
                  })
                }
              >
                <DownloadIcon aria-hidden />
              </Button>
            </ButtonGroup>
          </div>
        )}
        {n.actions && (
          <div className="flex items-center gap-1 py-1">
            <Button
              size="sm"
              onClick={() => onAct(PAST[n.actions![0]] ?? n.actions![0], true)}
            >
              {n.actions[0]}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAct(n.actions![1], false)}
            >
              {n.actions[1]}
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 pt-0.5">
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {n.time}
          </p>
          {n.tag && (
            <span className="inline-flex h-[18px] shrink-0 items-center overflow-hidden rounded-sm border border-border/60 text-[10px] font-medium">
              <span className="flex h-full items-center border-r border-border/50 bg-muted/60 px-1.5 leading-none text-muted-foreground">
                {n.tag.label}
              </span>
              <span
                className={cn(
                  "flex h-full items-center px-1.5 leading-none",
                  TAG_INK[n.tag.tone]
                )}
              >
                {n.tag.value}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const BAR = {
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
  destructive: "bg-destructive",
} as const
/** What the toast says once a primary action is done */
const PAST: Record<string, string> = {
  Reassign: "Reassigned",
  Approve: "Approved",
  Join: "Joining",
  Review: "Opened for review",
}
// The tag's value ink: the tone's darker shade, so 10px text reads (the bright tone falls under AA)
const TAG_INK = {
  warning: "text-warning-foreground",
  success: "text-success-foreground",
  info: "text-info-foreground",
  destructive: "text-destructive-foreground",
} as const
