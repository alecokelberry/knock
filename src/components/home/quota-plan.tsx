"use client"

import { type ColumnDef, useTable } from "@tanstack/react-table"
import {
  CircleCheckIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  FunnelIcon,
  InfoIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react"
import { useRef, useState } from "react"

import { CrumbHeader } from "@/components/shared/page-header"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "@/components/ui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header"
import { DataGridScrollArea } from "@/components/ui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table"
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
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import {
  PLAN_RISKS,
  PLAN_STATUSES,
  type PlanRisk,
  type PlanRow,
  type PlanStatus,
  QUOTA_PLAN,
} from "@/data/quota-plan"
import { money } from "@/lib/attainment"
import { downloadCsv } from "@/lib/csv"
import {
  confidenceBar,
  duplicateRow,
  filterRows,
  isDirty,
  newRow,
  type PlanField,
  parseField,
  planCsv,
  unsavedCount,
  unsavedLabel,
} from "@/lib/quota-plan"
import { cn } from "@/lib/utils"

const STATUS_BADGE: Record<
  PlanStatus,
  "success-light" | "warning-light" | "destructive-light"
> = {
  Active: "success-light",
  Draft: "warning-light",
  Blocked: "destructive-light",
}
const RISK_BADGE: Record<
  PlanRisk,
  "secondary" | "warning-light" | "destructive-light"
> = { Low: "secondary", Medium: "warning-light", High: "destructive-light" }
const RISK_DOT: Record<PlanRisk, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
}
/** Every cell's padding: tighter first and last columns */
const EDGE = "first:ps-4 last:pe-4 sm:first:ps-5 sm:last:pe-5"
/** A cell that edits on click: flush with the cell, a tint on hover */
const CELL_BUTTON =
  "-mx-1.5 flex h-9 w-[calc(100%+0.75rem)] items-center rounded-md px-1.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/60"

const StatusBadge = ({ status }: { status: PlanStatus }) => (
  <Badge
    variant={STATUS_BADGE[status]}
    className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
  >
    {status}
  </Badge>
)
const RiskBadge = ({ risk }: { risk: PlanRisk }) => (
  <Badge
    variant={RISK_BADGE[risk]}
    className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
  >
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", RISK_DOT[risk])}
    />
    {risk}
  </Badge>
)

/** Home → Quota Plan: next summer's quotas by returning rep, edited in place and saved together */
export function QuotaPlan() {
  const [saved, setSaved] = useState(QUOTA_PLAN)
  const [rows, setRows] = useState(QUOTA_PLAN)
  const unsaved = unsavedCount(saved, rows)
  return (
    <>
      <CrumbHeader page="Quota Plan">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            // Export offers the file, and downloads it only when asked
            toast.add({
              type: "success",
              title: "Export ready",
              description: "Quota plan CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () => downloadCsv("quota-plan.csv", planCsv(rows)),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Quota plan</h1>
        <Grid
          saved={saved}
          rows={rows}
          setRows={setRows}
          onSave={() => setSaved(rows)}
          onDiscard={() => setRows(saved)}
          unsaved={unsaved}
        />
      </div>
    </>
  )
}

function Grid({
  saved,
  rows,
  setRows,
  onSave,
  onDiscard,
  unsaved,
}: {
  saved: PlanRow[]
  rows: PlanRow[]
  setRows: React.Dispatch<React.SetStateAction<PlanRow[]>>
  onSave: () => void
  onDiscard: () => void
  unsaved: number
}) {
  const [query, setQuery] = useState("")
  const [statuses, setStatuses] = useState<PlanStatus[]>([])
  const [risks, setRisks] = useState<PlanRisk[]>([])
  const [editing, setEditing] = useState<{
    id: string
    field: PlanField
  } | null>(null)
  const [deleting, setDeleting] = useState<PlanRow | null>(null)
  const nextId = useRef(0)
  // One array per change, or the grid takes each render for new data
  const shown = filterRows(rows, query, statuses, risks)
  const filtered = !!query.trim() || statuses.length > 0 || risks.length > 0
  const update = (id: string, patch: Partial<PlanRow>) =>
    setRows((all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const addRep = () => {
    const id = `plan-new-${++nextId.current}`
    setRows((all) => [newRow(id), ...all])
    setEditing({ id, field: "rep" })
  }

  const text =
    (
      field: PlanField,
      render: (r: PlanRow) => React.ReactNode,
      end = false
    ): ColumnDef<typeof dataGridFeatures, PlanRow>["cell"] =>
    ({ row }) => {
      const r = row.original
      if (editing?.id === r.id && editing.field === field)
        return (
          <CellEditor
            label={`Edit ${FIELD_LABEL[field]} for ${r.rep}`}
            initial={String(r[field])}
            numeric={field !== "rep"}
            onCommit={(raw) => {
              const parsed = parseField(field, raw)
              if ("error" in parsed) return parsed.error
              update(r.id, { [field]: parsed.value })
              setEditing(null)
              return null
            }}
            onCancel={() => setEditing(null)}
          />
        )
      return (
        <div className="relative flex min-w-0 items-center">
          {field === "rep" && isDirty(saved, r) && (
            <span
              aria-hidden
              className="absolute top-1 bottom-1 -left-1.5 w-0.5 rounded-full bg-primary lg:-left-2"
            />
          )}
          <button
            type="button"
            aria-label={`Edit ${FIELD_LABEL[field]} for ${r.rep}${field === "confidence" ? `, ${r.confidence} percent` : ""}`}
            onClick={() => setEditing({ id: r.id, field })}
            className={cn(CELL_BUTTON, end && "justify-end")}
          >
            {render(r)}
          </button>
        </div>
      )
    }

  const columns: ColumnDef<typeof dataGridFeatures, PlanRow>[] = [
    {
      id: "rep",
      size: 220,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Rep" />
      ),
      meta: { headerClassName: cn("h-10", EDGE), cellClassName: EDGE },
      cell: text("rep", (r) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {r.rep}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="shrink-0 tabular-nums">{r.code}</span>
            <span
              aria-hidden
              className="size-1 shrink-0 rounded-full bg-input"
            />
            <span className="truncate">{r.owner}</span>
          </span>
        </div>
      )),
    },
    {
      id: "quota",
      size: 130,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Quota" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
        cellClassName: EDGE,
      },
      cell: text(
        "quota",
        (r) => (
          <span className="text-sm text-foreground tabular-nums">
            {money(r.quota)}
          </span>
        ),
        true
      ),
    },
    {
      id: "startsIn",
      size: 110,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Starts in" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
        cellClassName: EDGE,
      },
      cell: text(
        "startsIn",
        (r) => (
          <span className="text-sm text-foreground tabular-nums">
            {r.startsIn}d
          </span>
        ),
        true
      ),
    },
    {
      id: "confidence",
      size: 150,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Confidence" />
      ),
      meta: { headerClassName: "h-10", cellClassName: EDGE },
      cell: text("confidence", (r) => {
        const bar = confidenceBar(r.confidence)
        return (
          <span className="flex w-full items-center gap-2">
            <span
              aria-hidden
              className="grid h-1.5 min-w-16 flex-1 grid-cols-5 gap-1"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  // A meter's five fixed bars, which never reorder
                  key={i}
                  className={cn(
                    "rounded-full",
                    i < bar.filled ? bar.hue : "bg-muted"
                  )}
                />
              ))}
            </span>
            <span className="w-10 text-end text-sm text-foreground tabular-nums">
              {r.confidence}%
            </span>
          </span>
        )
      }),
    },
    {
      id: "status",
      size: 116,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      meta: { headerClassName: "h-10", cellClassName: EDGE },
      cell: ({ row }) => (
        <PickCell
          label={`Edit status for ${row.original.rep}`}
          value={row.original.status}
          options={PLAN_STATUSES}
          render={(s) => <StatusBadge status={s} />}
          onPick={(status) => update(row.original.id, { status })}
        />
      ),
    },
    {
      id: "risk",
      size: 108,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Risk" />
      ),
      meta: { headerClassName: "h-10", cellClassName: EDGE },
      cell: ({ row }) => (
        <PickCell
          label={`Edit risk for ${row.original.rep}`}
          value={row.original.risk}
          options={PLAN_RISKS}
          render={(r) => <RiskBadge risk={r} />}
          onPick={(risk) => update(row.original.id, { risk })}
        />
      ),
    },
    {
      id: "signedOff",
      size: 96,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Signed off" />
      ),
      meta: {
        headerClassName:
          "h-10 text-center! [&>div]:w-full [&>div]:justify-center",
        cellClassName: EDGE,
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Switch
            size="sm"
            aria-label={`Toggle sign-off for ${row.original.rep}`}
            checked={row.original.signedOff}
            onCheckedChange={(signedOff) =>
              update(row.original.id, { signedOff })
            }
          />
        </div>
      ),
    },
    {
      id: "actions",
      size: 56,
      header: () => <span className="sr-only">Actions</span>,
      meta: { headerClassName: cn("h-10", EDGE), cellClassName: EDGE },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.rep}`}
                />
              }
            >
              <EllipsisIcon aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    setRows((all) =>
                      duplicateRow(
                        all,
                        row.original.id,
                        `plan-copy-${++nextId.current}`
                      )
                    )
                  }
                >
                  <CopyIcon aria-hidden />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleting(row.original)}
                >
                  <Trash2Icon aria-hidden />
                  Delete
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
    getRowId: (r) => r.id,
    enableSorting: false,
  })

  return (
    <Frame>
      <FrameHeader className="flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <FrameTitle className="font-semibold">Quota Plan</FrameTitle>
          <FrameDescription className="text-xs">
            Next summer&apos;s quotas for the reps coming back, in serviced
            accounts.
          </FrameDescription>
        </div>
        <Button variant="outline" size="sm" onClick={addRep}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          Add rep
        </Button>
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="flex flex-col gap-3 border-b px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="h-7 w-full lg:w-80">
            <InputGroupAddon>
              <SearchIcon
                aria-hidden
                className="size-4 text-muted-foreground"
              />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search reps"
              placeholder="Search reps..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-md:text-base"
            />
          </InputGroup>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
            <FilterMenu
              label="Status"
              icon={<FunnelIcon aria-hidden data-icon="inline-start" />}
              options={PLAN_STATUSES}
              value={statuses}
              onChange={setStatuses}
              render={(s) => <StatusBadge status={s} />}
            />
            <FilterMenu
              label="Risk"
              icon={<Settings2Icon aria-hidden data-icon="inline-start" />}
              options={PLAN_RISKS}
              value={risks}
              onChange={setRisks}
              render={(r) => <RiskBadge risk={r} />}
            />
            {filtered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setStatuses([])
                  setRisks([])
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <DataGrid
          table={table}
          recordCount={shown.length}
          emptyMessage="No reps match this view."
          tableLayout={{ width: "fixed" }}
          tableClassNames={{ bodyRow: "[&>td]:h-14" }}
        >
          <DataGridContainer>
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
          </DataGridContainer>
        </DataGrid>
      </FramePanel>
      <FrameFooter className="flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {unsaved ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <InfoIcon aria-hidden className="size-4 text-primary" />
            {unsavedLabel(unsaved)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleCheckIcon aria-hidden className="size-4 text-success" />
            {unsavedLabel(0)}
          </span>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!unsaved}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={!unsaved}
            onClick={() => {
              onSave()
              // The toast says what was kept
              toast.add({
                type: "success",
                title: "Quota plan saved",
                description: `${unsavedLabel(unsaved).replace("unsaved ", "")} saved to next summer's plan.`,
              })
            }}
          >
            Save changes
          </Button>
        </div>
      </FrameFooter>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{" "}
              <span className="font-medium text-foreground">
                {deleting?.rep}
              </span>{" "}
              from the quota plan. It&apos;s gone once you save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                const gone = deleting!
                setRows((all) => all.filter((r) => r.id !== gone.id))
                setDeleting(null)
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Frame>
  )
}

const FIELD_LABEL: Record<PlanField, string> = {
  rep: "rep",
  quota: "quota",
  startsIn: "start",
  confidence: "confidence",
}

/** The in-place editor: Enter or leaving keeps the value (when it passes), Escape puts the old one back */
function CellEditor({
  label,
  initial,
  numeric,
  onCommit,
  onCancel,
}: {
  label: string
  initial: string
  numeric: boolean
  onCommit: (raw: string) => string | null
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const commit = () => setError(onCommit(value))
  return (
    <div className="relative">
      <Input
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        aria-label={label}
        aria-invalid={!!error}
        inputMode={numeric ? "decimal" : undefined}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError(null)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") onCancel()
        }}
        onBlur={commit}
        className={cn("h-7", numeric && "text-end tabular-nums")}
      />
      {error && (
        <p className="absolute top-full left-0 mt-0.5 text-[11px] whitespace-nowrap text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** A status or risk cell: its badge, and a list of the others to switch to */
function PickCell<T extends string>({
  label,
  value,
  options,
  render,
  onPick,
}: {
  label: string
  value: T
  options: readonly T[]
  render: (v: T) => React.ReactNode
  onPick: (v: T) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onPick(v)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          CELL_BUTTON,
          "h-9 justify-start border-0 bg-transparent py-0 pr-1.5 pl-1.5 dark:bg-transparent [&>svg:last-child]:hidden"
        )}
      >
        {render(value)}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {render(o)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/** Status or Risk: a menu of the values to keep, a count on the button once any are picked, and a reset */
function FilterMenu<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
  render,
}: {
  label: string
  icon: React.ReactNode
  options: readonly T[]
  value: T[]
  onChange: (v: T[]) => void
  render: (v: T) => React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {icon}
        {label}
        {value.length > 0 && (
          <Badge
            variant="secondary"
            className="h-4 min-w-4 rounded-sm px-1 text-[10px] tabular-nums"
          >
            {value.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o}
              checked={value.includes(o)}
              onCheckedChange={(on) =>
                onChange(on ? [...value, o] : value.filter((x) => x !== o))
              }
            >
              {render(o)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>
              Reset {label.toLowerCase()}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
