"use client"

import {
  type ColumnDef,
  type ColumnVisibilityState,
  type ExpandedState,
  type SortingState,
  type Updater,
  useTable,
} from "@tanstack/react-table"
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  Columns2Icon,
  EllipsisIcon,
  EyeIcon,
  FlagIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react"
import { useRef, useState } from "react"

import { FilterBar, type FilterBarField } from "@/components/shared/filter-bar"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type SubTask,
  TASK_ACCOUNTS,
  TASK_ORDERINGS,
  TASK_PRIORITY_TONE,
  TASK_PROPERTIES,
  TASK_PROPERTIES_SHOWN,
  TASK_STATUSES,
  TASK_TABS,
  TASKS,
  type Task,
} from "@/data/tasks"
import { memberName, TEAM_BY_ID } from "@/data/team"
import type { FilterBarRule } from "@/lib/filter-bar"
import {
  archiveTask,
  DEFAULT_QUEUE,
  dueLabel,
  editTask,
  isCompleted,
  type NewTask,
  newTask,
  onTab,
  orderTasks,
  passesTaskFilters,
  setStatus,
  type TaskOrdering,
  type TaskQueue,
  type TaskTab,
  tabCounts,
  taskForm,
  toggleDone,
  updatedLabel,
} from "@/lib/tasks"
import { cn } from "@/lib/utils"

import { TaskSheet } from "./task-sheet"

type Row = Task | SubTask
type Property = (typeof TASK_PROPERTIES)[number]
const PRIORITY_BADGE = {
  destructive: "destructive-light",
  warning: "warning-light",
  info: "info-light",
  success: "success-light",
} as const
/** The ordering each sortable column stands for, and back */
const ORDER_COLUMN: Record<TaskOrdering, string> = {
  Status: "status",
  Priority: "priority",
  "Due date": "due",
  Updated: "updated",
}
const COLUMN_ORDER = Object.fromEntries(
  Object.entries(ORDER_COLUMN).map(([o, c]) => [c, o])
) as Record<string, TaskOrdering>
const PROPERTY_COLUMN: Record<Property, string> = {
  Status: "status",
  Assignee: "assignee",
  Priority: "priority",
  Related: "account",
  "Due date": "due",
  Estimate: "estimate",
  Updated: "updated",
}

const assigneeName = (id: string | null) => (id ? memberName(id) : "Unassigned")
const FIELDS: FilterBarField[] = [
  { id: "task", label: "Task", type: "text", placeholder: "Search tasks..." },
  {
    id: "assignee",
    label: "Assignee",
    type: "select",
    options: [
      ...new Set(
        TASKS.flatMap((t) => [t, ...t.subtasks])
          .map((r) => r.assigneeId)
          .filter((id): id is string => !!id)
          .map(memberName)
      ),
      "Unassigned",
    ],
  },
  {
    id: "account",
    label: "Related",
    type: "select",
    options: TASK_ACCOUNTS.filter((a) => TASKS.some((t) => t.account === a)),
  },
  { id: "status", label: "Status", type: "select", options: TASK_STATUSES },
  {
    id: "priority",
    label: "Priority",
    type: "select",
    options: ["Urgent", "High", "Medium", "Low"],
  },
]
/** The bar opens with an empty Task search */
const STARTING_RULES: FilterBarRule[] = [
  { id: "task-search", field: "task", operator: "contains", values: [""] },
]

/** Activities → Tasks: follow-ups and to-dos with their sub-tasks, a queue you order, and New task */
export function Tasks() {
  const [tasks, setTasks] = useState(TASKS)
  const [tab, setTab] = useState<TaskTab>("all")
  const [rules, setRules] = useState(STARTING_RULES)
  const [queue, setQueue] = useState<TaskQueue>(DEFAULT_QUEUE)
  const [subtasks, setSubtasks] = useState(true)
  const [comfortable, setComfortable] = useState(false)
  const [resizable, setResizable] = useState(true)
  const [movable, setMovable] = useState(true)
  const [shown, setShown] = useState<string[]>(TASK_PROPERTIES_SHOWN)
  const [expanded, setExpanded] = useState<ExpandedState>({ "task-1": true })
  // The task sheet: open, for which task (null for a new one), and a fresh key per opening so it starts clean
  const [sheet, setSheet] = useState({
    open: false,
    id: null as string | null,
    key: 0,
  })
  const openSheet = (id: string | null) =>
    setSheet((s) => ({ open: true, id, key: s.key + 1 }))
  const nextId = useRef(TASKS.length)

  const counts = tabCounts(tasks, queue.includeCompleted)
  // One array per change, or the grid takes each render for new data and resets its pages
  const rows = orderTasks(
    tasks.filter(
      (t) =>
        onTab(t, tab, queue.includeCompleted) &&
        passesTaskFilters(t, rules, assigneeName)
    ),
    queue
  )
  const find = (id: string) =>
    tasks.flatMap((t) => [t, ...t.subtasks]).find((r) => r.id === id)

  // The row actions only reach state through setters, so they (and the columns) are made once
  const actions: RowActions = {
    toggle: (id) => setTasks((all) => toggleDone(all, id)),
    // A title click, View details and Open panel open the task in the task sheet
    open: (r, sub) => {
      toast.add({
        type: "info",
        title: sub ? `Open ${r.title}` : r.title,
        description: sub ? "Opening the sub-task." : "Opening the task.",
      })
      setSheet((s) => ({ open: true, id: r.id, key: s.key + 1 }))
    },
    // Mark waiting and Archive change the task
    wait: (r) => {
      setTasks((all) => setStatus(all, r.id, "Waiting"))
      toast.add({
        title: "Mark as waiting",
        description: `${r.title} is now waiting on someone else.`,
        actionProps: { children: "Looks good", onClick: () => {} },
      })
    },
    archive: (r) => {
      setTasks((all) => archiveTask(all, r.id))
      toast.add({
        title: "Task archived",
        description: "Moved to the archive.",
        actionProps: { children: "Looks good", onClick: () => {} },
      })
    },
  }
  const submit = (f: NewTask) => {
    const id = sheet.id
    if (id) setTasks((all) => editTask(all, id, f))
    // Create task lands the task in the list
    else setTasks((all) => [newTask(`task-${++nextId.current}`, f), ...all])
  }
  const editing = sheet.id ? find(sheet.id) : null

  const columns = taskColumns(actions)
  const sorting: SortingState = [
    { id: ORDER_COLUMN[queue.ordering], desc: queue.desc },
  ]
  const visibility: ColumnVisibilityState = Object.fromEntries(
    TASK_PROPERTIES.map((p) => [PROPERTY_COLUMN[p], shown.includes(p)])
  )
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (r) => r.id,
    getSubRows: (r) =>
      subtasks && "subtasks" in r && r.subtasks.length ? r.subtasks : undefined,
    // Pages count tasks, their sub-tasks ride along; the queue is sorted here, from Settings or a header's Asc / Desc
    paginateExpandedRows: false,
    manualSorting: true,
    state: { sorting, expanded, columnVisibility: visibility },
    onSortingChange: (u: Updater<SortingState>) => {
      const next = (typeof u === "function" ? u(sorting) : u)[0]
      const ordering = next && COLUMN_ORDER[next.id]
      if (next && ordering)
        setQueue((q) => ({ ...q, ordering, desc: next.desc }))
    },
    onExpandedChange: setExpanded,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="sr-only">Tasks</h1>
      <Frame className="w-full">
        <FrameHeader className="flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-px">
            <FrameTitle className="font-semibold text-balance">
              Tasks
            </FrameTitle>
            <FrameDescription className="text-xs text-pretty">
              Callbacks, paperwork, permits and housing across the three offices
            </FrameDescription>
          </div>
          <Button size="sm" onClick={() => openSheet(null)}>
            <PlusIcon aria-hidden className="size-4" />
            New task
          </Button>
        </FrameHeader>
        <FramePanel className="bg-card p-0! shadow-none!">
          <div className="px-(--frame-panel-header-px) pt-(--frame-panel-header-py)">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TaskTab)}>
              <TabsList
                variant="line"
                aria-label="Tasks by state"
                className="gap-5 bg-transparent"
              >
                {TASK_TABS.map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="gap-2 px-0 pb-3 text-sm"
                  >
                    <span>{t.label}</span>
                    <span className="inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground tabular-nums">
                      {counts[t.value]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
            {/* The task search box is narrower than the bar's own */}
            <div className="min-w-0 [&_[data-slot=input-group]]:w-36">
              <FilterBar fields={FIELDS} rules={rules} onChange={setRules} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <SettingsMenu
                queue={queue}
                onQueue={(q) => setQueue((x) => ({ ...x, ...q }))}
                subtasks={subtasks}
                onSubtasks={setSubtasks}
                comfortable={comfortable}
                onComfortable={setComfortable}
                resizable={resizable}
                onResizable={setResizable}
                movable={movable}
                onMovable={setMovable}
                shown={shown}
                onShown={setShown}
              />
            </div>
          </div>
          <Separator />
          <DataGrid
            table={table}
            recordCount={rows.length}
            emptyMessage="No tasks match this view. Clear filters or switch tabs."
            tableLayout={{
              dense: !comfortable,
              columnsResizable: resizable,
              columnsMovable: movable,
              width: "fixed",
            }}
          >
            <DataGridContainer border={false}>
              <DataGridScrollArea>
                <DataGridTable />
              </DataGridScrollArea>
            </DataGridContainer>
            <Separator />
            <FrameFooter>
              <DataGridPagination />
            </FrameFooter>
          </DataGrid>
        </FramePanel>
      </Frame>
      <TaskSheet
        key={sheet.key}
        open={sheet.open}
        onOpenChange={(o) => setSheet((s) => ({ ...s, open: o }))}
        editing={editing ? taskForm(editing) : null}
        onSubmit={submit}
      />
    </div>
  )
}

type RowActions = {
  toggle: (id: string) => void
  open: (r: Row, sub: boolean) => void
  wait: (r: Row) => void
  archive: (r: Row) => void
}

function taskColumns(
  act: RowActions
): ColumnDef<typeof dataGridFeatures, Row>[] {
  const header: ColumnDef<typeof dataGridFeatures, Row>["header"] = ({
    column,
  }) => <DataGridColumnHeader column={column} />
  return [
    {
      id: "title",
      accessorFn: (r) => r.title,
      header,
      size: 300,
      enableSorting: false,
      meta: {
        headerTitle: "Task",
        fillWidth: true,
        headerClassName: "ps-(--frame-panel-header-px)",
        cellClassName: "ps-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <TitleCell
          r={row.original}
          sub={row.depth > 0}
          expandable={row.getCanExpand()}
          expanded={row.getIsExpanded()}
          onExpand={() => row.toggleExpanded()}
          act={act}
        />
      ),
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header,
      size: 138,
      meta: { headerTitle: "Status" },
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1.5">
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              row.original.statusDot
            )}
          />
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "assignee",
      accessorFn: (r) => assigneeName(r.assigneeId),
      header,
      size: 160,
      enableSorting: false,
      meta: { headerTitle: "Assignee" },
      cell: ({ row }) => {
        const id = row.original.assigneeId
        return (
          <div className="flex min-w-0 items-center gap-2">
            {id && TEAM_BY_ID[id] ? (
              <PersonAvatar
                name={memberName(id)}
                className="size-5 *:data-[slot=avatar-fallback]:text-[9px]"
              />
            ) : (
              <Avatar aria-hidden size="sm" className="size-5">
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  --
                </AvatarFallback>
              </Avatar>
            )}
            <div className="truncate text-sm text-foreground">
              {assigneeName(id)}
            </div>
          </div>
        )
      },
    },
    {
      id: "priority",
      accessorFn: (r) => r.priority,
      header,
      size: 122,
      meta: { headerTitle: "Priority" },
      cell: ({ row }) => (
        <Badge
          variant={PRIORITY_BADGE[TASK_PRIORITY_TONE[row.original.priority]]}
        >
          {row.original.priority}
        </Badge>
      ),
    },
    {
      id: "account",
      accessorFn: (r) => r.account,
      header,
      size: 160,
      enableSorting: false,
      meta: { headerTitle: "Related" },
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.account}</Badge>
      ),
    },
    {
      id: "due",
      accessorFn: (r) => r.due,
      header,
      size: 128,
      meta: { headerTitle: "Due date" },
      cell: ({ row }) => (
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            row.depth > 0 ? "text-muted-foreground" : "text-foreground"
          )}
        >
          <CalendarDaysIcon
            aria-hidden
            className="size-4 text-muted-foreground"
          />
          {dueLabel(row.original.due, row.original.status, row.depth > 0)}
        </div>
      ),
    },
    {
      id: "estimate",
      accessorFn: (r) => ("estimate" in r ? r.estimate : null),
      header,
      size: 102,
      enableSorting: false,
      meta: { headerTitle: "Estimate" },
      cell: ({ row }) => {
        const e = "estimate" in row.original ? row.original.estimate : null
        return e ? (
          <span className="text-sm font-medium text-foreground tabular-nums">
            {e}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )
      },
    },
    {
      id: "updated",
      accessorFn: (r) => ("updatedHoursAgo" in r ? r.updatedHoursAgo : null),
      header,
      size: 116,
      meta: { headerTitle: "Updated" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {"updatedHoursAgo" in row.original
            ? updatedLabel(row.original.updatedHoursAgo)
            : "--"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 56,
      enableSorting: false,
      enableResizing: false,
      meta: {
        headerClassName: "pe-(--frame-panel-header-px)",
        cellClassName: "pe-(--frame-panel-px)",
      },
      cell: ({ row }) => (
        <RowMenu r={row.original} sub={row.depth > 0} act={act} />
      ),
    },
  ]
}

function TitleCell({
  r,
  sub,
  expandable,
  expanded,
  onExpand,
  act,
}: {
  r: Row
  sub: boolean
  expandable: boolean
  expanded: boolean
  onExpand: () => void
  act: RowActions
}) {
  const done = r.status === "Done"
  const n = "subtasks" in r ? r.subtasks.length : 0
  return (
    <div className={cn("flex min-w-0 items-start gap-2", sub && "pl-12")}>
      {!sub &&
        (expandable ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Hide" : "Show"} ${n} sub-tasks for ${r.title}`}
            onClick={onExpand}
            className="size-6 shrink-0 rounded-md p-0 text-muted-foreground shadow-none hover:text-foreground aria-expanded:bg-transparent"
          >
            <ChevronRightIcon
              aria-hidden
              className={cn(
                "size-3.5 shrink-0 transition-transform duration-150",
                expanded && "rotate-90"
              )}
            />
          </Button>
        ) : (
          <div className="size-6 shrink-0" />
        ))}
      <div className="relative flex min-w-0 flex-1 items-start gap-2">
        <Checkbox
          checked={done}
          disabled={r.status === "Cancelled"}
          onCheckedChange={() => act.toggle(r.id)}
          aria-label={`Mark ${r.title} ${done ? "as incomplete" : "complete"}`}
          className="mt-0.5 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center text-sm leading-5 font-medium text-foreground transition-colors">
            <button
              type="button"
              onClick={() => act.open(r, sub)}
              className="group/task-title inline-flex min-w-0 items-center gap-1 truncate rounded-sm text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span
                className={cn(
                  "max-w-full cursor-pointer truncate py-0.25 transition-colors hover:text-primary",
                  done || (sub && isCompleted(r))
                    ? "text-muted-foreground line-through decoration-current/55 decoration-1"
                    : "text-foreground"
                )}
              >
                {r.title}
              </span>
              <ArrowRightIcon
                aria-hidden
                className="size-3 shrink-0 -translate-x-1 opacity-0 transition-all group-hover/task-title:translate-x-0 group-hover/task-title:opacity-100 group-focus-visible/task-title:translate-x-0 group-focus-visible/task-title:opacity-100"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RowMenu({ r, sub, act }: { r: Row; sub: boolean; act: RowActions }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${r.title}`}
            />
          }
        >
          <EllipsisIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => act.open(r, sub)}>
              <EyeIcon aria-hidden className="size-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => act.open(r, sub)}>
              <Columns2Icon aria-hidden className="size-4" />
              Open panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => act.wait(r)}>
              <FlagIcon aria-hidden className="size-4" />
              Mark waiting
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => act.archive(r)}>
              <ArchiveIcon aria-hidden className="size-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

type SettingsProps = {
  queue: TaskQueue
  onQueue: (q: Partial<TaskQueue>) => void
  subtasks: boolean
  onSubtasks: (v: boolean) => void
  comfortable: boolean
  onComfortable: (v: boolean) => void
  resizable: boolean
  onResizable: (v: boolean) => void
  movable: boolean
  onMovable: (v: boolean) => void
  shown: string[]
  onShown: (v: string[]) => void
}

/** Settings: the queue (ordering, direction, completed, sub-tasks), the table (density, resizing, moving) and which properties show */
function SettingsMenu(s: SettingsProps) {
  const row = (label: string, control: React.ReactNode, id: string) => (
    <Field
      orientation="horizontal"
      className="min-h-9 items-center justify-between gap-3"
    >
      <FieldLabel htmlFor={id} className="text-sm font-normal">
        {label}
      </FieldLabel>
      {control}
    </Field>
  )
  const toggle = (id: string, checked: boolean, on: (v: boolean) => void) => (
    <Switch id={id} size="sm" checked={checked} onCheckedChange={on} />
  )
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2Icon aria-hidden className="size-4" />
        Settings
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Task settings"
        className="w-[320px] p-0"
      >
        <FieldGroup className="gap-3 px-3.5 py-3">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Queue
            </div>
            <div>
              {row(
                "Ordering",
                <Select
                  items={TASK_ORDERINGS.map((o) => ({ value: o, label: o }))}
                  value={s.queue.ordering}
                  onValueChange={(v) => v && s.onQueue({ ordering: v })}
                >
                  <SelectTrigger
                    id="tasks-ordering"
                    size="sm"
                    className="w-[132px] shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_ORDERINGS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>,
                "tasks-ordering"
              )}
              <Field
                orientation="horizontal"
                className="min-h-9 items-center justify-between gap-3"
              >
                <FieldLabel
                  id="tasks-direction"
                  className="text-sm font-normal"
                >
                  Direction
                </FieldLabel>
                <ToggleGroup
                  aria-labelledby="tasks-direction"
                  variant="outline"
                  size="sm"
                  value={[s.queue.desc ? "desc" : "asc"]}
                  onValueChange={(v) =>
                    v[0] && s.onQueue({ desc: v[0] === "desc" })
                  }
                  className="ml-auto w-[132px] shrink-0 justify-end"
                >
                  <ToggleGroupItem value="asc">Asc</ToggleGroupItem>
                  <ToggleGroupItem value="desc">Desc</ToggleGroupItem>
                </ToggleGroup>
              </Field>
              {row(
                "Include completed",
                toggle("tasks-completed", s.queue.includeCompleted, (v) =>
                  s.onQueue({ includeCompleted: v })
                ),
                "tasks-completed"
              )}
              {row(
                "Done by recency",
                toggle("tasks-recency", s.queue.doneByRecency, (v) =>
                  s.onQueue({ doneByRecency: v })
                ),
                "tasks-recency"
              )}
              {row(
                "Show sub-tasks",
                toggle("tasks-subtasks", s.subtasks, s.onSubtasks),
                "tasks-subtasks"
              )}
            </div>
          </div>
          <FieldSeparator className="-mx-3.5" />
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Table
            </div>
            <div>
              {row(
                "Density",
                <Select
                  items={[
                    { value: "compact", label: "Compact" },
                    { value: "comfortable", label: "Comfortable" },
                  ]}
                  value={s.comfortable ? "comfortable" : "compact"}
                  onValueChange={(v) =>
                    v && s.onComfortable(v === "comfortable")
                  }
                >
                  <SelectTrigger
                    id="tasks-density"
                    size="sm"
                    className="w-[132px] shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                  </SelectContent>
                </Select>,
                "tasks-density"
              )}
              {row(
                "Resizable columns",
                toggle("tasks-resizable", s.resizable, s.onResizable),
                "tasks-resizable"
              )}
              {row(
                "Movable columns",
                toggle("tasks-movable", s.movable, s.onMovable),
                "tasks-movable"
              )}
            </div>
          </div>
          <FieldSeparator className="-mx-3.5" />
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-medium text-muted-foreground">
              Display properties
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TASK_PROPERTIES.map((p) => {
                const on = s.shown.includes(p)
                return (
                  <Button
                    key={p}
                    variant={on ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={on}
                    onClick={() =>
                      s.onShown(
                        on ? s.shown.filter((x) => x !== p) : [...s.shown, p]
                      )
                    }
                    className={cn("rounded-full", on && "border-foreground/10")}
                  >
                    {on && <CheckIcon aria-hidden />}
                    {p}
                  </Button>
                )
              })}
            </div>
          </div>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  )
}
