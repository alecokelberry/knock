"use client"

import {
  type ColumnDef,
  type RowSelectionState,
  useTable,
} from "@tanstack/react-table"
import {
  CheckCheckIcon,
  CheckIcon,
  EllipsisIcon,
  EyeIcon,
  FunnelIcon,
  GaugeIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react"
import { useRef, useState } from "react"

import { ApprovalSheet } from "@/components/sales/approval-sheet"
import { RequestBadge, StatusBadge } from "@/components/sales/approval-status"
import { RequestSheet } from "@/components/sales/request-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "@/components/ui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header"
import { DataGridColumnVisibility } from "@/components/ui/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/ui/data-grid/data-grid-scroll-area"
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/ui/data-grid/data-grid-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label"
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
import { toast } from "@/components/ui/toast"
import {
  APPROVAL_STATUSES,
  APPROVALS,
  APPROVER_NAMES,
  APPROVERS,
  type Approval,
  type ApprovalStatus,
  REQUESTERS,
} from "@/data/approvals"
import {
  approvedLine,
  bulkLine,
  decide,
  deniedLine,
  filterApprovals,
  money,
  newApproval,
  queueSummary,
  type RequestForm,
  selectionLines,
  statusCounts,
  submittedLine,
} from "@/lib/approvals"
import { cn } from "@/lib/utils"

const ALL = "all"
const APPROVER_ITEMS = [
  { value: ALL, label: "All approvers" },
  ...APPROVER_NAMES.map((a) => ({ value: a, label: a })),
]
const STATUS_RANK: Record<ApprovalStatus, number> = {
  Pending: 0,
  Approved: 1,
  Denied: 2,
  Expired: 3,
}
const Dot = () => (
  <span
    aria-hidden
    className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
  />
)
const DENY = "text-destructive hover:text-destructive"

/** Pipeline → Approvals: the desk's queue of exceptions, signed off one by one or together */
export function Approvals() {
  const [all, setAll] = useState(APPROVALS)
  const [query, setQuery] = useState("")
  const [approver, setApprover] = useState<string>(ALL)
  const [statuses, setStatuses] = useState<ApprovalStatus[]>([])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [viewing, setViewing] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const seq = useRef(0)
  // One array per change, or the grid takes each render for new data and resets its pages
  const shown = filterApprovals(
    all,
    query,
    approver === ALL ? null : approver,
    statuses
  )
  const summary = queueSummary(all, shown)
  const selected = all.filter((a) => selection[a.id])
  const filtered = !!query.trim() || approver !== ALL || statuses.length > 0

  const decideOne = (a: Approval, status: "Approved" | "Denied") => {
    setAll((rows) => decide(rows, [a.id], status))
    if (status === "Approved")
      toast.add({
        type: "success",
        title: "Request approved",
        description: approvedLine(a),
      })
    else
      toast.add({
        type: "success",
        title: "Request denied",
        description: deniedLine(a),
      })
  }
  const decideSelected = (status: "Approved" | "Denied") => {
    const pending = selected.filter((a) => a.status === "Pending")
    setAll((rows) =>
      decide(
        rows,
        pending.map((a) => a.id),
        status
      )
    )
    setSelection({})
    toast.add({
      type: "success",
      title: status === "Approved" ? "Requests approved" : "Requests denied",
      description: bulkLine(pending.length, status),
    })
  }
  const submit = (form: RequestForm) => {
    // A new request goes to the top of the queue
    const request = newApproval(
      form,
      `apr_new${String(++seq.current).padStart(4, "0")}`
    )
    setAll((rows) => [request, ...rows])
    toast.add({
      type: "success",
      title: "Request submitted",
      description: submittedLine(form),
    })
  }

  // decideOne only calls setters and toasts, so the columns can stay put
  const columns: ColumnDef<typeof dataGridFeatures, Approval>[] = [
    {
      id: "select",
      size: 36,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      header: () => <DataGridTableRowSelectAll />,
      meta: { headerClassName: "ps-5!", cellClassName: "relative ps-5!" },
      cell: ({ row }) => (
        <>
          <div
            aria-hidden
            className="absolute inset-s-0 top-0 bottom-0 hidden w-[2px] bg-primary in-data-[state=selected]:block"
          />
          <DataGridTableRowSelect row={row} />
        </>
      ),
    },
    {
      id: "rep",
      accessorFn: (a) => a.rep,
      size: 220,
      enableHiding: false,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Rep" visibility />
      ),
      meta: {
        headerTitle: "Rep",
        headerClassName: "ps-6!",
        cellClassName: "truncate ps-6!",
      },
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <PersonAvatar name={row.original.rep} className="shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {row.original.rep}
            </div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={`${REQUESTERS[row.original.rep]?.title}, ${REQUESTERS[row.original.rep]?.email}`}
            >
              {REQUESTERS[row.original.rep]?.title}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "request",
      accessorFn: (a) => a.request,
      size: 200,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Request" visibility />
      ),
      meta: { headerTitle: "Request", cellClassName: "truncate" },
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-1">
          <RequestBadge
            request={row.original.request}
            type={row.original.type}
          />
          <span className="truncate text-xs text-muted-foreground">
            {row.original.account} · {row.original.quote}
          </span>
        </div>
      ),
    },
    {
      id: "justification",
      accessorFn: (a) => a.justification,
      size: 240,
      enableSorting: false,
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Justification"
          visibility
        />
      ),
      meta: { headerTitle: "Justification", cellClassName: "truncate" },
      cell: ({ row }) => (
        <span className="block truncate text-sm text-muted-foreground">
          {row.original.justification}
        </span>
      ),
    },
    {
      id: "requested",
      accessorFn: (a) => a.requested,
      size: 120,
      enableSorting: false,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Requested" visibility />
      ),
      meta: { headerTitle: "Requested", cellClassName: "truncate" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.requested}
        </span>
      ),
    },
    {
      id: "value",
      accessorFn: (a) => a.value,
      size: 130,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Value" visibility />
      ),
      meta: { headerTitle: "Value", cellClassName: "truncate" },
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground tabular-nums">
          {money(row.original.value)}
        </span>
      ),
    },
    {
      id: "approver",
      accessorFn: (a) => a.approver,
      size: 200,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Approver" visibility />
      ),
      meta: { headerTitle: "Approver", cellClassName: "truncate" },
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <PersonAvatar
            name={row.original.approver}
            className="size-7 shrink-0"
          />
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {row.original.approver}
            </div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={APPROVERS[row.original.approver]}
            >
              {APPROVERS[row.original.approver]}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (a) => STATUS_RANK[a.status],
      size: 130,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" visibility />
      ),
      meta: { headerTitle: "Status", cellClassName: "truncate" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      size: 224,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      header: () => <span className="sr-only">Actions</span>,
      meta: { headerClassName: "pe-5!", cellClassName: "pe-5!" },
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="flex items-center justify-end gap-1.5">
            {a.status === "Pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={DENY}
                  aria-label={`Deny ${a.request} for ${a.rep}`}
                  onClick={() => decideOne(a, "Denied")}
                >
                  <XIcon aria-hidden data-icon="inline-start" />
                  Deny
                </Button>
                <Button
                  size="sm"
                  aria-label={`Approve ${a.request} for ${a.rep}`}
                  onClick={() => decideOne(a, "Approved")}
                >
                  <CheckIcon aria-hidden data-icon="inline-start" />
                  Approve
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Row actions for ${a.request}, ${a.rep}`}
                  />
                }
              >
                <EllipsisIcon aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setViewing(a.id)}>
                    <EyeIcon aria-hidden />
                    View quote
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: shown,
    getRowId: (a) => a.id,
    enableRowSelection: true,
    state: { rowSelection: selection },
    onRowSelectionChange: setSelection,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
      columnVisibility: { requested: false, approver: false },
    },
  })
  const [picked, pendingLine] = selectionLines(selected)
  const counts = statusCounts(all)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="sr-only">Approvals</h1>
      <Frame className="w-full">
        <FrameHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <FrameTitle className="font-semibold">Approvals</FrameTitle>
            <FrameDescription className="text-xs">
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span>{summary.visible} visible</span>
                <Dot />
                <span>{summary.pending} pending</span>
                <Dot />
                <span>{summary.flagged} flagged</span>
              </span>
            </FrameDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                // The rules are applied to each new request (lib/approvals.ts)
                toast.add({
                  type: "info",
                  title: "Approval rules",
                  description:
                    "Price overrides under 10% are approved by rule; past 20%, or an advance over $1,000, goes to the regional director.",
                })
              }
            >
              <GaugeIcon aria-hidden data-icon="inline-start" />
              Approval rules
            </Button>
            <Button size="sm" onClick={() => setRequesting(true)}>
              <PlusIcon aria-hidden data-icon="inline-start" />
              New request
            </Button>
          </div>
        </FrameHeader>
        <DataGrid
          table={table}
          recordCount={shown.length}
          emptyMessage="No approvals match this view. Clear filters or widen your search to see the full queue."
          tableLayout={{
            dense: true,
            columnsResizable: true,
            columnsPinnable: true,
            columnsMovable: true,
            columnsVisibility: true,
            width: "fixed",
          }}
        >
          <FramePanel className="p-0! shadow-none!">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="h-7 w-full min-w-56 sm:w-64">
                  <InputGroupAddon>
                    <SearchIcon aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Search approvals"
                    placeholder="Search approvals..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="max-md:text-base"
                  />
                </InputGroup>
                <Select
                  items={APPROVER_ITEMS}
                  value={approver}
                  onValueChange={(v) => v && setApprover(v)}
                >
                  <SelectTrigger aria-label="Approver" className="w-[172px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVER_ITEMS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <StatusFilter
                  value={statuses}
                  counts={counts}
                  onChange={setStatuses}
                />
                {filtered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery("")
                      setApprover(ALL)
                      setStatuses([])
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DataGridColumnVisibility
                  table={table}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="View settings"
                    >
                      <Settings2Icon aria-hidden data-icon="inline-start" />
                      View settings
                    </Button>
                  }
                />
              </div>
            </div>
            <Separator />
            {selected.length > 0 && (
              <>
                <div
                  className="flex flex-col gap-3 bg-muted/25 px-5 py-3 lg:flex-row lg:items-center lg:justify-between"
                  role="status"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium">{picked}</span>
                    <span className="text-xs text-muted-foreground">
                      {pendingLine}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={DENY}
                      disabled={!selected.some((a) => a.status === "Pending")}
                      onClick={() => decideSelected("Denied")}
                    >
                      <XIcon aria-hidden data-icon="inline-start" />
                      Deny selected
                    </Button>
                    <Button
                      size="sm"
                      disabled={!selected.some((a) => a.status === "Pending")}
                      onClick={() => decideSelected("Approved")}
                    >
                      <CheckCheckIcon aria-hidden data-icon="inline-start" />
                      Approve selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelection({})}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <Separator />
              </>
            )}
            <DataGridContainer>
              <DataGridScrollArea>
                <DataGridTable />
              </DataGridScrollArea>
            </DataGridContainer>
          </FramePanel>
          <FrameFooter>
            <DataGridPagination />
          </FrameFooter>
        </DataGrid>
      </Frame>
      <ApprovalSheet
        approval={all.find((a) => a.id === viewing) ?? null}
        onOpenChange={(open) => !open && setViewing(null)}
        onDecide={(a, status) => {
          decideOne(a, status)
          setViewing(null)
        }}
      />
      <RequestSheet
        open={requesting}
        onOpenChange={setRequesting}
        onSubmit={submit}
      />
    </div>
  )
}

/** Status: a popover of checkboxes with each status's count, and the count picked on the button */
function StatusFilter({
  value,
  counts,
  onChange,
}: {
  value: ApprovalStatus[]
  counts: Record<ApprovalStatus, number>
  onChange: (v: ApprovalStatus[]) => void
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Filter by status" />
        }
      >
        <FunnelIcon aria-hidden data-icon="inline-start" />
        Status
        {value.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {value.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-48 flex-col gap-2.5 p-3">
        <span className="text-xs font-medium text-muted-foreground">
          Filter by status
        </span>
        {APPROVAL_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-2.5">
            <Checkbox
              id={`status-${s}`}
              checked={value.includes(s)}
              onCheckedChange={(on) =>
                onChange(on ? [...value, s] : value.filter((x) => x !== s))
              }
            />
            <Label
              htmlFor={`status-${s}`}
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 font-normal"
              )}
            >
              <span className="truncate">{s}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {counts[s]}
              </span>
            </Label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
