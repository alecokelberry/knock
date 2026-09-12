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
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { useRef, useState } from "react"

import { ProductAddSheet } from "@/components/sales/product-add-sheet"
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
  contractValue,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCTS,
  type Product,
  type ProductStatus,
} from "@/data/products"
import { downloadCsv } from "@/lib/csv"
import {
  duplicateProduct,
  filterProducts,
  importProducts,
  isDirty,
  money,
  newProduct,
  type ProductField,
  type ProductForm,
  parseProductField,
  productLine,
  productsCsv,
  unsavedCount,
  unsavedLabel,
} from "@/lib/products"
import { cn } from "@/lib/utils"

const STATUS_BADGE: Record<
  ProductStatus,
  "success-light" | "warning-light" | "destructive-light"
> = {
  Active: "success-light",
  Draft: "warning-light",
  Archived: "destructive-light",
}
/** Every cell's padding: tighter first and last columns */
const EDGE = "first:ps-3 last:pe-3 lg:first:ps-4 lg:last:pe-4"
/** A cell that edits on click: flush with the cell, a tint on hover */
const CELL_BUTTON =
  "-mx-1.5 flex h-8 w-[calc(100%+0.75rem)] items-center px-1.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset"
const FIELD_LABEL: Record<ProductField, string> = {
  name: "name",
  initial: "initial service",
  price: "recurring price",
  charges: "charges a year",
}

const StatusBadge = ({ status }: { status: ProductStatus }) => (
  <Badge
    variant={STATUS_BADGE[status]}
    className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
  >
    {status}
  </Badge>
)

/** Pipeline → Products: Ridgeline's plans and one-time services, edited in place and saved together */
export function Products() {
  const [saved, setSaved] = useState(PRODUCTS)
  const [rows, setRows] = useState(PRODUCTS)
  const [adding, setAdding] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  // Ids for new and copied rows, and the NEW-0001… SKUs a product added without one gets
  const ids = useRef({ id: 0, sku: 0 })
  const nextId = () => `product-new-${++ids.current.id}`
  const nextSeq = () => ++ids.current.sku
  const unsaved = unsavedCount(saved, rows)

  const create = (form: ProductForm) => {
    const product = newProduct(form, nextId(), nextSeq())
    setRows((all) => [product, ...all])
    toast.add({
      type: "success",
      title: "Product added",
      description: productLine(product),
    })
  }
  const importFile = async (f: File) => {
    const result = importProducts(rows, await f.text(), nextId, nextSeq)
    if (!result.added && !result.updated) {
      toast.add({
        type: "error",
        title: "Nothing to import",
        description: `${f.name} has no product rows. Use Export's columns.`,
      })
      return
    }
    setRows(result.rows)
    toast.add({
      type: "success",
      title: "Products imported",
      description: `${[
        result.added && `${result.added} added`,
        result.updated && `${result.updated} updated`,
      ]
        .filter(Boolean)
        .join(", ")}. Save to keep them.`,
    })
  }

  return (
    <>
      <CrumbHeader page="Products">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            // Import offers the file picker and merges the CSV by SKU
            toast.add({
              type: "info",
              title: "Import products",
              description: "Upload a CSV to add or update catalog rows.",
              actionProps: {
                children: "Upload",
                onClick: () => file.current?.click(),
              },
            })
          }
        >
          <UploadIcon aria-hidden className="size-4" />
          Import
        </Button>
        <input
          ref={file}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ""
            if (f) void importFile(f)
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            // Export offers the file, and downloads it only when asked
            toast.add({
              type: "success",
              title: "Export ready",
              description: "Product catalog CSV is prepared.",
              actionProps: {
                children: "Download",
                onClick: () => downloadCsv("products.csv", productsCsv(rows)),
              },
            })
          }
        >
          <DownloadIcon aria-hidden className="size-4" />
          Export
        </Button>
      </CrumbHeader>
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-3 text-foreground">
        <h1 className="sr-only">Products</h1>
        <section aria-label="Product catalog">
          <Catalog
            saved={saved}
            rows={rows}
            setRows={setRows}
            unsaved={unsaved}
            nextId={nextId}
            onAdd={() => setAdding(true)}
            onDiscard={() => setRows(saved)}
            onSave={() => {
              setSaved(rows)
              // The toast says what was kept
              toast.add({
                type: "success",
                title: "Catalog saved",
                description: `${unsavedLabel(unsaved).replace("unsaved ", "")} saved to the catalog.`,
              })
            }}
          />
        </section>
      </div>
      <ProductAddSheet
        open={adding}
        onOpenChange={setAdding}
        onCreate={create}
      />
    </>
  )
}

type CatalogProps = {
  saved: Product[]
  rows: Product[]
  setRows: React.Dispatch<React.SetStateAction<Product[]>>
  unsaved: number
  nextId: () => string
  onAdd: () => void
  onDiscard: () => void
  onSave: () => void
}

function Catalog({
  saved,
  rows,
  setRows,
  unsaved,
  nextId,
  onAdd,
  onDiscard,
  onSave,
}: CatalogProps) {
  const [query, setQuery] = useState("")
  const [statuses, setStatuses] = useState<ProductStatus[]>([])
  const [editing, setEditing] = useState<{
    id: string
    field: ProductField
  } | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  // One array per change, or the grid takes each render for new data
  const shown = filterProducts(rows, query, statuses)
  const filtered = !!query.trim() || statuses.length > 0
  const update = (id: string, patch: Partial<Product>) =>
    setRows((all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const text =
    (
      field: ProductField,
      render: (r: Product) => React.ReactNode,
      end = false
    ): ColumnDef<typeof dataGridFeatures, Product>["cell"] =>
    ({ row }) => {
      const r = row.original
      if (editing?.id === r.id && editing.field === field)
        return (
          <CellEditor
            label={`Edit ${FIELD_LABEL[field]} for ${r.name}`}
            initial={String(r[field])}
            numeric={field !== "name"}
            onCommit={(raw) => {
              const parsed = parseProductField(field, raw)
              if (parsed && "error" in parsed) return parsed.error
              if (parsed) update(r.id, { [field]: parsed.value })
              setEditing(null)
              return null
            }}
            onCancel={() => setEditing(null)}
          />
        )
      return (
        <div className="relative flex min-w-0 items-center">
          {field === "name" && isDirty(saved, r) && (
            <span
              aria-hidden
              className="absolute top-1 bottom-1 -left-1.5 w-0.5 rounded-full bg-primary lg:-left-2"
            />
          )}
          <button
            type="button"
            aria-label={`Edit ${FIELD_LABEL[field]} for ${r.name}`}
            onClick={() => setEditing({ id: r.id, field })}
            className={cn(CELL_BUTTON, "cursor-text", end && "justify-end")}
          >
            {render(r)}
          </button>
        </div>
      )
    }

  const columns: ColumnDef<typeof dataGridFeatures, Product>[] = [
    {
      id: "name",
      size: 240,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Product" />
      ),
      meta: { headerClassName: cn("h-10", EDGE), cellClassName: EDGE },
      cell: text("name", (r) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {r.name}
          </span>
          <span className="truncate text-xs text-muted-foreground tabular-nums">
            {r.sku}
          </span>
        </div>
      )),
    },
    {
      id: "category",
      size: 170,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Category" />
      ),
      meta: { headerClassName: "h-10" },
      cell: ({ row }) => (
        <PickCell
          label={`Edit category for ${row.original.name}`}
          value={row.original.category}
          options={PRODUCT_CATEGORIES}
          render={(c) => (
            <span className="truncate text-sm text-foreground">{c}</span>
          )}
          onPick={(category) => update(row.original.id, { category })}
        />
      ),
    },
    {
      id: "initial",
      size: 120,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Initial" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
      },
      cell: text(
        "initial",
        (r) => (
          <span className="text-sm text-foreground tabular-nums">
            {money(r.initial)}
          </span>
        ),
        true
      ),
    },
    {
      id: "price",
      size: 120,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Recurring" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
      },
      cell: text(
        "price",
        (r) => (
          <span className="text-sm text-foreground tabular-nums">
            {money(r.price)}
          </span>
        ),
        true
      ),
    },
    {
      id: "charges",
      size: 110,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Per year" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
      },
      cell: text(
        "charges",
        (r) => (
          <span className="text-sm text-foreground tabular-nums">
            {r.charges}
          </span>
        ),
        true
      ),
    },
    {
      id: "firstYear",
      size: 120,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="First year" />
      ),
      meta: {
        headerClassName: "h-10 text-end! [&>div]:w-full [&>div]:justify-end",
        cellClassName: "text-end",
      },
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground tabular-nums">
          {money(contractValue(row.original))}
        </span>
      ),
    },
    {
      id: "status",
      size: 130,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      meta: { headerClassName: "h-10" },
      cell: ({ row }) => (
        <PickCell
          label={`Edit status for ${row.original.name}`}
          value={row.original.status}
          options={PRODUCT_STATUSES}
          render={(s) => <StatusBadge status={s} />}
          onPick={(status) => update(row.original.id, { status })}
        />
      ),
    },
    {
      id: "quotable",
      size: 96,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Quotable" />
      ),
      meta: {
        headerClassName:
          "h-10 text-center! [&>div]:w-full [&>div]:justify-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Switch
            size="sm"
            aria-label={`Toggle quotable for ${row.original.name}`}
            checked={row.original.quotable}
            onCheckedChange={(quotable) =>
              update(row.original.id, { quotable })
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
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <EllipsisIcon aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    setRows((all) =>
                      duplicateProduct(all, row.original.id, nextId())
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
      <FrameHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <FrameTitle className="font-semibold">Products</FrameTitle>
          <FrameDescription>
            What reps can put on a quote. Edit pricing inline.
          </FrameDescription>
        </div>
        <Button size="sm" onClick={onAdd}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          Add product
        </Button>
      </FrameHeader>
      <FramePanel className="p-0! shadow-none!">
        <div className="flex flex-col gap-3 border-b px-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <InputGroup className="h-7 w-full min-w-0 lg:max-w-xs">
            <InputGroupAddon>
              <SearchIcon
                aria-hidden
                className="size-4 text-muted-foreground"
              />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search products"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-md:text-base"
            />
          </InputGroup>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
            <StatusMenu value={statuses} onChange={setStatuses} />
            {filtered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setStatuses([])
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
          emptyMessage="No products match this view."
          tableLayout={{ width: "fixed" }}
          tableClassNames={{ bodyRow: "[&>td]:h-12" }}
        >
          <DataGridContainer>
            <DataGridScrollArea>
              <DataGridTable />
            </DataGridScrollArea>
          </DataGridContainer>
        </DataGrid>
      </FramePanel>
      <FrameFooter className="flex-row items-center justify-between gap-3">
        {unsaved ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <InfoIcon aria-hidden className="size-4 shrink-0 text-primary" />
            {unsavedLabel(unsaved)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleCheckIcon
              aria-hidden
              className="size-4 shrink-0 text-success"
            />
            {unsavedLabel(0)}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!unsaved}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button size="sm" disabled={!unsaved} onClick={onSave}>
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
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{" "}
              <span className="font-medium text-foreground">
                {deleting?.name}
              </span>{" "}
              from the catalog. It&apos;s gone once you save.
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

/** A category or status cell: its value, and a list of the others to switch to */
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
          "h-8 cursor-pointer justify-start rounded-none border-0 bg-transparent py-0 pr-1.5 pl-1.5 dark:bg-transparent [&>svg:last-child]:hidden"
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

/** Status: a menu of the statuses to keep, a count on the button once any are picked, and a reset */
function StatusMenu({
  value,
  onChange,
}: {
  value: ProductStatus[]
  onChange: (v: ProductStatus[]) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <FunnelIcon aria-hidden data-icon="inline-start" />
        Status
        {value.length > 0 && (
          <Badge
            variant="secondary"
            className="h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs tabular-nums"
          >
            {value.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {PRODUCT_STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={value.includes(s)}
              onCheckedChange={(on) =>
                onChange(on ? [...value, s] : value.filter((x) => x !== s))
              }
            >
              <StatusBadge status={s} />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>
              Reset status
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
