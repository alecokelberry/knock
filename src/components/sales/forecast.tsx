"use client"

import { type ColumnDef, useTable } from "@tanstack/react-table"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BuildingIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  CalendarClockIcon,
  DownloadIcon,
  FunnelXIcon,
  InfoIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useState } from "react"
import { Cell, Line, LineChart, Pie, PieChart, YAxis } from "recharts"

import { FilterBar, type FilterBarField } from "@/components/shared/filter-bar"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "@/components/ui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  FORECAST_CALLS,
  FORECAST_CATEGORIES,
  FORECAST_BOOKS,
  FORECAST_RANGES,
  FORECAST_STAGES,
  type ForecastCategory,
  type ForecastBook,
  MOVEMENT_SUMMARY,
  MOVEMENT_WEEKS,
  MOVEMENTS,
  type Movement,
} from "@/data/forecast"
import { downloadCsv } from "@/lib/csv"
import { formatDay } from "@/lib/dates"
import { type FilterBarRule, passesFilters } from "@/lib/filter-bar"
import {
  forecastCall,
  forecastCsv,
  forecastField,
  shortMoney,
  weighted,
} from "@/lib/forecast"
import { cn } from "@/lib/utils"

const CATEGORY_KEY: Record<
  ForecastCategory,
  "commit" | "bestCase" | "pipeline"
> = { Commit: "commit", "Best Case": "bestCase", Pipeline: "pipeline" }
const CATEGORY_DOT: Record<ForecastCategory, string> = {
  Commit: "bg-teal-500 dark:bg-teal-400",
  "Best Case": "bg-violet-500 dark:bg-violet-400",
  Pipeline: "bg-slate-400 dark:bg-slate-500",
}
const CATEGORY_BADGE = {
  Commit: "success-light",
  "Best Case": "info-light",
  Pipeline: "secondary",
} as const
const GAUGE: ChartConfig = {
  commit: { label: "Commit", color: "var(--color-teal-500)" },
  bestCase: { label: "Best Case", color: "var(--color-violet-500)" },
  pipeline: { label: "Pipeline", color: "var(--color-slate-400)" },
  remainder: { label: "Not in this call", color: "var(--muted)" },
}
/** Movement's ink and icon (the success and warning inks a shade darker, so the 12px words read) */
const MOVE: Record<Movement, { ink: string; icon: typeof MinusIcon }> = {
  Raised: {
    ink: "text-emerald-700 dark:text-emerald-400",
    icon: ArrowUpRightIcon,
  },
  "Pulled in": {
    ink: "text-emerald-700 dark:text-emerald-400",
    icon: CalendarArrowUpIcon,
  },
  "No change": { ink: "text-muted-foreground", icon: MinusIcon },
  Lowered: {
    ink: "text-amber-700 dark:text-amber-400",
    icon: ArrowDownRightIcon,
  },
  Slipped: {
    ink: "text-amber-700 dark:text-amber-400",
    icon: CalendarArrowDownIcon,
  },
}
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** Pipeline → Forecast: the season's call, how it moved this week, and the reps' books behind it */
export function Forecast() {
  const [range, setRange] = useState<string>("This season")
  return (
    <>
      <CrumbHeader page="Forecast">
        <RangeMenu
          ranges={FORECAST_RANGES}
          short="Season"
          shortFor="This season"
          value={range}
          onChange={setRange}
        />
        <Button
          size="sm"
          onClick={() =>
            // Export offers the file, and downloads it only when asked
            toast.add({
              type: "success",
              title: "Export ready",
              description: "Forecast CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () => downloadCsv("forecast.csv", forecastCsv()),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Forecast</h1>
        <section className="flex min-w-0 flex-col gap-5 @3xl:flex-row @3xl:items-stretch">
          <div className="flex min-w-0 flex-1">
            <SeasonCard />
          </div>
          <div className="flex min-w-0 flex-1">
            <MovementCard />
          </div>
        </section>
        <section>
          <DealsTable />
        </section>
      </div>
    </>
  )
}

function SeasonCard() {
  const [call, setCall] = useState<string>("best")
  const picked = FORECAST_CALLS.find((c) => c.id === call)!
  const f = forecastCall(picked.categories)
  const data = [
    ...f.rows.map((r) => ({
      key: CATEGORY_KEY[r.category],
      name: r.category,
      value: r.value,
    })),
    ...(f.remainder > 0
      ? [{ key: "remainder", name: "Not in this call", value: f.remainder }]
      : []),
  ]
  return (
    <Frame stacked className="w-full">
      <FramePanel className="flex grow-0 items-center justify-between gap-3 p-3.5">
        <h2 className="text-sm font-medium">Season forecast</h2>
        <Select
          items={FORECAST_CALLS.map((c) => ({ value: c.id, label: c.label }))}
          value={call}
          onValueChange={(v) => v && setCall(v)}
        >
          <SelectTrigger aria-label="Forecast call">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {FORECAST_CALLS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FramePanel>
      <FramePanel className="relative flex flex-1 flex-col overflow-hidden p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-52 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-40 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black_0%,black_42%,transparent_100%)] [background-size:8px_8px] opacity-35" />
          <div className="absolute -inset-x-8 top-7 h-44 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_88%_76%_at_50%_16%,black_0%,black_46%,transparent_100%)] [background-size:8px_8px] opacity-45 blur-md" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent_0%,var(--card)_72%,var(--card)_100%)]" />
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className="relative mx-auto h-[158px] w-full max-w-[300px]">
            <ChartContainer
              config={GAUGE}
              className="h-full w-full"
              role="img"
              aria-label={`${picked.label}: ${shortMoney(f.total)}, ${f.ofOpen}% of open`}
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="93%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={84}
                  outerRadius={116}
                  cornerRadius={3}
                  stroke="var(--card)"
                  strokeWidth={1.5}
                  isAnimationActive={false}
                >
                  {data.map((d) => (
                    <Cell key={d.key} fill={`var(--color-${d.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-x-0 top-[82px] flex flex-col items-center">
              <span className="text-[26px] leading-none font-medium tabular-nums">
                {shortMoney(f.total)}
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">
                {f.ofOpen}% of open
              </span>
            </div>
          </div>
          <Separator className="mt-4 w-auto" />
          <ul className="flex flex-1 flex-col">
            {f.rows.map((r) => (
              <li
                key={r.category}
                className="flex flex-1 flex-col justify-center py-2.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      CATEGORY_DOT[r.category]
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.accounts} accounts · {r.share}%
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums">
                    {USD.format(r.value)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FramePanel>
    </Frame>
  )
}

function MovementCard() {
  const m = MOVEMENT_SUMMARY
  return (
    <Frame className="w-full">
      <FramePanel className="flex flex-1 flex-col p-4">
        <div className="mb-5 flex items-center justify-between gap-3">
          <FrameTitle className="font-semibold">Forecast Movement</FrameTitle>
          <span className="text-xs text-muted-foreground">Since last week</span>
        </div>
        <div className="@container flex flex-1 flex-col gap-5">
          <div className="flex flex-1 flex-col gap-3 @sm:flex-row">
            <MoveTile label="Improved" figures={m.improved} up />
            <MoveTile label="Worsened" figures={m.worsened} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-success/10 text-emerald-700 dark:text-success">
                <ArrowUpRightIcon aria-hidden className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-1 text-sm text-muted-foreground">
                Pulled in
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {m.pulledIn} {m.pulledIn === 1 ? "account" : "accounts"}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-warning/10 text-amber-700 dark:text-warning">
                <CalendarClockIcon aria-hidden className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-1 text-sm text-muted-foreground">
                Slipped
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label="About slipped accounts"
                        className="inline-flex cursor-help items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      />
                    }
                  >
                    <InfoIcon aria-hidden className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Accounts whose first service moved back a week or more.
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {m.slipped} {m.slipped === 1 ? "account" : "accounts"}
              </span>
            </div>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )
}

function MoveTile({
  label,
  figures,
  up,
}: {
  label: string
  figures: { total: number; deals: number; share: number; weeks: number[] }
  up?: boolean
}) {
  const data = MOVEMENT_WEEKS.map((week, i) => ({
    week,
    value: figures.weeks[i],
  }))
  const Trend = up ? TrendingUpIcon : TrendingDownIcon
  return (
    <div className="relative flex flex-1 flex-col justify-between gap-4 overflow-hidden rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-1">
        <span className="text-2xl leading-none font-bold text-foreground tabular-nums">
          {shortMoney(figures.total)}
        </span>
        <span className="text-xs leading-none text-muted-foreground">
          {label}
        </span>
      </div>
      <ChartContainer
        config={{
          value: { label, color: up ? "var(--success)" : "var(--warning)" },
        }}
        className="h-10 w-full"
        role="img"
        aria-label={`${label} by week, from ${shortMoney(figures.weeks[0] ?? 0)} to ${shortMoney(figures.total)}`}
      >
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelKey="week"
                formatter={(v) => (
                  <span className="flex w-full justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">
                      {shortMoney(Number(v))}
                    </span>
                  </span>
                )}
              />
            }
          />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={up ? "success-light" : "warning-light"}
          className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
        >
          {figures.deals} accounts
        </Badge>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
            up
              ? "text-emerald-700 dark:text-success"
              : "text-amber-700 dark:text-warning"
          )}
        >
          <Trend aria-hidden className="size-3.5" />
          {figures.share}%
        </span>
        <span className="text-xs text-muted-foreground">of open book</span>
      </div>
    </div>
  )
}

const OWNERS = [...new Set(FORECAST_BOOKS.map((d) => d.owner))].toSorted()
const OFFICES = [...new Set(FORECAST_BOOKS.map((d) => d.office))]
const FIELDS: FilterBarField[] = [
  {
    id: "book",
    label: "Book",
    icon: <BuildingIcon aria-hidden />,
    type: "text",
  },
  { id: "office", label: "Office", type: "select", options: OFFICES },
  {
    id: "category",
    label: "Category",
    type: "select",
    options: FORECAST_CATEGORIES,
  },
  { id: "stage", label: "Stage", type: "select", options: FORECAST_STAGES },
  { id: "owner", label: "Rep", type: "select", options: OWNERS },
  { id: "movement", label: "Movement", type: "select", options: MOVEMENTS },
]
/** The bar opens with an empty Book search */
const STARTING_RULES: FilterBarRule[] = [
  { id: "book-search", field: "book", operator: "contains", values: [""] },
]
/** Movement read as a scale for sorting, from worse to better */
const MOVE_RANK: Record<Movement, number> = {
  Slipped: 0,
  Lowered: 1,
  "No change": 2,
  "Pulled in": 3,
  Raised: 4,
}

/** Every sortable column's header */
const header: ColumnDef<typeof dataGridFeatures, ForecastBook>["header"] = ({
  column,
}) => <DataGridColumnHeader column={column} visibility />

function DealsTable() {
  const [rules, setRules] = useState(STARTING_RULES)
  // One array per change, or the grid takes each render for new data and resets its pages
  const rows = FORECAST_BOOKS.filter((d) =>
    passesFilters(d, rules, forecastField)
  )
  const columns: ColumnDef<typeof dataGridFeatures, ForecastBook>[] = [
    {
      id: "book",
      accessorFn: (d) => d.accounts,
      header,
      size: 200,
      meta: {
        headerTitle: "Book",
        autoSize: true,
        cellClassName: "truncate ps-(--frame-panel-px)",
        headerClassName: "ps-(--frame-panel-header-px)",
      },
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {row.original.accounts}{" "}
            {row.original.stage === "Pitched" ? "households" : "accounts"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.office}
          </span>
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (d) => d.category,
      header,
      size: 110,
      meta: { headerTitle: "Category" },
      cell: ({ row }) => (
        <Badge
          variant={CATEGORY_BADGE[row.original.category]}
          className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
        >
          {row.original.category}
        </Badge>
      ),
    },
    {
      id: "stage",
      accessorFn: (d) => d.stage,
      header,
      size: 110,
      meta: { headerTitle: "Stage", cellClassName: "truncate" },
      cell: ({ row }) => (
        <span className="truncate text-sm text-muted-foreground">
          {row.original.stage}
        </span>
      ),
    },
    {
      id: "amount",
      accessorFn: (d) => d.amount,
      header,
      size: 110,
      meta: { headerTitle: "Amount" },
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground tabular-nums">
          {USD.format(row.original.amount)}
        </span>
      ),
    },
    {
      id: "weighted",
      accessorFn: (d) => weighted(d),
      header,
      size: 110,
      meta: { headerTitle: "Weighted" },
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-foreground tabular-nums">
            {USD.format(weighted(row.original))}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.original.probability}%
          </span>
        </div>
      ),
    },
    {
      id: "next",
      accessorFn: (d) => d.next,
      header,
      size: 110,
      meta: { headerTitle: "Next" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDay(row.original.next)}, 2026
        </span>
      ),
    },
    {
      id: "owner",
      accessorFn: (d) => d.owner,
      header,
      size: 160,
      meta: { headerTitle: "Rep" },
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <PersonAvatar
            name={row.original.owner}
            size="sm"
            className="shrink-0"
          />
          <span className="truncate text-sm text-foreground">
            {row.original.owner}
          </span>
        </div>
      ),
    },
    {
      id: "movement",
      accessorFn: (d) => MOVE_RANK[d.movement],
      header,
      size: 120,
      meta: {
        headerTitle: "Movement",
        cellClassName: "pe-(--frame-panel-px)",
        headerClassName: "pe-(--frame-panel-header-px)",
      },
      cell: ({ row }) => {
        const mv = MOVE[row.original.movement]
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              mv.ink
            )}
          >
            <mv.icon aria-hidden className="size-3.5 shrink-0" />
            {row.original.movement}
          </span>
        )
      },
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (d) => d.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  return (
    <Frame spacing="sm">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <FrameTitle className="font-semibold text-balance">
            The Books Behind It
          </FrameTitle>
          <FrameDescription className="text-xs text-pretty">
            Each rep's scheduled, signed and priced accounts, and how they moved
          </FrameDescription>
        </div>
        <Badge
          variant="info-light"
          className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
        >
          {FORECAST_BOOKS.length} books
        </Badge>
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
          <FilterBar fields={FIELDS} rules={rules} onChange={setRules} />
          {rules.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRules(STARTING_RULES)}
            >
              <FunnelXIcon
                aria-hidden
                data-icon="inline-start"
                className="size-3.5"
              />
              Clear
            </Button>
          )}
        </div>
        <Separator />
        <DataGrid
          table={table}
          recordCount={rows.length}
          emptyMessage="No books match these filters."
          tableLayout={{
            dense: true,
            columnsResizable: true,
            columnsPinnable: true,
            columnsMovable: true,
            columnsVisibility: true,
            width: "fixed",
          }}
        >
          <DataGridContainer>
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
          </DataGridContainer>
          <FrameFooter>
            <DataGridPagination />
          </FrameFooter>
        </DataGrid>
      </FramePanel>
    </Frame>
  )
}
