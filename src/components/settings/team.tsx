"use client"

import { type ColumnDef, useTable } from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  EyeIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"
import { useRef, useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { CrumbHeader } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import {
  AlertDialog,
  AlertDialogAction,
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
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/ui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Frame, FramePanel } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import {
  AUTHENTICATIONS,
  type Authentication,
  BILLING_STATUSES,
  MEMBER_ROLES,
  TEAM_MEMBERS,
  type TeamMember,
} from "@/data/team"
import { isoDate } from "@/lib/dates"
import { isEmail } from "@/lib/settings"
import {
  addMembers,
  filterCount,
  inviteCountLine,
  type MemberFilters,
  matchesFilters,
  matchesSearch,
  NO_FILTERS,
  newMember,
  parseMemberCsv,
  splitEmails,
} from "@/lib/team"
import { cn } from "@/lib/utils"

const BADGE = "h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
const FILTER_TABS = [
  { key: "role", label: "Role", options: MEMBER_ROLES },
  { key: "billing", label: "Billing", options: BILLING_STATUSES },
  { key: "auth", label: "Auth", options: AUTHENTICATIONS },
] as const

/** Settings → Team members: the members table with search, filters, invites and import */
export function TeamMembers() {
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS)
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<MemberFilters>(NO_FILTERS)
  const [adding, setAdding] = useState(false)
  // The member a row's View or Edit opened, and which; the one Delete asks about
  // (the row buttons show on hover, and always on touch screens, which can't hover)
  const [open, setOpen] = useState<{ id: string; editing: boolean } | null>(
    null
  )
  const [deleting, setDeleting] = useState<TeamMember | null>(null)
  const file = useRef<HTMLInputElement>(null)

  const rows = team.filter(
    (m) => matchesSearch(m, query) && matchesFilters(m, filters)
  )
  const columns: ColumnDef<typeof dataGridFeatures, TeamMember>[] = [
    {
      id: "member",
      accessorKey: "name",
      header: ({ column }) => <SortHead column={column} label="Member" />,
      size: 255,
      meta: {
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex min-w-0 items-center gap-2">
            <PersonAvatar name={m.name} className="size-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.name}</div>
              <div className="truncate text-sm text-muted-foreground">
                {m.username}
              </div>
            </div>
            <div className="pointer-events-none flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within/member-row:pointer-events-auto group-focus-within/member-row:opacity-100 group-hover/member-row:pointer-events-auto group-hover/member-row:opacity-100 pointer-coarse:pointer-events-auto pointer-coarse:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`View ${m.name}`}
                onClick={() => setOpen({ id: m.id, editing: false })}
              >
                <EyeIcon aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${m.name}`}
                onClick={() => setOpen({ id: m.id, editing: true })}
              >
                <PencilIcon aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${m.name}`}
                onClick={() => setDeleting(m)}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortHead column={column} label="Email" />,
      size: 220,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="block truncate text-sm transition-colors hover:text-primary hover:underline"
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <SortHead column={column} label="Role" />,
      size: 120,
      cell: ({ row }) => (
        <span className="block truncate text-sm">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "billingStatus",
      header: ({ column }) => (
        <SortHead column={column} label="Billing status" />
      ),
      size: 150,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              row.original.billingDot
            )}
          />
          <span className="truncate text-sm">{row.original.billingStatus}</span>
        </div>
      ),
    },
    {
      accessorKey: "authentication",
      header: ({ column }) => (
        <SortHead column={column} label="Authentication" />
      ),
      size: 130,
      cell: ({ row }) => (
        <span className="block truncate text-sm">
          {row.original.authentication}
        </span>
      ),
    },
    {
      id: "joined",
      // Sorts by the day, not the printed text
      accessorFn: (m) => m.joinedISO,
      header: ({ column }) => <SortHead column={column} label="Joining date" />,
      size: 130,
      meta: {
        headerClassName: "pe-(--frame-panel-header-px)",
        cellClassName: "pe-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <span className="block truncate text-sm text-muted-foreground tabular-nums">
          {row.original.joined}
        </span>
      ),
    },
  ]
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (m) => m.id,
    sortDescFirst: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
      sorting: [{ id: "member", desc: false }],
    },
  })

  const narrow = (f: MemberFilters) => {
    setFilters(f)
    table.setPageIndex(0)
  }
  const toggle = (key: keyof MemberFilters, value: string, on: boolean) =>
    narrow({
      ...filters,
      [key]: on
        ? [...filters[key], value]
        : filters[key].filter((v) => v !== value),
    })
  const count = filterCount(filters)

  // Import reads a CSV of members (email, name, role, authentication, billing status)
  const importCsv = async (f: File | undefined) => {
    if (!f) return
    const { members, skipped } = parseMemberCsv(
      await f.text(),
      isoDate(new Date())
    )
    const { team: next, added } = addMembers(team, members)
    setTeam(next)
    const passed = members.length - added.length + skipped
    if (added.length)
      toast.add({
        type: "success",
        title: "Members imported",
        description: `${added.length} added${passed ? `, ${passed} skipped` : ""}.`,
      })
    else
      toast.add({
        type: "error",
        title: "Nothing to import",
        description:
          "The file needs an email column with new, valid addresses.",
      })
  }
  const viewed = open ? team.find((m) => m.id === open.id) : undefined

  return (
    <>
      <CrumbHeader page="Team Members" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Team members</h1>
        <section aria-label="Team members">
          <Frame>
            <FramePanel className="p-0!">
              <div className="flex w-full flex-col">
                <div className="flex flex-col gap-4 px-(--frame-panel-header-px) py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <h2 className="truncate text-2xl font-semibold tracking-tight">
                      Members
                    </h2>
                    <Badge
                      variant="outline"
                      className="h-5 min-w-5 gap-1 rounded-full px-1.25 py-0.5 text-xs dark:bg-input/32"
                    >
                      {team.length}
                    </Badge>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:ml-auto lg:w-auto lg:flex-nowrap lg:justify-end">
                    <InputGroup className="h-7 w-full sm:w-64">
                      <InputGroupAddon>
                        <SearchIcon aria-hidden />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label="Search members"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          table.setPageIndex(0)
                        }}
                        className="max-md:text-base"
                      />
                    </InputGroup>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Filter members"
                          />
                        }
                      >
                        Filters
                        {count > 0 && (
                          <Badge variant="secondary" className={BADGE}>
                            {count}
                          </Badge>
                        )}
                        <ChevronDownIcon aria-hidden data-icon="inline-end" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60">
                        <Tabs defaultValue="role" className="w-full gap-2">
                          <div className="p-1">
                            <TabsList className="w-full">
                              {FILTER_TABS.map((t) => (
                                <TabsTrigger key={t.key} value={t.key}>
                                  {t.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </div>
                          {FILTER_TABS.map((t) => (
                            <TabsContent
                              key={t.key}
                              value={t.key}
                              className="m-0 px-0.5 pb-1"
                            >
                              <DropdownMenuGroup>
                                {t.options.map((o) => (
                                  <DropdownMenuCheckboxItem
                                    key={o}
                                    checked={filters[t.key].includes(o)}
                                    onCheckedChange={(on) =>
                                      toggle(t.key, o, on)
                                    }
                                    closeOnClick={false}
                                  >
                                    {o}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuGroup>
                            </TabsContent>
                          ))}
                        </Tabs>
                        {count > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => narrow(NO_FILTERS)}
                            >
                              Reset filters
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.add({
                          type: "info",
                          title: "Import members",
                          description:
                            "Upload a CSV with an email column; name, role and authentication are read when present.",
                          actionProps: {
                            children: "Upload",
                            onClick: () => file.current?.click(),
                          },
                        })
                      }
                    >
                      Import
                    </Button>
                    <input
                      ref={file}
                      type="file"
                      accept=".csv,text/csv"
                      hidden
                      onChange={(e) =>
                        void importCsv(e.target.files?.[0]).finally(
                          () => (e.target.value = "")
                        )
                      }
                    />
                    <Button size="sm" onClick={() => setAdding(true)}>
                      Add member
                    </Button>
                  </div>
                </div>
                <Separator />
                <DataGrid
                  table={table}
                  recordCount={rows.length}
                  emptyMessage="No members match this search or filter."
                  tableLayout={{ dense: true, width: "fixed" }}
                  tableClassNames={{ bodyRow: "group/member-row" }}
                >
                  <DataGridContainer className="rounded-none border-0">
                    <DataGridScrollArea>
                      <DataGridTable />
                    </DataGridScrollArea>
                  </DataGridContainer>
                  <Separator />
                  <div className="px-(--frame-panel-px) py-3">
                    <DataGridPagination
                      sizes={[5, 10, 25]}
                      info="{from} - {to} of {count} members"
                    />
                  </div>
                </DataGrid>
              </div>
            </FramePanel>
          </Frame>
        </section>
      </div>
      <AddMemberSheet
        open={adding}
        onOpenChange={setAdding}
        onInvite={(members) => {
          const { team: next, added } = addMembers(team, members)
          setTeam(next)
          setAdding(false)
          return added.length
        }}
      />
      <MemberSheet
        member={viewed}
        editing={!!open?.editing}
        onEdit={() => open && setOpen({ ...open, editing: true })}
        onOpenChange={(o) => !o && setOpen(null)}
        onSave={(patch) => {
          setTeam((all) =>
            all.map((m) => (m.id === open?.id ? { ...m, ...patch } : m))
          )
          setOpen(null)
          toast.add({
            type: "success",
            title: "Member updated",
            description: `${viewed?.name} is now ${patch.role} using ${patch.authentication}.`,
          })
        }}
      />
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access to the workspace at once, and their seat frees up
              on the next invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!deleting) return
                setTeam((all) => all.filter((m) => m.id !== deleting.id))
                toast.add({
                  type: "success",
                  title: "Member removed",
                  description: `${deleting.name} no longer has access.`,
                })
                setDeleting(null)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** The sortable header: the label and an arrow for the way it sorts (up and down arrows while unsorted) */
function SortHead({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
    clearSorting: () => void
  }
  label: string
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ChevronsUpDownIcon
  // Asc, then desc, then off
  const next = () =>
    sorted === "asc"
      ? column.toggleSorting(true)
      : sorted === "desc"
        ? column.clearSorting()
        : column.toggleSorting(false)
  return (
    <div className="-ms-2 flex h-full items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={next}
        className="h-6 gap-1.5 rounded-lg px-2 text-sm font-normal text-secondary-foreground/80 hover:bg-secondary hover:text-foreground"
      >
        {label}
        {sorted && (
          <span className="sr-only">
            , sorted {sorted === "asc" ? "ascending" : "descending"}
          </span>
        )}
        <Icon aria-hidden className={cn("size-3.25", !sorted && "mt-px")} />
      </Button>
    </div>
  )
}

/** The Add member sheet: addresses as chips (Enter or comma), role, sign-in method, and the invite email switch */
function AddMemberSheet({
  open,
  onOpenChange,
  onInvite,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onInvite: (members: TeamMember[]) => number
}) {
  const [emails, setEmails] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [role, setRole] = useState<string>("Admin")
  const [auth, setAuth] = useState<Authentication>("SSO")
  const [sendEmail, setSendEmail] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reset = () => {
    setEmails([])
    setDraft("")
    setRole("Admin")
    setAuth("SSO")
    setSendEmail(true)
    setError(null)
  }
  /** Moves what's typed into chips; false when some of it isn't an address */
  const commit = (typed = draft) => {
    const parts = splitEmails(typed)
    const bad = parts.filter((p) => !isEmail(p))
    setEmails((all) => [
      ...all,
      ...parts.filter((p) => isEmail(p) && !all.includes(p)),
    ])
    setDraft(bad.join(", "))
    setError(bad.length ? "Enter a valid email address" : null)
    return !bad.length
  }
  const send = () => {
    const parts = splitEmails(draft)
    const all = [
      ...emails,
      ...parts.filter((p) => isEmail(p) && !emails.includes(p)),
    ]
    if (!commit()) return
    if (!all.length) return setError("Enter an email address")
    const today = isoDate(new Date())
    // Each new address joins the team
    const added = onInvite(all.map((e) => newMember(e, role, auth, today)))
    toast.add({
      type: "success",
      title: "Invites sent",
      description: `${added} invited as ${role}${sendEmail ? "" : ", without an email"}`,
    })
    reset()
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Add member
          </SheetTitle>
          <SheetDescription>
            Invite teammates by email and set their role.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="member-emails">Email addresses</FieldLabel>
              <Input
                id="member-emails"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="name@vantage.example"
                value={draft}
                aria-invalid={!!error}
                onChange={(e) => {
                  const v = e.target.value
                  if (/[,;]\s*$/.test(v)) commit(v)
                  else setDraft(v)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commit()
                  } else if (e.key === "Backspace" && !draft && emails.length)
                    setEmails((all) => all.slice(0, -1))
                }}
                className="max-md:text-base"
              />
              <FieldError>{error}</FieldError>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {emails.map((e) => (
                    <Badge
                      key={e}
                      variant="secondary"
                      className={cn(BADGE, "pr-1")}
                    >
                      <span className="truncate">{e}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${e}`}
                        onClick={() =>
                          setEmails((all) => all.filter((x) => x !== e))
                        }
                        className="flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <XIcon aria-hidden className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs leading-4 text-muted-foreground">
                {emails.length
                  ? inviteCountLine(emails.length)
                  : "Press Enter or comma to add each address."}
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="member-role">Role</FieldLabel>
              <Select
                items={MEMBER_ROLES.map((r) => ({ value: r, label: r }))}
                value={role}
                onValueChange={(v) => v && setRole(v)}
              >
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="member-auth">
                Authentication method
              </FieldLabel>
              <Select
                items={AUTHENTICATIONS.map((a) => ({ value: a, label: a }))}
                value={auth}
                onValueChange={(v) => v && setAuth(v)}
              >
                <SelectTrigger id="member-auth" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTHENTICATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="member-invite">
                  Send invite email
                </FieldLabel>
                <FieldDescription>
                  Email each person a join link.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="member-invite"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
            </Field>
            <p className="text-xs leading-4 text-muted-foreground">
              Invited as{" "}
              <span className="font-medium text-foreground">{role}</span> using{" "}
              <span className="font-medium text-foreground">{auth}</span>.
            </p>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="mt-auto shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button size="sm" onClick={send}>
              <UserPlusIcon aria-hidden data-icon="inline-start" />
              Send invites
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/**
 * View and Edit: the member's details, and on Edit their role and sign-in method.
 */
function MemberSheet({
  member,
  editing,
  onEdit,
  onOpenChange,
  onSave,
}: {
  member?: TeamMember
  editing: boolean
  onEdit: () => void
  onOpenChange: (o: boolean) => void
  onSave: (patch: Pick<TeamMember, "role" | "authentication">) => void
}) {
  const [role, setRole] = useState(member?.role ?? "")
  const [auth, setAuth] = useState<Authentication>(
    member?.authentication ?? "SSO"
  )
  const [shown, setShown] = useState(member?.id)
  if (member && member.id !== shown) {
    setShown(member.id)
    setRole(member.role)
    setAuth(member.authentication)
  }
  const facts: [string, React.ReactNode][] = member
    ? [
        ["Email", member.email],
        ["Username", member.username],
        [
          "Billing status",
          <span key="b" className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", member.billingDot)}
            />
            {member.billingStatus}
          </span>,
        ],
        ["Joined", member.joined],
      ]
    : []
  return (
    <Sheet open={!!member} onOpenChange={onOpenChange}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            {editing ? "Edit member" : "Member"}
          </SheetTitle>
          <SheetDescription>
            {editing
              ? "Change their role and how they sign in."
              : "Their access and account."}
          </SheetDescription>
        </SheetHeader>
        {member && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-5 p-5">
              <div className="flex items-center gap-3">
                <PersonAvatar name={member.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{member.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {editing
                      ? member.email
                      : `${member.role} · ${member.authentication}`}
                  </p>
                </div>
              </div>
              {editing ? (
                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="edit-role">Role</FieldLabel>
                    <Select
                      items={MEMBER_ROLES.map((r) => ({ value: r, label: r }))}
                      value={role}
                      onValueChange={(v) => v && setRole(v)}
                    >
                      <SelectTrigger id="edit-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-auth">
                      Authentication method
                    </FieldLabel>
                    <Select
                      items={AUTHENTICATIONS.map((a) => ({
                        value: a,
                        label: a,
                      }))}
                      value={auth}
                      onValueChange={(v) => v && setAuth(v)}
                    >
                      <SelectTrigger id="edit-auth" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUTHENTICATIONS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              ) : (
                <dl className="divide-y rounded-lg border">
                  {facts.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="min-w-0 truncate font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </ScrollArea>
        )}
        <SheetFooter className="mt-auto shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              {editing ? "Cancel" : "Close"}
            </SheetClose>
            {editing ? (
              <Button
                size="sm"
                onClick={() => onSave({ role, authentication: auth })}
              >
                Save changes
              </Button>
            ) : (
              <Button size="sm" onClick={onEdit}>
                <PencilIcon aria-hidden data-icon="inline-start" />
                Edit
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
