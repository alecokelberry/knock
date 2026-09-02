"use client"

import {
  type ColumnDef,
  type ExpandedState,
  useTable,
} from "@tanstack/react-table"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  DownloadIcon,
  InfoIcon,
  PlusIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useState } from "react"

import { NewTargetSheet } from "@/components/home/new-target-sheet"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
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
import {
  DataGridTable,
  DataGridTableFootRow,
  DataGridTableFootRowCell,
} from "@/components/ui/data-grid/data-grid-table"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ATT_FIRST_DAY,
  ATT_LAST_DAY,
  ATT_WEEKS,
  ATT_OPEN,
  ATT_RANGES,
  ATT_SEGMENTS,
  ATT_VIEWS,
  type AttView,
} from "@/data/attainment"
import {
  OPEN_WEEKS,
  type AttRow,
  attainmentCsv,
  attFooter,
  attRows,
  cellValue,
  type WeekSpan,
  money,
  weekEnd,
  weekOf,
  weekStart,
  weekLabel,
  planMatch,
  type RepStatus,
  repFlag,
  sortRows,
  spanLabel,
  spanWeeks,
  stepSpan,
  varianceLabel,
  visibleLabel,
} from "@/lib/attainment"
import { downloadCsv } from "@/lib/csv"
import { localDate } from "@/lib/dates"
import { cn } from "@/lib/utils"

/** A rep's flag: its figure's ink and icon (the warning ink is a shade darker than the badge's, so it reads) */
const FLAG: Record<
  RepStatus,
  { ink: string; icon: typeof InfoIcon; badge: string }
> = {
  Favorable: {
    ink: "text-emerald-700 dark:text-emerald-400",
    icon: CircleCheckIcon,
    badge: "bg-emerald-700",
  },
  Stable: {
    ink: "text-muted-foreground",
    icon: CircleCheckIcon,
    badge: "bg-blue-600",
  },
  Watch: {
    ink: "text-amber-700 dark:text-warning",
    icon: InfoIcon,
    badge: "bg-amber-700",
  },
  Critical: {
    ink: "text-destructive",
    icon: TriangleAlertIcon,
    badge: "bg-red-600",
  },
}
const FLAG_ICON: Record<RepStatus, string> = {
  Favorable: "text-emerald-500",
  Stable: "text-emerald-500",
  Watch: "text-warning",
  Critical: "text-destructive",
}

/** Home → Attainment: offices and reps, week by week, serviced against quota */
export function Attainment() {
  const [range, setRange] = useState<string>("This season")
  const [view, setView] = useState<AttView>("Serviced")
  const [span, setSpan] = useState<WeekSpan>(OPEN_WEEKS)
  const [targeting, setTargeting] = useState(false)
  return (
    <>
      <CrumbHeader page="Attainment">
        <RangeMenu
          ranges={ATT_RANGES}
          short="Quarter"
          shortFor="This season"
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
              description: "Attainment CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () =>
                  downloadCsv("attainment.csv", attainmentCsv(view, span)),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Attainment</h1>
        <AttainmentGrid
          view={view}
          onView={setView}
          span={span}
          onSpan={setSpan}
          onNewTarget={() => setTargeting(true)}
        />
      </div>
      <NewTargetSheet open={targeting} onOpenChange={setTargeting} />
    </>
  )
}

function AttainmentGrid({
  view,
  onView,
  span,
  onSpan,
  onNewTarget,
}: {
  view: AttView
  onView: (v: AttView) => void
  span: WeekSpan
  onSpan: (s: WeekSpan) => void
  onNewTarget: () => void
}) {
  const [query, setQuery] = useState("")
  const [segment, setSegment] = useState("all")
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(ATT_OPEN.map((s) => [s, true]))
  )
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null)
  // The first column is sized to the room once; after the weeks change, the last week takes the slack
  const [moved, setMoved] = useState(false)
  const changeSpan = (next: WeekSpan) => {
    setMoved(true)
    onSpan(next)
  }
  const searching = !!query.trim()
  // One array per change, or the grid takes each render for new data and resets its pages
  const rows = sortRows(attRows(segment, query), sort, view)
  const allOpen = rows.length > 0 && rows.every((r) => open[r.name])
  const expanded: ExpandedState = searching ? true : open
  const weeks = spanWeeks(span)
  const last = weeks.at(-1) ?? span.to
  const footer = attFooter(view, segment)

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id === id ? { id, desc: !s.desc } : { id, desc: false }))
  const sortOf = (id: string) =>
    sort?.id === id ? (sort.desc ? "descending" : "ascending") : undefined
  // toggleSort only sets state; weeks and last follow span
  const columns: ColumnDef<typeof dataGridFeatures, AttRow>[] = [
    {
      id: "name",
      size: 200,
      header: () => (
        <HeadButton label="Office / Rep" onClick={() => toggleSort("name")} />
      ),
      meta: {
        autoSize: !moved,
        headerClassName: "overflow-visible ps-(--frame-panel-header-px)",
        cellClassName: "truncate ps-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <NameCell
          row={row.original}
          span={span}
          open={searching || !!open[row.original.name]}
          onToggle={() =>
            setOpen((o) => ({
              ...o,
              [row.original.name]: !o[row.original.name],
            }))
          }
        />
      ),
    },
    ...weeks.map((m): ColumnDef<typeof dataGridFeatures, AttRow> => ({
      id: String(m),
      size: 160,
      header: () => (
        <HeadButton
          label={weekLabel(m)}
          end
          onClick={() => toggleSort(String(m))}
        />
      ),
      meta: {
        fillWidth: m === last,
        headerClassName: "overflow-visible pr-(--frame-panel-px) text-end",
        cellClassName: cn(
          "truncate pr-(--frame-panel-px) text-end!",
          m === last && "bg-muted/20"
        ),
      },
      cell: ({ row }) => <WeekCell row={row.original} week={m} view={view} />,
    })),
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (r) => r.id,
    getSubRows: (r) => r.subRows,
    getRowCanExpand: (r) => r.original.kind === "segment",
    paginateExpandedRows: false,
    state: { expanded },
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  return (
    <Frame spacing="sm" dense className="w-full">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-px">
          <FrameTitle className="font-semibold text-balance">
            Attainment
          </FrameTitle>
          <FrameDescription className="text-xs text-pretty">
            <span className="inline-flex items-center gap-1.5">
              <span>{visibleLabel(rows.length)}</span>
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-gray-500"
              />
              <span>Serviced vs quota</span>
            </span>
          </FrameDescription>
        </div>
        <Button size="sm" onClick={onNewTarget}>
          <PlusIcon aria-hidden className="size-4" />
          New Target
        </Button>
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="flex flex-wrap items-end justify-between gap-2 px-(--frame-panel-header-px) pt-(--frame-panel-header-py)">
          <Tabs
            value={view}
            onValueChange={(v) => onView(v as AttView)}
            className="gap-2"
          >
            <TabsList
              variant="line"
              aria-label="Figures"
              className="gap-5 bg-transparent"
            >
              {ATT_VIEWS.map((v) => (
                <TabsTrigger key={v} value={v} className="px-0 pb-3 text-sm">
                  {v}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() =>
                setOpen(
                  Object.fromEntries(
                    ATT_SEGMENTS.map((s) => [s.name, !allOpen])
                  )
                )
              }
            >
              {allOpen ? "Collapse All" : "Expand All"}
            </Button>
          )}
        </div>
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="h-7 w-full min-w-52 sm:w-[260px]">
              <InputGroupAddon>
                <SearchIcon
                  aria-hidden
                  className="size-4 text-muted-foreground"
                />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search reps or offices"
                placeholder="Search reps or offices"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-md:text-base"
              />
            </InputGroup>
            <Select
              items={[
                { value: "all", label: "All Offices" },
                ...ATT_SEGMENTS.map((s) => ({ value: s.name, label: s.name })),
              ]}
              value={segment}
              onValueChange={(v) => setSegment(v ?? "all")}
            >
              <SelectTrigger aria-label="Office" className="w-[168px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {ATT_SEGMENTS.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WeekPicker span={span} onSpan={changeSpan} />
            {(searching || segment !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setSegment("all")
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <DataGrid
          table={table}
          recordCount={rows.length}
          emptyMessage="No reps or offices match this view. Clear the filters or search again."
          tableLayout={{
            dense: true,
            columnsResizable: true,
            footerBackground: true,
            width: "fixed",
          }}
        >
          <DataGridContainer className="relative">
            <DataGridScrollArea>
              <DataGridTable
                footerContent={
                  <>
                    <FootRow
                      label="Attainment Summary"
                      name="All Offices"
                      caption={footer.totalLabel}
                      values={footer.total}
                      weeks={weeks}
                      last={last}
                    />
                    <FootRow
                      label={visibleLabel(rows.length)}
                      name={footer.segmentName}
                      caption={footer.segmentLabel}
                      values={footer.segment}
                      weeks={weeks}
                      last={last}
                    />
                  </>
                }
              />
            </DataGridScrollArea>
          </DataGridContainer>
          <FrameFooter>
            <DataGridPagination />
          </FrameFooter>
        </DataGrid>
      </FramePanel>
      <SortAnnouncer sort={sort} sortOf={sortOf} />
    </Frame>
  )
}

/** Keeps the header's sort state for screen readers, which plain buttons don't say */
function SortAnnouncer({
  sort,
  sortOf,
}: {
  sort: { id: string; desc: boolean } | null
  sortOf: (id: string) => string | undefined
}) {
  if (!sort) return null
  return (
    <p className="sr-only" aria-live="polite">
      Sorted by{" "}
      {sort.id === "name" ? "office or rep" : ATT_WEEKS[Number(sort.id)]},{" "}
      {sortOf(sort.id)}
    </p>
  )
}

function HeadButton({
  label,
  end,
  onClick,
}: {
  label: string
  end?: boolean
  onClick: () => void
}) {
  return (
    <div className="-ms-2 flex h-full items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn(
          "h-6 gap-1.5 rounded-lg px-2 text-sm font-normal text-secondary-foreground/80 hover:bg-secondary hover:text-foreground",
          end && "w-full justify-end pr-0 text-end"
        )}
      >
        {label}
      </Button>
    </div>
  )
}

function NameCell({
  row,
  span,
  open,
  onToggle,
}: {
  row: AttRow
  span: WeekSpan
  open: boolean
  onToggle: () => void
}) {
  if (row.kind === "rep") {
    const flag = repFlag(row.rep!, span)
    const f = FLAG[flag.status]
    const Icon = f.icon
    return (
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="size-6 shrink-0" />
          <span className="block min-w-0 truncate text-sm text-muted-foreground">
            {row.name}
          </span>
        </div>
        <div className="ml-auto flex shrink-0 justify-end">
          <div className="inline-flex items-center justify-end gap-2">
            <span className={cn("text-xs font-medium tabular-nums", f.ink)}>
              {varianceLabel(flag.variance)}
            </span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={`${row.name}: ${flag.status}`}
                    className="inline-flex items-center justify-center rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                <Icon
                  aria-hidden
                  className={cn("size-4 shrink-0", FLAG_ICON[flag.status])}
                />
              </TooltipTrigger>
              <FigureTip
                badge={flag.status}
                badgeClass={f.badge}
                title={weekLabel(flag.week)}
                line={flag.line}
                actual={flag.actual}
                plan={flag.plan}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
  const match = planMatch(row.index, span, row.figures)
  const r = 8
  const c = 2 * Math.PI * r
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onToggle}
          aria-expanded={open}
          className="size-6 shrink-0 rounded-md p-0 text-muted-foreground shadow-none hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-muted-foreground aria-expanded:hover:bg-muted"
        >
          <ChevronRightIcon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-150",
              open && "rotate-90"
            )}
          />
          <span className="sr-only">
            {open ? "Collapse" : "Expand"} {row.name}
          </span>
        </Button>
        <span className="block min-w-0 truncate text-sm font-semibold text-foreground">
          {row.name}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`${row.name}: plan match ${match.percent}%`}
                className="inline-flex items-center gap-1.5 rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className={cn(
                "size-5 shrink-0",
                match.close ? "text-emerald-500" : "text-amber-500"
              )}
            >
              <circle
                cx="12"
                cy="12"
                r={r}
                fill="none"
                strokeWidth="3"
                className="stroke-border"
              />
              <circle
                cx="12"
                cy="12"
                r={r}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - match.percent / 100)}
                transform="rotate(-90 12 12)"
                className="stroke-current"
              />
            </svg>
            <span className="text-xs text-muted-foreground tabular-nums">
              {match.percent}%
            </span>
          </TooltipTrigger>
          <FigureTip
            badge="Plan Match"
            badgeClass={match.close ? "bg-emerald-700" : "bg-amber-700"}
            title={`${match.percent}%`}
            line={match.line}
            actual={match.actual}
            plan={match.plan}
          />
        </Tooltip>
      </div>
    </div>
  )
}

/** The figure tooltip: a status badge and its subject, the sentence, then actual, plan and variance */
function FigureTip({
  badge,
  badgeClass,
  title,
  line,
  actual,
  plan,
}: {
  badge: string
  badgeClass: string
  title: string
  line: string
  actual: number
  plan: number
}) {
  return (
    <TooltipContent className="max-w-xs min-w-[220px] border border-white/10 p-3.5 shadow-xl ring-1 ring-white/10">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "h-5 min-w-5 rounded-sm px-1.25 py-0.5 text-xs text-white",
              badgeClass
            )}
          >
            {badge}
          </Badge>
          <span className="text-sm font-medium tabular-nums">{title}</span>
        </div>
        <p className="text-sm leading-5 text-background/88">{line}</p>
        <div className="grid gap-1.5 border-t border-white/10 pt-2.5 text-[11px] leading-4">
          {(
            [
              ["Actual", actual],
              ["Plan", plan],
              ["Variance", actual - plan],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3">
              <span className="text-background/60">{k}</span>
              <span className="text-end font-medium text-background/92 tabular-nums">
                {money(v)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipContent>
  )
}

function WeekCell({
  row,
  week,
  view,
}: {
  row: AttRow
  week: number
  view: AttView
}) {
  const { value, share } = cellValue(row.figures, week, view)
  return (
    <div className="flex w-full items-center justify-end gap-2">
      <span
        className={cn(
          "text-sm text-foreground tabular-nums",
          row.kind === "segment" && "font-medium"
        )}
      >
        {money(value)}
      </span>
      {share !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs tabular-nums",
            value < 0
              ? "text-rose-600 dark:text-rose-400"
              : value > 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
          )}
        >
          {value < 0 ? (
            <TrendingDownIcon aria-hidden className="size-3" />
          ) : (
            <TrendingUpIcon aria-hidden className="size-3" />
          )}
          {share}%
        </span>
      )}
    </div>
  )
}

function FootRow({
  label,
  name,
  caption,
  values,
  weeks,
  last,
}: {
  label: string
  name: string
  caption: string
  values: number[]
  weeks: number[]
  last: number
}) {
  return (
    <DataGridTableFootRow>
      <DataGridTableFootRowCell className="ps-(--frame-panel-px)">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">{name}</span>
        </div>
      </DataGridTableFootRowCell>
      {weeks.map((m) => (
        <DataGridTableFootRowCell
          key={m}
          className={cn(
            "pr-(--frame-panel-px) text-end",
            m === last && "bg-muted/20"
          )}
        >
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">{caption}</span>
            <span className="text-sm text-foreground tabular-nums">
              {money(values[m] ?? 0)}
            </span>
          </div>
        </DataGridTableFootRowCell>
      ))}
    </DataGridTableFootRow>
  )
}

/** The weeks in view: step a range back or forward, or pick the weeks on a two-week calendar */
function WeekPicker({
  span,
  onSpan,
}: {
  span: WeekSpan
  onSpan: (s: WeekSpan) => void
}) {
  const [selected, setSelected] = useState<
    { from: Date; to?: Date } | undefined
  >({ from: weekStart(span.from), to: weekEnd(span.to) })
  const move = (dir: -1 | 1) => {
    const next = stepSpan(span, dir)
    onSpan(next)
    setSelected({ from: weekStart(next.from), to: weekEnd(next.to) })
  }
  return (
    <ButtonGroup aria-label="Weeks">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous Range"
        disabled={span.from === 0}
        onClick={() => move(-1)}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="group/pick-date w-[236px] justify-between font-normal"
            />
          }
        >
          <span className="truncate">{spanLabel(span)}</span>
          <CalendarIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground/80 transition-colors group-hover/pick-date:text-foreground"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          {/* Opens on the weeks in view, not on today, where nothing can be picked */}
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={weekStart(span.from)}
            selected={selected}
            disabled={[
              { before: localDate(ATT_FIRST_DAY) },
              { after: localDate(ATT_LAST_DAY) },
            ]}
            onSelect={(r) => {
              setSelected(r?.from ? { from: r.from, to: r.to } : undefined)
              if (!r?.from) return
              onSpan({ from: weekOf(r.from), to: weekOf(r.to ?? r.from) })
            }}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next Range"
        disabled={span.to === ATT_WEEKS.length - 1}
        onClick={() => move(1)}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
    </ButtonGroup>
  )
}
