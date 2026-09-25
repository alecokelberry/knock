"use client"

import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import {
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  FunnelIcon,
  HousePlusIcon,
  KanbanIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Area, AreaChart, YAxis } from "recharts"

import { DealAddSheet } from "@/components/sales/deal-add-sheet"
import { CrumbHeader, RangeMenu } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "@/components/ui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header"
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/ui/data-grid/data-grid-scroll-area"
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/ui/data-grid/data-grid-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/toast"
import { CONTACT_BY_ID } from "@/data/contacts"
import {
  type Deal,
  DEAL_STATUS_DOT,
  DEAL_STATUSES,
  DEALS,
  type DealStatus,
} from "@/data/deals"
import { REPORT_RANGES } from "@/data/reports"
import { memberName } from "@/data/team"
import { downloadCsv } from "@/lib/csv"
import { probTone } from "@/lib/pipeline"
import {
  attentionCsv,
  attentionMatches,
  attentionRows,
  dueLine,
  type ReportKpi,
  reportKpis,
  stageOf,
} from "@/lib/reports"
import { cn } from "@/lib/utils"

/** Each card's line and wash */
const KPI_COLOR: Record<ReportKpi["id"], string> = {
  serviced: "oklch(0.62 0.17 250)",
  forecast: "oklch(0.64 0.15 155)",
  close: "oklch(0.6 0.2 295)",
}

/** A status's badge: the board's dot on a tinted badge */
const STATUS_BADGE: Record<
  DealStatus,
  | "secondary"
  | "primary-light"
  | "info-light"
  | "warning-light"
  | "success-light"
> = {
  New: "secondary",
  Working: "primary-light",
  "On track": "info-light",
  "At risk": "warning-light",
  Committed: "success-light",
}
const SOURCE_BADGE = {
  Door: "outline",
  Callback: "info-light",
  Referral: "primary-light",
} as const

/** Reports → Overview: the season's three headline numbers and the households that need a decision this week */
export function ReportsOverview() {
  const [range, setRange] = useState<string>("This month")
  const [deals, setDeals] = useState<Deal[]>(DEALS)
  const rows = attentionRows(deals)
  return (
    <>
      <CrumbHeader page="Reports">
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
            toast.add({
              type: "success",
              title: "Export ready",
              description: "The households needing attention, as a CSV.",
              actionProps: {
                children: "Download",
                onClick: () =>
                  downloadCsv(
                    "households-needing-attention.csv",
                    attentionCsv(rows)
                  ),
              },
            })
          }
        >
          <DownloadIcon aria-hidden data-icon="inline-start" />
          Export
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Reports</h1>
        <section
          aria-label="Season numbers"
          className="grid gap-5 @2xl:grid-cols-3"
        >
          {reportKpis().map((k) => (
            <KpiCard key={k.id} kpi={k} />
          ))}
        </section>
        <Attention
          rows={rows}
          total={deals.filter((d) => d.stage !== "serviced").length}
          onAdd={(d) => setDeals((all) => [d, ...all])}
        />
      </div>
    </>
  )
}

/** A headline card: the title, what it counts, the figure, and ten weeks of it as a soft area */
function KpiCard({ kpi }: { kpi: ReportKpi }) {
  const color = KPI_COLOR[kpi.id]
  const config: ChartConfig = { value: { label: kpi.title, color } }
  const data = kpi.series.map((value, i) => ({ week: `W${i + 1}`, value }))
  const gradient = `kpi-${kpi.id}`
  return (
    <Frame>
      <FramePanel className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-medium">{kpi.title}</h2>
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-xs text-muted-foreground">
              {kpi.sub}
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {kpi.value}
            </span>
          </div>
          <ChartContainer
            config={config}
            className="aspect-auto h-12 w-40 shrink-0"
            role="img"
            aria-label={`${kpi.title} by week, ${kpi.value} now`}
          >
            <AreaChart
              data={data}
              margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={1.5}
                fill={`url(#${gradient})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </FramePanel>
    </Frame>
  )
}

/** Every sortable column's header */
const header: ColumnDef<typeof dataGridFeatures, Deal>["header"] = ({
  column,
}) => <DataGridColumnHeader column={column} />

/** The households that need a decision this week: search, a status filter, the table and Add deal */
function Attention({
  rows,
  total,
  onAdd,
}: {
  rows: Deal[]
  total: number
  onAdd: (d: Deal) => void
}) {
  const [query, setQuery] = useState("")
  const [statuses, setStatuses] = useState<DealStatus[]>([])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: "value", desc: true },
  ])
  const [adding, setAdding] = useState(false)
  const shown = rows.filter(
    (d) =>
      attentionMatches(d, query) &&
      (!statuses.length || statuses.includes(d.status))
  )
  const picked = Object.keys(selection).filter((id) => selection[id])

  const columns: ColumnDef<typeof dataGridFeatures, Deal>[] = [
    {
      id: "select",
      enableSorting: false,
      size: 40,
      header: () => <DataGridTableRowSelectAll />,
      meta: {
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    },
    {
      id: "household",
      accessorFn: (d) => d.id,
      header,
      size: 150,
      meta: { headerTitle: "Household" },
      cell: ({ row: { original: d } }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-foreground tabular-nums">
            {d.id.toUpperCase()}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {d.office} · {memberName(d.ownerId)}
          </span>
        </div>
      ),
    },
    {
      id: "homeowner",
      accessorFn: (d) => d.household,
      header,
      size: 210,
      meta: { headerTitle: "Homeowner" },
      cell: ({ row: { original: d } }) => {
        const c = d.contactId ? CONTACT_BY_ID[d.contactId] : undefined
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <PersonAvatar name={d.household} className="shrink-0" />
            <div className="min-w-0">
              {c ? (
                <Link
                  href={`/contacts/${c.id}`}
                  className="block truncate font-medium text-foreground hover:underline"
                >
                  {d.household}
                </Link>
              ) : (
                <span className="block truncate font-medium">
                  {d.household}
                </span>
              )}
              <span className="block truncate text-xs text-muted-foreground">
                {d.address}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: "plan",
      accessorFn: (d) => d.plan ?? "",
      header,
      size: 170,
      meta: { headerTitle: "Plan" },
      cell: ({ row: { original: d } }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm text-foreground">{d.plan}</span>
          <span className="truncate text-xs text-muted-foreground">
            {[d.addOn && `+ ${d.addOn}`, d.type].filter(Boolean).join(" · ")}
          </span>
        </div>
      ),
    },
    {
      id: "stage",
      accessorFn: (d) => stageOf(d).progress,
      header,
      size: 140,
      meta: { headerTitle: "Stage" },
      cell: ({ row: { original: d } }) => {
        const tone = probTone(d.winProbability)
        return (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <KanbanIcon
                aria-hidden
                className="size-3.5 text-muted-foreground"
              />
              {stageOf(d).label}
            </span>
            <div className="flex items-center gap-2">
              <Progress
                value={d.winProbability}
                aria-label={`${d.household}: ${d.winProbability}% odds of service`}
                className={cn(
                  "flex-1 gap-0 **:data-[slot=progress-track]:h-1",
                  tone.bar
                )}
              />
              <span className="w-8 text-end text-xs text-muted-foreground tabular-nums">
                {d.winProbability}%
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: "source",
      accessorFn: (d) => d.source,
      header,
      size: 90,
      meta: { headerTitle: "Source" },
      cell: ({ row: { original: d } }) => (
        <Badge variant={SOURCE_BADGE[d.source]}>{d.source}</Badge>
      ),
    },
    {
      id: "value",
      accessorFn: (d) => d.value,
      header,
      size: 90,
      meta: { headerTitle: "Value" },
      cell: ({ row: { original: d } }) => (
        <span className="font-medium tabular-nums">{d.valueLabel}</span>
      ),
    },
    {
      id: "status",
      accessorFn: (d) => d.status,
      header,
      size: 170,
      meta: { headerTitle: "Status" },
      cell: ({ row: { original: d } }) => (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <Badge variant={STATUS_BADGE[d.status]}>
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", DEAL_STATUS_DOT[d.status])}
            />
            {d.status}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            {dueLine(d)}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      size: 52,
      header: () => <span className="sr-only">Actions</span>,
      meta: {
        headerClassName: "pe-(--frame-panel-header-px)",
        cellClassName: "pe-(--frame-panel-px)",
      },
      cell: ({ row: { original: d } }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${d.household}`}
                />
              }
            >
              <EllipsisIcon aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/pipeline" />}>
                  <KanbanIcon aria-hidden />
                  Open the board
                </DropdownMenuItem>
                {d.contactId && (
                  <DropdownMenuItem
                    render={<Link href={`/contacts/${d.contactId}`} />}
                  >
                    <UserIcon aria-hidden />
                    Open homeowner
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(d.id.toUpperCase())
                      .catch(() => {})
                    toast.add({
                      type: "success",
                      title: "ID copied",
                      description: d.id.toUpperCase(),
                    })
                  }}
                >
                  <CopyIcon aria-hidden />
                  Copy ID
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: shown,
    getRowId: (d) => d.id,
    enableRowSelection: true,
    autoResetPageIndex: false,
    state: { rowSelection: selection, sorting },
    onRowSelectionChange: setSelection,
    onSortingChange: setSorting,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  return (
    <Frame spacing="sm">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <FrameTitle className="font-semibold">
            Households Needing Attention
          </FrameTitle>
          <FrameDescription className="text-xs">
            {shown.length} of {total} households need a decision this week
          </FrameDescription>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <HousePlusIcon aria-hidden data-icon="inline-start" />
          Add deal
        </Button>
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <InputGroup className="h-8 w-full sm:w-60">
              <InputGroupAddon>
                <SearchIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search households"
                placeholder="Search households..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  table.setPageIndex(0)
                }}
              />
            </InputGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <FunnelIcon aria-hidden data-icon="inline-start" />
                Status
                {statuses.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    {statuses.length}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {DEAL_STATUSES.map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      checked={statuses.includes(s)}
                      onCheckedChange={(on) => {
                        setStatuses((x) =>
                          on ? [...x, s] : x.filter((y) => y !== s)
                        )
                        table.setPageIndex(0)
                      }}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          DEAL_STATUS_DOT[s]
                        )}
                      />
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <EllipsisIcon aria-hidden data-icon="inline-start" />
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    downloadCsv(
                      "households-needing-attention.csv",
                      attentionCsv(
                        picked.length
                          ? shown.filter((d) => picked.includes(d.id))
                          : shown
                      )
                    )
                  }
                >
                  <DownloadIcon aria-hidden />
                  {picked.length
                    ? `Export ${picked.length} selected`
                    : "Export all in view"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={!picked.length}
                  onClick={() => setSelection({})}
                >
                  Clear selection
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DataGrid
          table={table}
          recordCount={shown.length}
          emptyMessage="No households match these filters."
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
      <DealAddSheet
        open={adding}
        onOpenChange={setAdding}
        onCreate={(d) => {
          onAdd(d)
          table.setPageIndex(0)
        }}
      />
    </Frame>
  )
}
