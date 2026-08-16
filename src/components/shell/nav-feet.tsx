"use client"

import {
  ActivityIcon,
  CircleAlertIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TrendingDownIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LIFECYCLE_COUNTS, LIFECYCLE_DOT, LIFECYCLES } from "@/data/contacts"
import { LIVE_METRICS, SEASON_QUOTA, SECURITY, TIPS } from "@/data/shell"
import { LATER_TODAY, UP_NEXT } from "@/data/today"
import {
  nextReading,
  seeded,
  seedReadings,
  sparkline,
} from "@/lib/live-metrics"
import { cn } from "@/lib/utils"

/** The striped track behind the small progress bars: 1px diagonal hairlines every 4px */
function Stripes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 text-muted-foreground opacity-20"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, currentcolor 0px, currentcolor 1px, transparent 0px, transparent 4px)",
      }}
    />
  )
}

/** A bar over the stripes, for the quota and usage bars */
export function StripedBar({
  value,
  className,
  fill = "bg-primary",
  label,
}: {
  value: number
  className?: string
  fill?: string
  label: string
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-1 overflow-hidden rounded-full bg-muted/55",
        className
      )}
    >
      <Stripes />
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
          fill
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// Where each card of the stack sits: the front one, then each one behind it a little higher, smaller and fainter
const DEPTH = [
  { y: "0%", scale: 1, opacity: 1 },
  { y: "-4%", scale: 0.97, opacity: 0.9 },
  { y: "-8%", scale: 0.94, opacity: 0.8 },
] as const

/**
 * Home's tip cards, stacked: the front card's Read more and Dismiss slide open on hover; Dismiss,
 * or a swipe sideways, sends it off to the right and the ones behind step forward. Gone for good once all
 * three are dismissed.
 */
export function TipStack() {
  const [gone, setGone] = useState<string[]>([])
  const [leaving, setLeaving] = useState<string | null>(null)
  const [drag, setDrag] = useState(0)
  const start = useRef<number | null>(null)
  const tips = TIPS.filter((t) => !gone.includes(t.id))
  if (!tips.length) return null
  const dismiss = (id: string) => {
    setLeaving(id)
    window.setTimeout(() => {
      setGone((g) => [...g, id])
      setLeaving(null)
      setDrag(0)
    }, 200)
  }
  return (
    <div className="group px-3 pt-3">
      <div className="relative">
        {/* The front card's size, invisible, so the stack takes the room a card needs */}
        <TipCard
          tip={TIPS[0]}
          className="pointer-events-none invisible"
          hidden
        />
        {[...tips]
          .slice(0, 3)
          .toReversed()
          .map((tip) => {
            const depth = tips.indexOf(tip)
            const front = depth === 0
            const d = DEPTH[Math.min(depth, 2) as 0 | 1 | 2]
            const out = leaving === tip.id
            return (
              <div
                key={tip.id}
                data-active={front}
                data-dragging={front && drag !== 0}
                className={cn(
                  "absolute top-0 left-0 size-full transition-[opacity,transform,translate,scale] duration-200",
                  front && "touch-pan-y"
                )}
                style={{
                  translate: out ? "110% 0" : `${front ? drag : 0}px ${d.y}`,
                  scale: d.scale,
                  opacity: out ? 0 : d.opacity,
                  transitionDuration:
                    front && drag !== 0 && !out ? "0ms" : undefined,
                }}
                onPointerDown={
                  front
                    ? (e) => {
                        start.current = e.clientX
                        e.currentTarget.setPointerCapture(e.pointerId)
                      }
                    : undefined
                }
                onPointerMove={
                  front
                    ? (e) =>
                        start.current !== null &&
                        setDrag(Math.max(0, e.clientX - start.current))
                    : undefined
                }
                onPointerUp={
                  front
                    ? () => {
                        start.current = null
                        if (drag > 60) dismiss(tip.id)
                        else setDrag(0)
                      }
                    : undefined
                }
              >
                <TipCard
                  tip={tip}
                  onDismiss={() => dismiss(tip.id)}
                  hidden={!front}
                />
              </div>
            )
          })}
      </div>
    </div>
  )
}

function TipCard({
  tip,
  onDismiss,
  hidden,
  className,
}: {
  tip: (typeof TIPS)[number]
  onDismiss?: () => void
  hidden?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className={cn(
        "rounded-lg border bg-background p-3 text-[13px] leading-[1.5] shadow-xs",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="line-clamp-1 font-medium">{tip.title}</span>
        <p className="line-clamp-2 text-muted-foreground">{tip.body}</p>
      </div>
      <div
        className="mt-2.5 aspect-[16/9] w-full overflow-hidden rounded-md border border-border/40 bg-muted"
        style={{ backgroundImage: tip.art }}
      />
      <div className="grid grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,opacity] duration-200 has-focus-visible:grid-rows-[1fr] has-focus-visible:opacity-100 sm:group-hover:[[data-active=true]_&]:grid-rows-[1fr] sm:group-hover:[[data-active=true]_&]:opacity-100 sm:[[data-dragging=true]_&]:grid-rows-[1fr] sm:[[data-dragging=true]_&]:opacity-100">
        <div className="min-h-0">
          <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
            <Link
              href={tip.href}
              tabIndex={hidden ? -1 : undefined}
              className="font-medium outline-none hover:text-foreground focus-visible:underline"
            >
              Read more
            </Link>
            <button
              type="button"
              tabIndex={hidden ? -1 : undefined}
              onClick={onDismiss}
              className="outline-none hover:text-foreground focus-visible:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The season quota: serviced accounts against the reps' quota, over the stripes */
export function SeasonQuota() {
  const { title, body, closed } = SEASON_QUOTA
  return (
    <div className="flex flex-col gap-2 border-t p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{title}</p>
      </div>
      <p className="text-[11px] leading-[1.375] text-muted-foreground">
        {body}
      </p>
      <StripedBar
        value={closed}
        label={`${title}: ${closed}% serviced`}
        className="h-1.5"
        fill="bg-emerald-500"
      />
      <div className="flex items-center justify-between text-[11px] leading-none">
        <div className="flex items-center gap-1">
          <span className="font-semibold tabular-nums">{closed}%</span>
          <span className="text-muted-foreground">Serviced</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold tabular-nums">{100 - closed}%</span>
          <span className="text-muted-foreground">To go</span>
        </div>
      </div>
    </div>
  )
}

/** Activities' Up next card and the rest of today's schedule */
export function UpNext({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mt-2 px-2">
      <p className="px-1 pb-1.5 text-[11px] font-medium text-foreground/70 uppercase">
        Up next
      </p>
      <Link
        href="/today"
        onClick={onNavigate}
        className="block rounded-lg border bg-card p-2.5 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-center gap-1.5 text-xs">
          <UsersIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="tabular-nums">{UP_NEXT.time}</span>
          <span aria-hidden>·</span>
          <span>{UP_NEXT.minutes} min</span>
        </div>
        <p className="mt-1.5 text-sm font-medium">{UP_NEXT.place}</p>
        <p className="truncate text-xs text-muted-foreground">
          {UP_NEXT.title}
        </p>
        <AvatarGroup className="mt-2 -space-x-1.5 *:data-[slot=avatar]:ring-card">
          {UP_NEXT.attendees.map((name) => (
            <PersonAvatar
              key={name}
              name={name}
              size="sm"
              className="data-[size=sm]:size-5"
            />
          ))}
        </AvatarGroup>
      </Link>
      <p className="px-1 pt-3 pb-1 text-[11px] font-medium text-foreground/70 uppercase">
        Later today
      </p>
      <ul className="flex flex-col">
        {LATER_TODAY.map((m) => (
          <li key={m.time}>
            <Link
              href="/today"
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="w-16 shrink-0 text-muted-foreground tabular-nums">
                {m.time}
              </span>
              <span className="truncate">{m.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Contacts' lifecycle stages: a dot, the stage, a bar against the biggest stage and the count */
export function LifecycleLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const current = useSearchParams().get("lifecycle")
  const most = Math.max(...Object.values(LIFECYCLE_COUNTS))
  return (
    <div className="mt-2 px-2">
      <p className="px-1 pb-1 text-[11px] font-medium text-foreground/70 uppercase">
        Lifecycle
      </p>
      <ul className="flex flex-col gap-0.5">
        {LIFECYCLES.map((stage) => {
          const active = pathname === "/contacts" && current === stage
          return (
            <li key={stage}>
              <Link
                href={`/contacts?lifecycle=${stage}`}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md p-1.5 text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                  active && "bg-accent"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    LIFECYCLE_DOT[stage]
                  )}
                />
                <span className="w-20 truncate">{stage}</span>
                <span
                  aria-hidden
                  className="h-1 w-11 shrink-0 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      LIFECYCLE_DOT[stage]
                    )}
                    style={{
                      width: `${(LIFECYCLE_COUNTS[stage] / most) * 100}%`,
                    }}
                  />
                </span>
                <span className="ms-auto w-4 text-right text-muted-foreground tabular-nums">
                  {LIFECYCLE_COUNTS[stage]}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const METRIC_ICON = {
  phone: PhoneIcon,
  "circle-alert": CircleAlertIcon,
  users: UsersIcon,
  "trending-down": TrendingDownIcon,
} as const
// Static classes per colour, so Tailwind keeps them: the icon and the sparkline in the tone, the value a
// shade darker so 11px figures read (the -500 values fall under AA)
const METRIC_TONE = {
  blue: {
    text: "text-blue-500",
    value: "text-blue-600 dark:text-blue-400",
    stroke: "stroke-blue-500",
  },
  emerald: {
    text: "text-emerald-500",
    value: "text-emerald-700 dark:text-emerald-400",
    stroke: "stroke-emerald-500",
  },
  violet: {
    text: "text-violet-500",
    value: "text-violet-600 dark:text-violet-400",
    stroke: "stroke-violet-500",
  },
  sky: {
    text: "text-sky-500",
    value: "text-sky-700 dark:text-sky-400",
    stroke: "stroke-sky-500",
  },
  red: {
    text: "text-red-500",
    value: "text-red-600 dark:text-red-400",
    stroke: "stroke-red-500",
  },
} as const

/**
 * Activities' and Contacts' live metrics: two readings that tick every second and a half, each
 * with a sparkline of the last twenty. A reading over its line turns red, the badge says Alert and the
 * pulse beside the title pings.
 */
export function LiveMetrics({ app }: { app: keyof typeof LIVE_METRICS }) {
  const metrics = LIVE_METRICS[app]
  // A repeatable history, so the server's first paint and the browser's agree; then a step every 1.5s
  const [series, setSeries] = useState<number[][]>(() =>
    metrics.map((m, i) => seedReadings(m.start, m, seeded(i + 1)))
  )
  useEffect(() => {
    const t = window.setInterval(
      () =>
        setSeries((all) =>
          all.map((s, i) => {
            const m = metrics[i]
            return m ? [...s.slice(1), nextReading(s.at(-1) ?? m.start, m)] : s
          })
        ),
      1500
    )
    return () => window.clearInterval(t)
  }, [metrics])
  const alert = metrics.some((m, i) => (series[i]?.at(-1) ?? 0) > m.alert)
  return (
    <div className="border-t pt-3 pb-1">
      <div className="flex items-center gap-1.5 px-3 pb-1">
        <span
          aria-hidden
          className="relative flex size-3 items-center justify-center text-muted-foreground [&_svg]:size-3"
        >
          <ActivityIcon />
          {alert && (
            <span className="absolute size-5 animate-ping rounded-full bg-destructive/25" />
          )}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Live Metrics
        </span>
        <Badge
          variant={alert ? "destructive" : "success"}
          className={cn("ms-auto", alert ? "bg-red-600" : "bg-emerald-700")}
        >
          {alert ? "Alert" : "Normal"}
        </Badge>
      </div>
      {metrics.map((m, i) => {
        const values = series[i] ?? []
        const now = values.at(-1) ?? m.start
        const tone = METRIC_TONE[now > m.alert ? "red" : m.colour]
        const Icon = METRIC_ICON[m.icon]
        return (
          <div key={m.id} className="flex items-center gap-2 px-3 py-1.5">
            <span
              aria-hidden
              className={cn(
                "size-3 shrink-0 transition-colors duration-300 [&_svg]:size-3",
                tone.text
              )}
            >
              <Icon />
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
              {m.label}
            </span>
            <Sparkline values={values} tone={tone} />
            <span
              className={cn(
                "w-12 shrink-0 text-end text-[11px] font-semibold tabular-nums transition-colors duration-300",
                tone.value
              )}
            >
              {now}
              <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                {m.unit}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Sparkline({
  values,
  tone,
}: {
  values: number[]
  tone: (typeof METRIC_TONE)[keyof typeof METRIC_TONE]
}) {
  const id = useId()
  const { line, area } = sparkline(values)
  return (
    <svg
      viewBox="0 0 48 20"
      width="48"
      height="20"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            className={tone.text}
            stopOpacity={0.3}
            style={{ stopColor: "currentColor" }}
          />
          <stop
            offset="100%"
            className={tone.text}
            stopOpacity={0}
            style={{ stopColor: "currentColor" }}
          />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className={tone.text} />
      <path
        d={line}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        className={tone.stroke}
      />
    </svg>
  )
}

/** Settings' foot: the workspace's security status */
export function SecurityStatus() {
  return (
    <div className="flex flex-col gap-1.5 border-t p-3">
      <div className="flex items-center gap-1">
        <ShieldCheckIcon aria-hidden className="size-4 text-emerald-500" />
        <p className="text-xs font-medium">{SECURITY.title}</p>
        <Badge variant="success" className="ms-auto bg-emerald-700">
          {SECURITY.status}
        </Badge>
      </div>
      <p className="text-xs leading-[1.375] text-muted-foreground">
        {SECURITY.body}
      </p>
    </div>
  )
}
