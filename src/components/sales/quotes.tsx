"use client"

import {
  type ColumnDef,
  type RowSelectionState,
  useTable,
} from "@tanstack/react-table"
import {
  Building2Icon,
  CircleDotIcon,
  EllipsisIcon,
  EyeIcon,
  FunnelXIcon,
  LayersIcon,
  PlusIcon,
  SendIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { FilterBar, type FilterBarField } from "@/components/shared/filter-bar"
import { PersonAvatar } from "@/components/shared/person-avatar"
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
import { Button, buttonVariants } from "@/components/ui/button"
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
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Frame,
  FrameDescription,
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
  BULK_OWNER,
  QUOTE_BULK_ACTIONS,
  QUOTE_OWNERS,
  QUOTE_PLANS,
  QUOTE_STATUSES,
  type Quote,
  type QuoteBulkAction,
  type QuoteStatus,
} from "@/data/quotes"
import { type FilterBarRule, passesFilters } from "@/lib/filter-bar"
import {
  applyBulk,
  bulkLine,
  canSend,
  quoteField,
  quoteSummary,
  sendQuote,
  validity,
  validitySortKey,
  withdrawQuote,
} from "@/lib/quotes"
import { cn } from "@/lib/utils"

import { BADGE, PlanBadge, STATUS_BADGE } from "./quote-badges"
import { QuoteSheet } from "./quote-sheet"
import { updateQuotes, useQuotes } from "./quotes-store"

/** Valid until's first line (its amber is a shade darker than the badge's, so it reads on white) */
const VALIDITY_INK = {
  destructive: "text-destructive",
  warning: "text-amber-700 dark:text-warning",
  default: "text-foreground",
  muted: "text-muted-foreground",
} as const
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const FIELDS: FilterBarField[] = [
  {
    id: "household",
    label: "Homeowner",
    icon: <Building2Icon aria-hidden />,
    type: "text",
    placeholder: "Search homeowners...",
  },
  {
    id: "status",
    label: "Status",
    icon: <CircleDotIcon aria-hidden />,
    type: "select",
    options: QUOTE_STATUSES,
    renderValue: (v) => (
      <Badge variant={STATUS_BADGE[v as QuoteStatus]} className={BADGE}>
        {v}
      </Badge>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    icon: <LayersIcon aria-hidden />,
    type: "select",
    options: QUOTE_PLANS,
  },
  {
    id: "owner",
    label: "Owner",
    icon: <UserIcon aria-hidden />,
    type: "select",
    options: QUOTE_OWNERS,
  },
]
/** The bar opens with an empty Homeowner search */
const STARTING_RULES: FilterBarRule[] = [
  {
    id: "household-search",
    field: "household",
    operator: "contains",
    values: [""],
  },
]

/** Sales → Quotes: the quote ledger with its filters, bulk bar, row actions and quote sheet */
export function Quotes() {
  const quotes = useQuotes()
  const { sent, expired } = quoteSummary(quotes)
  return (
    <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-3 text-foreground">
      <h1 className="sr-only">Quotes</h1>
      <section aria-label="Quotes">
        <Frame>
          <FrameHeader className="flex-row items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <FrameTitle className="text-sm font-semibold">Quotes</FrameTitle>
              <FrameDescription className="text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span>{sent} sent</span>
                  <span
                    aria-hidden
                    className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
                  />
                  <span>{expired} expired</span>
                </span>
              </FrameDescription>
            </div>
            <div className="shrink-0">
              <Link
                href="/quotes/new"
                className={buttonVariants({ size: "sm" })}
              >
                <PlusIcon aria-hidden data-icon="inline-start" />
                New quote
              </Link>
            </div>
          </FrameHeader>
          <Ledger quotes={quotes} />
        </Frame>
      </section>
    </div>
  )
}

/** Every sortable column's header */
const header: ColumnDef<typeof dataGridFeatures, Quote>["header"] = ({
  column,
}) => <DataGridColumnHeader column={column} />

function Ledger({ quotes }: { quotes: Quote[] }) {
  const [rules, setRules] = useState(STARTING_RULES)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [owner, setOwner] = useState(BULK_OWNER)
  const [action, setAction] = useState<QuoteBulkAction>("Send quote")
  const [viewing, setViewing] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<Quote | null>(null)
  // One array per change, or the grid takes each render for new data
  const rows = quotes.filter((q) => passesFilters(q, rules, quoteField))
  const picked = Object.keys(selection).filter((id) => selection[id])
  const viewed = quotes.find((q) => q.id === viewing) ?? null

  // Send puts it out again (an expired or withdrawn quote goes out with a new window)
  const send = (q: Quote) => {
    updateQuotes((all) => all.map((x) => (x.id === q.id ? sendQuote(x) : x)))
    toast.add({
      type: "success",
      title: "Quote queued",
      description: `Quote sent to ${q.household} for ${q.id}.`,
    })
  }

  // send only writes to the quotes store and toasts, so the columns can stay put
  const columns: ColumnDef<typeof dataGridFeatures, Quote>[] = [
    {
      id: "select",
      enableSorting: false,
      header: () => <DataGridTableRowSelectAll />,
      meta: { headerClassName: "ps-5! w-px", cellClassName: "ps-5! w-px" },
      cell: ({ row }) => (
        <>
          <div
            aria-hidden
            className="absolute inset-y-0 start-0 hidden w-[2px] bg-primary in-data-[state=selected]:block"
          />
          <DataGridTableRowSelect row={row} />
        </>
      ),
    },
    {
      id: "household",
      accessorFn: (q) => q.household.toLowerCase(),
      header,
      meta: { headerTitle: "Homeowner" },
      cell: ({ row: { original: q } }) => (
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={q.household} size="sm" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate font-medium text-foreground">
              {q.household}
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <PersonAvatar
                name={q.owner}
                className="size-4 [&_[data-slot=avatar-fallback]]:text-[8px]"
              />
              <span className="truncate">{q.owner}</span>
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
              />
              <span className="truncate">{q.address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "quote",
      accessorFn: (q) => q.id,
      header,
      meta: { headerTitle: "Quote" },
      cell: ({ row: { original: q } }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-foreground tabular-nums">
            {q.id}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {q.memo}
          </span>
        </div>
      ),
    },
    {
      id: "plan",
      accessorFn: (q) => q.plan,
      header,
      meta: { headerTitle: "Plan" },
      cell: ({ row }) => <PlanBadge plan={row.original.plan} />,
    },
    {
      id: "amount",
      accessorFn: (q) => q.amount,
      header,
      meta: { headerTitle: "Amount" },
      cell: ({ row: { original: q } }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-foreground tabular-nums">
            {USD.format(q.amount)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {q.dealId ?? "No deal"}
          </span>
        </div>
      ),
    },
    {
      id: "valid",
      accessorFn: validitySortKey,
      header,
      meta: { headerTitle: "Valid until" },
      cell: ({ row: { original: q } }) => {
        const v = validity(q)
        if (v.tone === "muted")
          return (
            <span className="text-sm text-muted-foreground">{v.label}</span>
          )
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn("font-medium tabular-nums", VALIDITY_INK[v.tone])}
            >
              {v.label}
            </span>
            {v.sub && (
              <span className="text-xs text-muted-foreground">{v.sub}</span>
            )}
          </div>
        )
      },
    },
    {
      id: "status",
      accessorFn: (q) => q.status,
      header,
      meta: { headerTitle: "Status" },
      cell: ({ row }) => (
        <Badge variant={STATUS_BADGE[row.original.status]} className={BADGE}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      meta: { headerClassName: "pe-5!", cellClassName: "pe-5!" },
      cell: ({ row: { original: q } }) => (
        // only stops the click, so the row doesn't open the quote under its menu
        <div
          role="presentation"
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${q.id}`}
                />
              }
            >
              <EllipsisIcon aria-hidden className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setViewing(q.id)}>
                  <EyeIcon aria-hidden className="size-4" />
                  View quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canSend(q)}
                  onClick={() => send(q)}
                >
                  <SendIcon aria-hidden className="size-4" />
                  Send quote
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={q.status === "Withdrawn"}
                  onClick={() => setWithdrawing(q)}
                >
                  <TriangleAlertIcon aria-hidden className="size-4" />
                  Withdraw quote
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
    data: rows,
    getRowId: (q) => q.id,
    enableRowSelection: true,
    sortDescFirst: false,
    autoResetPageIndex: false,
    state: { rowSelection: selection },
    onRowSelectionChange: setSelection,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  const filter = (next: FilterBarRule[]) => {
    setRules(next)
    table.setPageIndex(0)
  }
  const apply = () => {
    updateQuotes((all) => applyBulk(all, picked, owner, action))
    // The bulk bar reassigns the quotes and applies the action
    toast.add({
      type: "success",
      title: "Quotes updated",
      description: bulkLine(action, picked.length, owner),
    })
    setSelection({})
  }

  return (
    <FramePanel className="bg-card p-0! shadow-none!">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 max-md:basis-full">
          <FilterBar fields={FIELDS} rules={rules} onChange={filter} />
        </div>
        {rules.length > 0 && (
          <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="max-md:h-9"
              onClick={() => filter(STARTING_RULES)}
            >
              <FunnelXIcon
                aria-hidden
                data-icon="inline-start"
                className="size-3.5"
              />
              Clear
            </Button>
          </div>
        )}
      </div>
      {picked.length > 0 ? (
        <div className="flex flex-col gap-3 border-y bg-muted/30 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Badge variant="outline" className={BADGE}>
              {picked.length} selected
            </Badge>
            <span className="text-sm text-muted-foreground">
              Assign an owner or send these quotes.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Select value={owner} onValueChange={(v) => v && setOwner(v)}>
              <SelectTrigger
                aria-label="Assign owner"
                className="w-full sm:w-[190px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_OWNERS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={(v) => v && setAction(v)}>
              <SelectTrigger
                aria-label="Quote action"
                className="w-full sm:w-[190px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_BULK_ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelection({})}
            >
              Deselect
            </Button>
            <Button size="sm" onClick={apply}>
              Apply to quotes
            </Button>
          </div>
        </div>
      ) : (
        <Separator />
      )}
      <DataGrid
        table={table}
        recordCount={rows.length}
        onRowClick={(q) => setViewing(q.id)}
        emptyMessage="No quotes match this view. Clear filters to see the full ledger."
        tableLayout={{ dense: true, width: "auto" }}
        tableClassNames={{ bodyRow: "*:first:relative" }}
      >
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <Separator />
        <div className="px-5 py-3">
          <DataGridPagination sizes={[5, 10, 25]} />
        </div>
      </DataGrid>
      <QuoteSheet
        quote={viewed}
        onOpenChange={(open) => !open && setViewing(null)}
        onSend={send}
      />
      <AlertDialog
        open={!!withdrawing}
        onOpenChange={(o) => !o && setWithdrawing(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Withdraw {withdrawing?.id} for {withdrawing?.household}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Withdrawing stops follow-up on this{" "}
              <span className="font-medium text-foreground">
                {withdrawing && USD.format(withdrawing.amount)}
              </span>{" "}
              quote and removes it from the open pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep quote</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                const q = withdrawing!
                updateQuotes((all) =>
                  all.map((x) => (x.id === q.id ? withdrawQuote(x) : x))
                )
                toast.add({
                  type: "success",
                  title: "Quote withdrawn",
                  description: `${q.id} withdrawn from the open pipeline.`,
                })
                // The dialog closes once the quote is withdrawn
                setWithdrawing(null)
              }}
            >
              Withdraw quote
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FramePanel>
  )
}
