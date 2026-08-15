"use client"

import {
  CircleCheckIcon,
  DownloadIcon,
  InfoIcon,
  KanbanIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"
import { useState } from "react"
import { Cell, Pie, PieChart } from "recharts"

import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import { Item, ItemMedia } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DASH_RANGE_SHORT,
  DASH_RANGES,
  DASH_TILES,
  type DashTile,
  PERFORMANCE_FIGURES,
  PERFORMANCE_PERIODS,
  PERIODS,
  type Period,
  PIPELINE_PROGRESS,
  QUOTA_BARS,
  QUOTA_COVERAGE,
  QUOTA_FACES,
  QUOTA_INFO,
  RECENT_ACTIVITY,
  SOURCED,
  SOURCED_INFO,
  SOURCED_SLICES,
} from "@/data/dashboard"
import { TEAM_BY_ID, TEAM_PERFORMANCE } from "@/data/team"
import { downloadCsv } from "@/lib/csv"
import { dashboardCsv } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

const TILE_ICONS = {
  "trending-up": TrendingUpIcon,
  kanban: KanbanIcon,
  users: UsersIcon,
  "triangle-alert": TriangleAlertIcon,
} as const
const TONE_BADGE = {
  success: "success-light",
  info: "info-light",
  warning: "warning-light",
  destructive: "destructive-light",
} as const
const BAR_TONE =
  "bg-primary/20 data-[tone=destructive]:bg-destructive/30 data-[tone=info]:bg-info/30 data-[tone=success]:bg-success/30 data-[tone=warning]:bg-warning/30"
const STATUS_TONE = {
  success: "success-light",
  warning: "warning-light",
  destructive: "destructive-light",
  info: "info-light",
} as const

/** Home → Dashboard: the KPI tiles, Performance, Quota Coverage, Sales Sourced and the team table. */
export function Dashboard() {
  const [range, setRange] = useState<string>(DASH_RANGES[0])
  return (
    <>
      <CrumbHeader page="Dashboard">
        <RangeMenu
          ranges={DASH_RANGES}
          short={DASH_RANGE_SHORT}
          value={range}
          onChange={setRange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            // Export offers the file, and downloads it (with the browser's own prompt) only when asked
            toast.add({
              type: "success",
              title: "Export ready",
              description: "Dashboard CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () =>
                  downloadCsv("dashboard.csv", dashboardCsv(range)),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>

      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Home overview</h1>
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DASH_TILES.map((t) => (
              <StatTile key={t.title} tile={t} />
            ))}
          </div>
        </section>

        <section className="grid min-w-0 items-stretch gap-5 @5xl:grid-cols-2">
          <div className="flex min-w-0">
            <PerformanceCard />
          </div>
          <div className="flex min-w-0">
            <div className="@container grid h-full w-full min-w-0 auto-rows-fr gap-3">
              <QuotaCoverageCard />
              <SalesSourcedCard />
            </div>
          </div>
        </section>

        <TeamPerformance />
      </div>
    </>
  )
}

/** A KPI tile: the icon tile, title and hint, the tinted change, the figure and eight bars. */
function StatTile({ tile }: { tile: DashTile }) {
  const Icon = TILE_ICONS[tile.icon]
  return (
    <Frame>
      <FramePanel className="flex min-h-28 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <Item className="size-9 shrink-0 justify-center gap-2.5 border-2 border-background bg-muted p-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border [&_svg]:size-4 [&_svg]:text-accent-foreground">
              <ItemMedia variant="icon" className="size-auto">
                <Icon aria-hidden />
              </ItemMedia>
            </Item>
            <div className="min-w-0 pt-0.5">
              <span className="block truncate text-sm font-medium">
                {tile.title}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {tile.hint}
              </span>
            </div>
          </div>
          <Badge variant={TONE_BADGE[tile.tone]}>{tile.change}</Badge>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div className="min-w-0">
            <div className="text-xl font-semibold tracking-tight tabular-nums">
              {tile.value}
            </div>
          </div>
          <div aria-hidden className="flex h-10 items-end gap-0.5">
            {tile.bars.map((h, i) => (
              <span
                // oxlint-disable-next-line react/no-array-index-key -- a sparkline's bars that never reorders
                key={i}
                data-tone={tile.tone}
                className={cn("w-1 rounded-full", BAR_TONE)}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}

function PerformanceCard() {
  const [period, setPeriod] = useState("season")
  return (
    <Frame className="w-full">
      <FramePanel>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-px">
            <h2 className="text-base font-semibold">Performance</h2>
          </div>
          <div className="flex items-center gap-2">
            <Select
              items={PERFORMANCE_PERIODS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              value={period}
              onValueChange={(v) => v && setPeriod(v)}
            >
              <SelectTrigger
                aria-label="Performance period"
                className="h-7! w-28"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {PERFORMANCE_PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-2">
            {PERFORMANCE_FIGURES.map((f) => {
              const Trend = f.good ? TrendingUpIcon : TrendingDownIcon
              return (
                <div
                  key={f.label}
                  className="flex flex-col items-start justify-start"
                >
                  <div className="text-xl font-bold text-foreground">
                    {f.value}
                  </div>
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    {f.label}
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold [&_svg]:h-3 [&_svg]:w-3",
                      f.good
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    <Trend aria-hidden />
                    {f.change}
                  </span>
                </div>
              )
            })}
          </div>
          <Separator />
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Quota Progress
              </span>
              <span className="text-xs font-semibold text-foreground">
                {PIPELINE_PROGRESS}%
              </span>
            </div>
            <Progress
              value={PIPELINE_PROGRESS}
              aria-label="Quota Progress"
              className="h-1!"
            />
          </div>
          <Separator />
          <div>
            <div className="mb-2.5 text-sm font-medium text-foreground">
              Recent Activity
            </div>
            <ul className="flex flex-col gap-3">
              {RECENT_ACTIVITY.map((a) => (
                <li
                  key={a.text}
                  className="flex items-center justify-between gap-2.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CircleCheckIcon
                      aria-hidden
                      className={cn("size-3.5 shrink-0", a.icon)}
                    />
                    <span className="truncate text-xs text-foreground">
                      {a.text}
                    </span>
                  </span>
                  <Badge variant={TONE_BADGE[a.tone]} className="shrink-0">
                    {a.badge}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FramePanel>
      <FrameFooter className="flex-row items-center gap-2.5 p-2!">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() =>
            toast.add({
              type: "info",
              title: "Schedule review",
              description: "Thursday's pipeline review is on the calendar.",
            })
          }
        >
          Schedule
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() =>
            toast.add({
              type: "info",
              title: "Full report",
              description: "Opening the season report.",
            })
          }
        >
          Full Report
        </Button>
      </FrameFooter>
    </Frame>
  )
}

function PeriodTabs({ className }: { className?: string }) {
  return (
    <TabsList className={className}>
      {PERIODS.map((p) => (
        <TabsTrigger key={p.value} value={p.value}>
          {p.label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

function QuotaCoverageCard() {
  const [period, setPeriod] = useState<Period>("week")
  return (
    <Frame>
      <FramePanel>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          className="h-full w-full min-w-0 gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="text-sm font-medium">Quota Coverage</h2>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Quota Coverage info"
                      className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
                    />
                  }
                >
                  <InfoIcon aria-hidden className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>{QUOTA_INFO}</TooltipContent>
              </Tooltip>
            </div>
            <PeriodTabs />
          </div>
          {PERIODS.map((p) => {
            const q = QUOTA_COVERAGE[p.value]
            return (
              <TabsContent
                key={p.value}
                value={p.value}
                className="mt-0 flex-1"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[26px] font-medium">
                      {q.percent}%
                    </span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {q.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {q.note}
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${p.label} quota coverage is ${q.percent}%`}
                    className="flex h-7 w-full items-stretch justify-between"
                  >
                    {Array.from({ length: QUOTA_BARS }, (_, i) => (
                      <span
                        // A meter's fixed bars, which never reorder
                        key={i}
                        aria-hidden
                        className={cn(
                          "h-full w-1 shrink-0 rounded-full",
                          i < q.lit ? "bg-success" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                    <p>
                      <span className="text-xs text-muted-foreground">
                        In play:
                      </span>{" "}
                      <span className="text-sm font-medium">{q.inPlay}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <AvatarGroup>
                        {QUOTA_FACES.map((n) => (
                          <PersonAvatar key={n} name={n} size="sm" />
                        ))}
                      </AvatarGroup>
                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                        9 Reps
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </FramePanel>
    </Frame>
  )
}

const REVEAL_CSS = `
@keyframes dashboard-1-flow-reveal-up {
  from { clip-path: inset(100% -999px -999px -999px); opacity: 0.75; }
  to { clip-path: inset(0 -999px -999px -999px); opacity: 1; }
}
.dashboard-1-flow-reveal-up { animation: dashboard-1-flow-reveal-up 680ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) { .dashboard-1-flow-reveal-up { animation: none; clip-path: none; opacity: 1; } }
`

function SourcedTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: (typeof SOURCED_SLICES)[number] & { display: string } }[]
}) {
  const item = active ? payload?.[0]?.payload : undefined
  if (!item) return null
  return (
    <div className="grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="grid gap-1.5">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex min-w-40 items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    item.key === "other" ? "var(--muted)" : item.color,
                }}
              />
              <span className="truncate text-muted-foreground">
                {item.name}
              </span>
            </div>
            <span className="font-medium text-foreground tabular-nums">
              {item.display}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SalesSourcedCard() {
  const [period, setPeriod] = useState<Period>("week")
  return (
    <Frame>
      <style>{REVEAL_CSS}</style>
      <FramePanel className="ps-3.5! pe-5! pt-5! pb-3.5!">
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          className="gap-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-0.5 ps-1.5">
              <h2 className="text-sm font-medium">Sales Sourced</h2>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="About Sales Sourced"
                      className="-my-1 text-muted-foreground/70"
                    />
                  }
                >
                  <InfoIcon aria-hidden className="text-sm" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{SOURCED_INFO}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <PeriodTabs className="w-full @sm:w-auto" />
          </div>
          {PERIODS.map((p) => (
            <TabsContent key={p.value} value={p.value} className="mt-0 flex-1">
              <SourcedBody period={p.value} />
            </TabsContent>
          ))}
        </Tabs>
      </FramePanel>
    </Frame>
  )
}

function SourcedBody({ period }: { period: Period }) {
  const s = SOURCED[period]
  const data = SOURCED_SLICES.map((sl) => ({
    ...sl,
    display: sl.key === "other" ? sl.share : s.values[sl.key],
  }))
  const rows = data.filter((d) => d.key !== "other")
  return (
    <div className="grid gap-6 @sm:grid-cols-[8.25rem_minmax(0,1fr)] @sm:items-center">
      <div className="dashboard-1-flow-reveal-up relative size-[8.25rem] shrink-0">
        <ChartContainer
          config={{}}
          className="aspect-square size-[8.25rem]"
          role="img"
          aria-label={`Sales Sourced: ${s.total} total for ${period.charAt(0).toUpperCase()}${period.slice(1)}`}
        >
          <PieChart>
            <ChartTooltip content={<SourcedTooltip />} />
            <Pie
              data={data}
              dataKey="weight"
              nameKey="name"
              innerRadius={47}
              outerRadius={62}
              cornerRadius={3}
              paddingAngle={1}
              startAngle={130}
              endAngle={-230}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="flex size-[5.25rem] flex-col items-center justify-center rounded-full border border-dashed border-border/70 bg-background/90 px-2 text-center">
            <span className="max-w-full truncate text-xs text-muted-foreground">
              Sourced
            </span>
            <span className="mt-0.5 text-sm font-semibold tabular-nums">
              {s.total}
            </span>
          </div>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col">
        {rows.map((r, i) => (
          <li key={r.key}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: r.color }}
                />
                <span className="text-sm font-medium">{r.name}</span>
              </div>
              <span className="text-sm font-medium">{r.display}</span>
              <span className="w-8 text-end text-xs text-muted-foreground">
                {r.share}
              </span>
            </div>
            {i < rows.length - 1 && <Separator className="w-auto" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TeamPerformance() {
  return (
    <section aria-label="Team performance">
      <Frame>
        <FrameHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-px">
            <FrameTitle>Team Performance</FrameTitle>
            <FrameDescription>
              Serviced accounts against quota, by rep
            </FrameDescription>
          </div>
          <Badge variant="info-light">{TEAM_PERFORMANCE.length} reps</Badge>
        </FrameHeader>
        <FramePanel className="p-0!">
          {/* The table scrolls sideways on a phone here, focusable so a keyboard can too */}
          <div
            // a scrolling region needs focus so a keyboard can scroll it
            tabIndex={0}
            role="region"
            aria-label="Team performance table"
            className="overflow-x-auto rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&>[data-slot=table-container]]:overflow-visible"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-(--frame-panel-header-px)">
                    Rep
                  </TableHead>
                  <TableHead>Quota</TableHead>
                  <TableHead>Close Rate</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Waiting
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TEAM_PERFORMANCE.map((r) => {
                  const name = TEAM_BY_ID[r.memberId]?.name ?? r.memberId
                  return (
                    <TableRow key={r.memberId}>
                      <TableCell className="ps-(--frame-panel-px)">
                        <div className="flex min-w-0 items-center gap-3">
                          <PersonAvatar name={name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {r.title}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-24 flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium tabular-nums">
                              {r.quota}%
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:inline">
                              {r.quotaNote}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", r.quotaBar)}
                              style={{ width: `${r.quota}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.closeRate}
                      </TableCell>
                      <TableCell className="hidden tabular-nums md:table-cell">
                        {r.pending}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_TONE[r.statusTone]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </FramePanel>
      </Frame>
    </section>
  )
}
