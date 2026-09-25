"use client"

import {
  type ColumnDef,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import {
  DownloadIcon,
  GitMergeIcon,
  InfoIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useState } from "react"
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

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
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ADVANCE_CHANGE,
  ADVANCE_PERIODS,
  type AdvancePeriod,
  CONVERSION_RANGES,
  CONVERSION_WEEKS,
  FUNNEL_RATES,
  type Gate,
  GATES,
  REPORT_RANGES,
} from "@/data/reports"
import { downloadCsv } from "@/lib/csv"
import {
  advances,
  type BreakdownRow,
  breakdownCsv,
  breakdownRows,
  GATE_NOTE,
  type Risk,
} from "@/lib/reports"

/** Each gate's slice on the Stage Advances ring */
const GATE_COLOR: Record<Gate, string> = {
  Pitched: "oklch(0.62 0.17 250)",
  Sold: "oklch(0.64 0.15 155)",
  Scheduled: "oklch(0.72 0.16 70)",
  Serviced: "oklch(0.6 0.2 295)",
}
const RISK_BADGE: Record<
  Risk,
  "success-light" | "warning-light" | "destructive-light"
> = {
  Healthy: "success-light",
  Watch: "warning-light",
  "At risk": "destructive-light",
}

/** Reports → Conversion: the funnel week by week, the households each gate advanced, and each office's gates */
export function ReportsConversion() {
  const [range, setRange] = useState<string>("This month")
  return (
    <>
      <CrumbHeader page="Conversion">
        <RangeMenu
          ranges={REPORT_RANGES}
          short="Month"
          shortFor="This month"
          value={range}
          onChange={setRange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCsv(
              "stage-breakdown.csv",
              breakdownCsv(breakdownRows("all"))
            )
          }
        >
          <DownloadIcon aria-hidden data-icon="inline-start" />
          Export
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Conversion</h1>
        <section className="grid min-w-0 gap-5 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <StageConversion />
          <StageAdvances />
        </section>
        <StageBreakdown />
      </div>
    </>
  )
}

/** Stage Conversion: the four rates as buttons over a chart of the one picked */
function StageConversion() {
  const [range, setRange] = useState<string>(CONVERSION_RANGES[0])
  const [picked, setPicked] = useState<string>(FUNNEL_RATES[1].key)
  const rate = FUNNEL_RATES.find((r) => r.key === picked) ?? FUNNEL_RATES[1]
  const config: ChartConfig = {
    value: { label: rate.label, color: "oklch(0.62 0.17 250)" },
  }
  const data = CONVERSION_WEEKS.map((week, i) => ({
    week,
    value: rate.weeks[i],
  }))
  return (
    <Frame className="min-w-0">
      <FramePanel className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Stage Conversion</h2>
          <Select
            items={CONVERSION_RANGES.map((r) => ({ value: r, label: r }))}
            value={range}
            onValueChange={(v) => v && setRange(v)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Conversion range"
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {CONVERSION_RANGES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          role="group"
          aria-label="Rate to chart"
          className="grid grid-cols-2 overflow-hidden rounded-lg border @xl:grid-cols-4"
        >
          {FUNNEL_RATES.map((r) => {
            const Trend = r.change.startsWith("-")
              ? TrendingDownIcon
              : TrendingUpIcon
            return (
              <button
                key={r.key}
                type="button"
                aria-pressed={r.key === picked}
                onClick={() => setPicked(r.key)}
                className="flex flex-col items-start gap-1 border-border p-3 text-left transition-colors outline-none not-last:border-e hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset aria-pressed:bg-muted"
              >
                <span className="text-xs text-foreground/75">{r.label} %</span>
                <span className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums">
                    {r.weeks.at(-1)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
                    <Trend aria-hidden className="size-3" />
                    {r.change}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <ChartContainer
          config={config}
          className="aspect-auto h-56 w-full"
          role="img"
          aria-label={`${rate.label} by week: ${rate.weeks.join("%, ")}%`}
        >
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              domain={["dataMin - 1", "dataMax + 1"]}
              tickFormatter={(v: number) => `${Math.round(v)}%`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelKey="week"
                  formatter={(v) => (
                    <span className="flex w-full justify-between gap-3">
                      <span className="text-muted-foreground">
                        {rate.label}
                      </span>
                      <span className="font-medium tabular-nums">
                        {String(v)}%
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-value)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </FramePanel>
    </Frame>
  )
}

/** Stage Advances: how many households cleared each gate in the period, as a ring */
function StageAdvances() {
  const [period, setPeriod] = useState<AdvancePeriod>("30D")
  const { slices, total } = advances(period)
  const config: ChartConfig = Object.fromEntries(
    GATES.map((g) => [g, { label: g, color: GATE_COLOR[g] }])
  )
  return (
    <Frame className="min-w-0">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FrameTitle className="font-semibold">Stage Advances</FrameTitle>
          <Badge variant="success-light">
            <TrendingUpIcon aria-hidden />
            {ADVANCE_CHANGE[period]}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast.add({
              type: "success",
              title: "Advances exported",
              description: slices
                .map((s) => `${s.gate} ${s.count}`)
                .join(" · "),
            })
          }
        >
          Export
        </Button>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
            <GitMergeIcon aria-hidden className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Households advanced
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {total.toLocaleString("en-US")}
            </span>
          </div>
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[period]}
          onValueChange={(v) => v[0] && setPeriod(v[0] as AdvancePeriod)}
          aria-label="Advances period"
          className="w-full"
        >
          {ADVANCE_PERIODS.map((p) => (
            <ToggleGroupItem key={p} value={p} className="flex-1">
              {p}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="grid items-center gap-4 @sm:grid-cols-[10rem_minmax(0,1fr)]">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square size-40"
            role="img"
            aria-label={slices.map((s) => `${s.gate}: ${s.count}`).join(", ")}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="gate" hideLabel />}
              />
              <Pie
                data={slices}
                dataKey="count"
                nameKey="gate"
                innerRadius={44}
                outerRadius={74}
                paddingAngle={2}
                cornerRadius={4}
                stroke="var(--card)"
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.gate} fill={GATE_COLOR[s.gate]} />
                ))}
                <Label
                  position="center"
                  className="fill-foreground text-sm font-semibold"
                  value={period}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="flex flex-col gap-2">
            {slices.map((s) => (
              <li key={s.gate} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GATE_COLOR[s.gate] }}
                />
                <span className="flex-1">{s.gate}</span>
                <span className="font-medium tabular-nums">
                  {s.count.toLocaleString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <InfoIcon aria-hidden className="size-3.5 shrink-0" />
          Each household is counted once, at the furthest gate it cleared.
        </p>
      </FramePanel>
    </Frame>
  )
}

/** Every sortable column's header */
const header: ColumnDef<typeof dataGridFeatures, BreakdownRow>["header"] = ({
  column,
}) => <DataGridColumnHeader column={column} />

/** A count and its share, as the breakdown's cells print them */
const Share = ({ n, share }: { n: number; share: number }) => (
  <div className="flex flex-col">
    <span className="font-medium tabular-nums">
      {n.toLocaleString("en-US")}
    </span>
    <span className="text-xs text-muted-foreground tabular-nums">{share}%</span>
  </div>
)

/** Stage Breakdown: each office's gates, what advanced, stalled and was lost, and how long it takes */
function StageBreakdown() {
  const [gate, setGate] = useState<Gate | "all">("all")
  const [sorting, setSorting] = useState<SortingState>([])
  const rows = breakdownRows(gate)
  const columns: ColumnDef<typeof dataGridFeatures, BreakdownRow>[] = [
    {
      id: "gate",
      accessorFn: (r) => GATES.indexOf(r.gate),
      header,
      size: 250,
      meta: {
        headerTitle: "Stage",
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row: { original: r } }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium">{r.gate}</span>
          <span className="truncate text-xs text-muted-foreground">
            {r.code} · {r.office} · {GATE_NOTE[r.gate]}
          </span>
        </div>
      ),
    },
    {
      id: "owner",
      accessorFn: (r) => r.owner,
      header,
      size: 150,
      meta: { headerTitle: "Owner" },
      cell: ({ row: { original: r } }) => (
        <span className="flex min-w-0 items-center gap-2">
          <PersonAvatar name={r.owner} size="sm" className="shrink-0" />
          <span className="truncate text-sm">{r.owner}</span>
        </span>
      ),
    },
    {
      id: "advanced",
      accessorFn: (r) => r.advanced,
      header,
      size: 100,
      meta: { headerTitle: "Advanced" },
      cell: ({ row: { original: r } }) => (
        <Share n={r.advanced} share={r.advancedShare} />
      ),
    },
    {
      id: "stalled",
      accessorFn: (r) => r.stalled,
      header,
      size: 100,
      meta: { headerTitle: "Stalled" },
      cell: ({ row: { original: r } }) => (
        <Share n={r.stalled} share={r.stalledShare} />
      ),
    },
    {
      id: "lost",
      accessorFn: (r) => r.lost,
      header,
      size: 100,
      meta: { headerTitle: "Lost" },
      cell: ({ row: { original: r } }) => (
        <Share n={r.lost} share={r.lostShare} />
      ),
    },
    {
      id: "risk",
      accessorFn: (r) => r.risk,
      header,
      size: 100,
      meta: { headerTitle: "Risk" },
      cell: ({ row: { original: r } }) => (
        <Badge variant={RISK_BADGE[r.risk]}>{r.risk}</Badge>
      ),
    },
    {
      id: "days",
      accessorFn: (r) => r.avgDays,
      header,
      size: 100,
      meta: {
        headerTitle: "Avg Days",
        headerClassName: "pe-(--frame-panel-header-px)",
        cellClassName: "pe-(--frame-panel-px)",
      },
      cell: ({ row: { original: r } }) => (
        <span className="tabular-nums">{r.avgDays} days</span>
      ),
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (r) => r.id,
    state: { sorting },
    onSortingChange: setSorting,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  return (
    <Frame spacing="sm">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <FrameTitle className="font-semibold">Stage Breakdown</FrameTitle>
          <FrameDescription className="text-xs">
            What advanced, stalled and was lost at each gate this season, by
            office.
          </FrameDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            items={[
              { value: "all", label: "All Stages" },
              ...GATES.map((g) => ({ value: g, label: g })),
            ]}
            value={gate}
            onValueChange={(v) => {
              if (!v) return
              setGate(v)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger size="sm" aria-label="Stage" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Stages</SelectItem>
              {GATES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv("stage-breakdown.csv", breakdownCsv(rows))
            }
          >
            <DownloadIcon aria-hidden data-icon="inline-start" />
            Export
          </Button>
        </div>
      </FrameHeader>
      <FramePanel className="p-0">
        <DataGrid
          table={table}
          recordCount={rows.length}
          emptyMessage="No gates in view."
          tableLayout={{ dense: true, width: "fixed" }}
        >
          <DataGridContainer>
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
          </DataGridContainer>
          <FrameFooter>
            <DataGridPagination sizes={[5, 10]} />
          </FrameFooter>
        </DataGrid>
      </FramePanel>
    </Frame>
  )
}
