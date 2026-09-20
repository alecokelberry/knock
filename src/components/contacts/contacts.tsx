"use client"

import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import {
  AtSignIcon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  FunnelXIcon,
  GitBranchIcon,
  MapPinIcon,
  MessageSquareIcon,
  Trash2Icon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
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
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import { Item, ItemMedia } from "@/components/ui/item"
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
  type Contact,
  LIFECYCLES,
  type Lifecycle,
  OUTBOUND_LIST,
} from "@/data/contacts"
import { CONTACT_OWNER_IDS, memberName } from "@/data/team"
import type { Territory } from "@/data/territories"
import {
  assignOwner,
  contactField,
  directorySummary,
  startingRules,
  territoriesByName,
} from "@/lib/contacts"
import { type FilterBarRule, passesFilters } from "@/lib/filter-bar"

import { AddContactSheet } from "./add-contact-sheet"
import { ContactSheet } from "./contact-sheet"
import {
  logTextFor,
  updateContacts,
  useContacts,
  useTerritories,
} from "./contacts-store"
import {
  ActivityIcon,
  BADGE,
  Dot,
  LifecycleBadge,
  TerritoryIcon,
} from "./marks"

const OWNER_NAMES = CONTACT_OWNER_IDS.map(memberName)

/** Contacts → All Contacts: the homeowners with their filters (`?lifecycle=`, `?territory=`), bulk bar, row menu and sheets */
export function Contacts({
  lifecycle,
  territory,
}: {
  lifecycle?: string
  territory?: string
}) {
  const contacts = useContacts()
  const territories = useTerritories()
  const summary = directorySummary(contacts, territories)
  const [adding, setAdding] = useState(false)
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="sr-only">Homeowners</h1>
      <Frame spacing="sm">
        <FrameHeader className="flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <FrameTitle className="text-sm font-semibold text-balance">
              Contacts
            </FrameTitle>
            <FrameDescription className="flex items-center gap-1.5 text-xs text-pretty">
              <span>{summary.contacts} homeowners</span>
              <Dot />
              <span>{summary.territories} territories</span>
            </FrameDescription>
          </div>
          <Button size="sm" onClick={() => setAdding(true)}>
            <UserPlusIcon aria-hidden />
            Add Contact
          </Button>
        </FrameHeader>
        {/* A new ?lifecycle= or ?territory= starts the table again on that rule */}
        <Directory
          key={`${lifecycle ?? ""}|${territory ?? ""}`}
          contacts={contacts}
          territories={territories}
          lifecycle={lifecycle}
          territory={territory}
        />
      </Frame>
      <AddContactSheet open={adding} onOpenChange={setAdding} />
    </div>
  )
}

/** Every sortable column's header */
const header: ColumnDef<typeof dataGridFeatures, Contact>["header"] = ({
  column,
}) => <DataGridColumnHeader column={column} />

function Directory({
  contacts,
  territories,
  lifecycle,
  territory,
}: {
  contacts: Contact[]
  territories: Territory[]
  lifecycle?: string
  territory?: string
}) {
  const router = useRouter()
  const first = startingRules(lifecycle, territory)
  const [rules, setRules] = useState(first)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ])
  const [owner, setOwner] = useState(CONTACT_OWNER_IDS[0]!)
  const [viewing, setViewing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const names = territoriesByName(territories).map((t) => t.name)
  const icons = Object.fromEntries(territories.map((t) => [t.id, t.icon]))
  const fields: FilterBarField[] = [
    {
      id: "name",
      label: "Name",
      icon: <UserIcon aria-hidden />,
      type: "text",
      placeholder: "Search homeowners...",
    },
    {
      id: "email",
      label: "Email",
      icon: <AtSignIcon aria-hidden />,
      type: "text",
    },
    {
      id: "territory",
      label: "Territory",
      icon: <MapPinIcon aria-hidden />,
      type: "select",
      options: names,
    },
    {
      id: "owner",
      label: "Owner",
      icon: <UserIcon aria-hidden />,
      type: "select",
      options: OWNER_NAMES,
    },
    {
      id: "lifecycle",
      label: "Lifecycle",
      icon: <GitBranchIcon aria-hidden />,
      type: "select",
      options: LIFECYCLES,
      renderValue: (v) => <LifecycleBadge lifecycle={v as Lifecycle} />,
    },
  ]
  // Rows in id order: what a column sorts from, and what shows with no sort. One array per change,
  // or the grid takes each render for new data and resets its pages.
  const rows = contacts
    .filter((c) => passesFilters(c, rules, contactField))
    .toSorted((a, b) => a.id - b.id)
  const picked = Object.keys(selection)
    .filter((id) => selection[id])
    .map(Number)
  const viewed = contacts.find((c) => c.id === viewing) ?? null

  const columns: ColumnDef<typeof dataGridFeatures, Contact>[] = [
    {
      id: "select",
      enableSorting: false,
      size: 40,
      header: () => <DataGridTableRowSelectAll />,
      meta: {
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <div
            aria-hidden
            className="absolute inset-y-0 start-0 hidden w-[2px] bg-primary in-data-[state=selected]:block"
          />
          <DataGridTableRowSelect row={row} />
        </div>
      ),
    },
    {
      id: "name",
      accessorFn: (c) => c.name,
      header,
      size: 220,
      meta: { headerTitle: "Name" },
      cell: ({ row: { original: c } }) => (
        <div className="flex items-center gap-2">
          <PersonAvatar name={c.name} className="shrink-0" />
          <div className="min-w-0">
            {/* The row opens the contact too; the link is there for the keyboard and a new tab */}
            <Link
              href={`/contacts/${c.id}`}
              onClick={(e) => e.stopPropagation()}
              className="line-clamp-1 font-medium text-foreground hover:underline"
            >
              {c.name}
            </Link>
            <div
              className="line-clamp-1 text-xs text-muted-foreground"
              title={c.email}
            >
              {c.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "territory",
      accessorFn: (c) => c.territory,
      header,
      size: 180,
      meta: { headerTitle: "Territory" },
      cell: ({ row: { original: c } }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Item
            variant="outline"
            size="xs"
            className="size-7 shrink-0 justify-center p-0 text-foreground"
          >
            <ItemMedia variant="icon" className="size-auto">
              <TerritoryIcon
                icon={icons[c.territoryId] ?? "map-pin"}
                className="size-4"
              />
            </ItemMedia>
          </Item>
          <span className="min-w-0 truncate font-medium text-foreground">
            {c.territory}
          </span>
        </div>
      ),
    },
    {
      id: "owner",
      accessorFn: (c) => memberName(c.ownerId),
      header,
      size: 160,
      meta: { headerTitle: "Owner" },
      cell: ({ row: { original: c } }) => (
        <div className="flex min-w-0 items-center gap-2">
          <PersonAvatar
            name={memberName(c.ownerId)}
            size="sm"
            className="shrink-0"
          />
          <span className="min-w-0 truncate text-sm text-foreground">
            {memberName(c.ownerId)}
          </span>
        </div>
      ),
    },
    {
      id: "lifecycle",
      accessorFn: (c) => c.lifecycle,
      header,
      size: 130,
      meta: { headerTitle: "Lifecycle" },
      cell: ({ row }) => <LifecycleBadge lifecycle={row.original.lifecycle} />,
    },
    {
      id: "activity",
      enableSorting: false,
      header,
      size: 150,
      meta: { headerTitle: "Last Activity" },
      cell: ({ row: { original: c } }) => (
        <div className="flex items-center gap-1.5">
          <ActivityIcon icon={c.lastActivity.icon} />
          <span className="text-sm text-muted-foreground">
            {c.lastActivity.when}
          </span>
        </div>
      ),
    },
    {
      id: "deals",
      accessorFn: (c) => c.openDeals.amount,
      header,
      size: 110,
      meta: { headerTitle: "Open Deals" },
      cell: ({ row: { original: c } }) =>
        c.openDeals.count ? (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {c.openDeals.short}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {c.openDeals.count} open
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No deals</span>
        ),
    },
    {
      id: "actions",
      enableSorting: false,
      size: 60,
      header: () => <span className="sr-only">Actions</span>,
      meta: {
        headerClassName: "pe-(--frame-panel-header-px)",
        cellClassName: "pe-(--frame-panel-px)",
      },
      cell: ({ row: { original: c } }) => (
        // only stops the click, so the row doesn't open the contact under its menu
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
                  aria-label={`Actions for ${c.name}`}
                />
              }
            >
              <EllipsisIcon aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setViewing(c.id)}>
                  <EyeIcon aria-hidden />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logTextFor(c)}>
                  <MessageSquareIcon aria-hidden />
                  Log Text
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard.writeText(c.email).catch(() => {})
                    toast.add({
                      type: "success",
                      title: "Email copied",
                      description: c.email,
                    })
                  }}
                >
                  <CopyIcon aria-hidden />
                  Copy Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleting(c)}
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
    data: rows,
    getRowId: (c) => String(c.id),
    enableRowSelection: true,
    sortDescFirst: false,
    autoResetPageIndex: false,
    state: { rowSelection: selection, sorting },
    onRowSelectionChange: setSelection,
    onSortingChange: setSorting,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  const filter = (next: FilterBarRule[]) => {
    setRules(next)
    table.setPageIndex(0)
  }
  const addToList = () => {
    toast.add({
      type: "success",
      title: "Added to list",
      description: `${picked.length} ${picked.length === 1 ? "homeowner" : "homeowners"} added to ${OUTBOUND_LIST}.`,
    })
    setSelection({})
  }
  const assign = () => {
    updateContacts((all) => assignOwner(all, picked, owner))
    toast.add({
      type: "success",
      title: "Owner assigned",
      description: `${memberName(owner)} now owns ${picked.length} ${picked.length === 1 ? "homeowner" : "homeowners"}.`,
    })
    setSelection({})
  }

  return (
    <FramePanel className="p-0 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
        <FilterBar fields={fields} rules={rules} onChange={filter} />
        {rules.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => filter(startingRules())}
          >
            <FunnelXIcon aria-hidden className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
      {picked.length > 0 ? (
        <div className="flex flex-col gap-3 border-y bg-muted/30 px-(--frame-panel-header-px) py-(--frame-panel-header-py) lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="primary-light" className={BADGE}>
              Group actions
            </Badge>
            <Badge variant="outline" className={BADGE}>
              {picked.length} selected
            </Badge>
            <span className="text-sm text-muted-foreground">
              Assign an owner or add to a list.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Select value={owner} onValueChange={(v) => v && setOwner(v)}>
              <SelectTrigger
                aria-label="Assign owner"
                className="w-full sm:w-[190px]"
              >
                <SelectValue>{(v: string) => memberName(v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CONTACT_OWNER_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {memberName(id)}
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
            <Button variant="outline" size="sm" onClick={addToList}>
              Add to list
            </Button>
            <Button size="sm" onClick={assign}>
              Assign owner
            </Button>
          </div>
        </div>
      ) : (
        <Separator />
      )}
      <DataGrid
        table={table}
        recordCount={rows.length}
        onRowClick={(c) => router.push(`/contacts/${c.id}`)}
        emptyMessage="No homeowners match these filters."
        tableLayout={{ dense: true, width: "fixed" }}
        tableClassNames={{ bodyRow: "*:first:relative" }}
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
      <ContactSheet
        contact={viewed}
        onOpenChange={(open) => !open && setViewing(null)}
      />
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {deleting?.name}
              </span>{" "}
              from {deleting?.territory}. A reload brings them back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                const c = deleting!
                // Out of the directory for the visit
                updateContacts((all) => all.filter((x) => x.id !== c.id))
                setSelection((s) => ({ ...s, [c.id]: false }))
                toast.add({
                  type: "success",
                  title: "Delete requested",
                  description: `${c.name} removed from ${c.territory}.`,
                })
                setDeleting(null)
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FramePanel>
  )
}
