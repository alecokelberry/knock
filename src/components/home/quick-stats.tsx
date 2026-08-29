"use client"

import { type ColumnDef, useTable } from "@tanstack/react-table"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleQuestionMarkIcon,
  DownloadIcon,
  InfoIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useState } from "react"

import { type NewLog, NewLogSheet } from "@/components/home/new-log-sheet"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "@/components/ui/data-grid/data-grid"
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/ui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CLIENT_FILTERS,
  OPEN_BY_STAGE,
  PIPELINE_BY_SOURCE,
  QS_RANGES,
  SOURCE_HUE,
  SOURCE_PERIODS,
  SOURCE_UNTRACKED,
  type SourcePeriod,
  STAGE_METRICS,
  TIME_REPS,
  TIME_TEAMS,
  TIME_WEEK,
  TRACKED_FILTERS,
  WORKLOGS,
  type WorkDay,
} from "@/data/quick-stats"
import { downloadCsv } from "@/lib/csv"
import { addDays, fmt, isoDate, localDate } from "@/lib/dates"
import {
  clientBand,
  DAY_HOURS,
  type DayCell,
  hoursLabel,
  ON_TARGET,
  type RepWeek,
  repWeek,
  statsCsv,
  trackedBand,
  weekLabel,
} from "@/lib/quick-stats"
import { cn } from "@/lib/utils"

/** The stage hues: the bar, its dot and the count's ink (a shade darker in light, so it reads) */
const STAGE_HUE = {
  blue: ["bg-blue-500", "text-blue-600 dark:text-blue-400"],
  violet: ["bg-violet-500", "text-violet-600 dark:text-violet-400"],
  amber: ["bg-amber-500", "text-amber-700 dark:text-amber-400"],
  emerald: ["bg-emerald-500", "text-emerald-700 dark:text-emerald-400"],
  rose: ["bg-rose-500", "text-rose-600 dark:text-rose-400"],
  cyan: ["bg-cyan-500", "text-cyan-700 dark:text-cyan-400"],
} as const
/** A day's bar by what the time went to */
const DAY_BAR = {
  Doors: "bg-emerald-500",
  Training: "bg-sky-500",
  Office: "bg-violet-500",
  Open: "bg-transparent",
  Off: "bg-transparent",
} as const

/** Home → Quick Stats: sales by source, open households by stage, and a week of hours by person */
export function QuickStats() {
  const [range, setRange] = useState<string>(QS_RANGES[0])
  const [logs, setLogs] = useState(WORKLOGS)
  const [monday, setMonday] = useState(TIME_WEEK)
  const weeks = TIME_REPS.map((r) => repWeek(r, monday, logs[monday]?.[r.name]))
  const addLog = (log: NewLog) =>
    setLogs((all) => ({
      ...all,
      [log.monday]: { ...all[log.monday], [log.rep]: log.days },
    }))
  return (
    <>
      <CrumbHeader page="Quick Stats">
        <RangeMenu
          ranges={QS_RANGES}
          short="Week"
          value={range}
          onChange={setRange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            // Export offers the file, and downloads it only when asked
            toast.add({
              type: "success",
              title: "Export ready",
              description: "Stats CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () =>
                  downloadCsv(
                    "quick-stats.csv",
                    statsCsv(range, monday, weeks)
                  ),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Quick stats</h1>
        <section className="flex min-w-0 flex-col gap-5 @3xl:flex-row @3xl:items-stretch">
          <SourceCard />
          <div className="flex min-w-0 flex-1">
            <StageCard />
          </div>
        </section>
        <section>
          <TimeByRep
            weeks={weeks}
            monday={monday}
            onWeek={setMonday}
            logs={logs}
            onLog={addLog}
          />
        </section>
      </div>
    </>
  )
}

function SourceCard() {
  const [period, setPeriod] = useState<SourcePeriod>("Month")
  return (
    <Frame className="@3xl:w-[41%] @3xl:shrink-0">
      <FramePanel className="flex p-5">
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as SourcePeriod)}
          className="flex flex-1 flex-col gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-0.5">
              <h2 className="text-sm font-medium">Sales by Source</h2>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="About pipeline by source"
                      className="inline-flex cursor-help items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  }
                >
                  <InfoIcon aria-hidden className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  Open pipeline created in the period, split by how the deal
                  arrived.
                </TooltipContent>
              </Tooltip>
            </div>
            <TabsList aria-label="Period" className="w-full @sm:w-auto">
              {SOURCE_PERIODS.map((p) => (
                <TabsTrigger key={p} value={p} className="px-1.5">
                  {p}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {SOURCE_PERIODS.map((p) => (
            <TabsContent
              key={p}
              value={p}
              className="mt-0 flex flex-1 flex-col"
            >
              <SourceSplit period={p} />
            </TabsContent>
          ))}
        </Tabs>
      </FramePanel>
    </Frame>
  )
}

function SourceSplit({ period }: { period: SourcePeriod }) {
  const s = PIPELINE_BY_SOURCE[period]
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-start gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Signed
          </span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {s.created}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Sales
          </span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {s.deals}
          </span>
        </div>
      </div>
      <div
        aria-hidden
        className="flex h-2.5 w-full items-center gap-0.5 overflow-hidden rounded-full bg-muted"
      >
        {s.rows.map((r) => (
          <span
            key={r.source}
            className="h-full rounded-full"
            style={{ width: `${r.share}%`, background: SOURCE_HUE[r.source] }}
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        {s.rows.map((r) => (
          <div
            key={r.source}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: SOURCE_HUE[r.source] }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {r.source}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.deals} sales · {r.avg} avg
                </p>
              </div>
            </div>
            <div className="shrink-0 text-end">
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {r.value}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {r.share}%
              </p>
            </div>
          </div>
        ))}
        <p className="px-0.5 text-[11px] text-muted-foreground">
          The remaining {SOURCE_UNTRACKED}% came from sources we don&apos;t
          track separately.
        </p>
      </div>
    </div>
  )
}

function StageCard() {
  const [metric, setMetric] = useState<string>(STAGE_METRICS[0])
  const max = Math.max(...OPEN_BY_STAGE.map((s) => s.deals))
  return (
    <Frame className="flex w-full flex-col gap-0">
      <FrameHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <FrameTitle className="font-semibold">
              Households by Stage
            </FrameTitle>
            <CircleQuestionMarkIcon
              aria-hidden
              className="size-3.5 text-muted-foreground"
            />
          </div>
          <FrameDescription className="text-xs">
            Open households by stage, season to date
          </FrameDescription>
        </div>
        {/* The button keeps readable ink in the dark theme */}
        <Select
          items={STAGE_METRICS.map((m) => ({ value: m, label: m }))}
          value={metric}
          onValueChange={(v) => v && setMetric(v)}
        >
          <SelectTrigger
            aria-label="Stage metric"
            className="w-28 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-input/30 dark:text-foreground dark:hover:bg-input/50 [&_svg]:text-primary-foreground/70! dark:[&_svg]:text-muted-foreground!"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGE_METRICS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FrameHeader>
      <FramePanel className="grow p-0">
        <ul className="flex flex-col gap-3 px-4 py-4">
          {OPEN_BY_STAGE.map((s) => {
            const share = Math.round((s.deals / max) * 100)
            const [bar, ink] = STAGE_HUE[s.hue]
            return (
              <li
                key={s.stage}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3"
              >
                <div className="relative h-8 min-w-0 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "absolute inset-y-0 start-0 rounded-full opacity-20",
                      bar
                    )}
                    style={{ width: `${share}%` }}
                  />
                  <span className="relative z-10 flex h-full min-w-0 items-center gap-2 px-3 text-xs font-medium">
                    <span className={cn("size-2 shrink-0 rounded-full", bar)} />
                    <span className="truncate">{s.stage}</span>
                  </span>
                </div>
                <span
                  className={cn(
                    "justify-self-end text-end text-xs font-semibold tabular-nums",
                    ink
                  )}
                >
                  {metric === "Households" ? s.deals : `${share}%`}
                </span>
              </li>
            )
          })}
        </ul>
      </FramePanel>
    </Frame>
  )
}

const ALL = "all"

function TimeByRep({
  weeks,
  monday,
  onWeek,
  logs,
  onLog,
}: {
  weeks: RepWeek[]
  monday: string
  onWeek: (monday: string) => void
  logs: Record<string, Record<string, (WorkDay | null)[]>>
  onLog: (log: NewLog) => void
}) {
  const [team, setTeam] = useState(ALL)
  const [tracked, setTracked] = useState(ALL)
  const [client, setClient] = useState(ALL)
  const [logging, setLogging] = useState(false)
  // One array per change, or the grid takes each render for new data and jumps back to page 1
  const rows = weeks.filter(
    (w) =>
      (team === ALL || w.rep.team === team) &&
      (tracked === ALL || trackedBand(w.percent) === tracked) &&
      (client === ALL || clientBand(w) === client)
  )
  const filter = (set: (v: string) => void) => (v: string | null) => {
    set(v ?? ALL)
    table.setPageIndex(0)
  }
  const columns: ColumnDef<typeof dataGridFeatures, RepWeek>[] = [
    {
      id: "person",
      header: () => <HeadLabel>People</HeadLabel>,
      size: 240,
      meta: {
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <PersonAvatar name={row.original.rep.name} />
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="truncate text-sm font-medium text-foreground">
              {row.original.rep.name}
            </div>
            <div className="truncate pt-0.5 text-xs text-muted-foreground">
              {row.original.rep.title}
            </div>
          </div>
        </div>
      ),
    },
    ...Array.from(
      { length: 7 },
      (_, i): ColumnDef<typeof dataGridFeatures, RepWeek> => ({
        id: `day${i}`,
        size: 112,
        header: () => (
          <div className="inline-flex h-full w-full items-center justify-center gap-1.5 text-center text-xs font-normal text-secondary-foreground/80">
            {fmt.dayWeekday.format(localDate(addDays(monday, i)))}
          </div>
        ),
        meta: { headerClassName: "text-center!" },
        cell: ({ row }) => {
          const day = row.original.days[i]
          return day ? <DayButton day={day} /> : null
        },
      })
    ),
    {
      id: "total",
      size: 120,
      header: () => <HeadLabel>Total</HeadLabel>,
      meta: {
        headerClassName:
          "text-end pe-(--frame-panel-header-px) [&>div]:justify-end",
        cellClassName: "text-end pe-(--frame-panel-px)",
      },
      cell: ({ row }) => {
        const up = row.original.percent >= ON_TARGET
        return (
          <div className="flex flex-col items-end gap-1 text-end">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {hoursLabel(row.original.total)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs tabular-nums",
                up
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              )}
            >
              {up ? (
                <TrendingUpIcon aria-hidden className="size-3" />
              ) : (
                <TrendingDownIcon aria-hidden className="size-3" />
              )}
              {row.original.percent}%
            </span>
          </div>
        )
      },
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    getRowId: (r) => r.rep.name,
  })
  return (
    <Frame>
      <FrameHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-px">
          <FrameTitle className="font-semibold text-balance">
            Hours by Rep
          </FrameTitle>
          <FrameDescription className="text-xs text-pretty">
            Hours on the doors, in training and at the office
          </FrameDescription>
        </div>
        <Button size="sm" onClick={() => setLogging(true)}>
          New log
        </Button>
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="People"
              options={TIME_TEAMS}
              value={team}
              onChange={filter(setTeam)}
            />
            <FilterSelect
              label="Tracked time"
              options={TRACKED_FILTERS}
              value={tracked}
              onChange={filter(setTracked)}
            />
            <FilterSelect
              label="Door time"
              options={CLIENT_FILTERS}
              value={client}
              onChange={filter(setClient)}
            />
          </div>
          <WeekPicker monday={monday} onWeek={onWeek} />
        </div>
        <Separator />
        <DataGrid
          table={table}
          recordCount={rows.length}
          emptyMessage="No worklogs match the current filters."
          tableLayout={{ dense: true, cellBorder: true, width: "fixed" }}
        >
          <DataGridContainer className="relative">
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
          </DataGridContainer>
          <Separator />
          <FrameFooter>
            <DataGridPagination />
          </FrameFooter>
        </DataGrid>
      </FramePanel>
      <NewLogSheet
        open={logging}
        onOpenChange={setLogging}
        logs={logs}
        onLog={onLog}
      />
    </Frame>
  )
}

const HeadLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex h-full items-center gap-1.5 text-[0.8125rem] leading-[calc(1.125/0.8125)] font-normal text-secondary-foreground/80">
    {children}
  </div>
)

/** A day in the grid: its hours, a bar against a full day, and what it went to; the note on hover */
function DayButton({ day }: { day: DayCell }) {
  const title = localDate(day.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- the trigger's children (the day's hours) are its text
          <button
            type="button"
            className="inline-flex w-full cursor-pointer justify-center rounded-md px-1.5 py-1.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        <div className="flex w-full min-w-[76px] flex-col items-center gap-1.5 text-center">
          <span
            className={cn(
              "text-sm leading-none tabular-nums",
              day.hours === null
                ? "text-muted-foreground"
                : "font-medium text-foreground"
            )}
          >
            {day.hours === null ? "-" : hoursLabel(day.hours)}
          </span>
          <span className="block h-1 w-full max-w-[56px] overflow-hidden rounded-full bg-border">
            <span
              className={cn("block h-full rounded-full", DAY_BAR[day.label])}
              style={{
                width: `${Math.min(100, ((day.hours ?? 0) / DAY_HOURS) * 100)}%`,
              }}
            />
          </span>
          <span className="text-[11px] leading-none text-muted-foreground">
            {day.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-start gap-0.5">
        <span className="font-medium">{title}</span>
        <span>{day.hours === null ? "-" : hoursLabel(day.hours)}</span>
        <span className="opacity-80">{day.note}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (v: string | null) => void
}) {
  const items = [
    { value: ALL, label },
    ...options.map((o) => ({ value: o, label: o })),
  ]
  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** The week in view: back and forward a week, or pick any day to jump to its week */
function WeekPicker({
  monday,
  onWeek,
}: {
  monday: string
  onWeek: (monday: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ButtonGroup aria-label="Week">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous week"
          onClick={() => onWeek(addDays(monday, -7))}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="w-[168px] justify-between font-normal"
                aria-label={`Week of ${weekLabel(monday)}, pick a week`}
              />
            }
          >
            <span className="truncate">{weekLabel(monday)}</span>
            <CalendarIcon
              aria-hidden
              className="size-3.5 text-muted-foreground"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            {/* Opens on the week in view, so a pick lands near it */}
            <Calendar
              defaultMonth={localDate(monday)}
              onDayClick={(d) => {
                const day = isoDate(d)
                const dow = d.getDay()
                onWeek(addDays(day, dow === 0 ? -6 : 1 - dow))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next week"
          onClick={() => onWeek(addDays(monday, 7))}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </ButtonGroup>
    </div>
  )
}
