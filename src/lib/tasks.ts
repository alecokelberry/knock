// Activities → Tasks: which tasks a tab shows, the queue's order, the words in the cells, and the edits a row makes.

import {
  type SubTask,
  type TASK_ORDERINGS,
  TASK_STATUS_DOT,
  TASKS_TODAY,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/data/tasks"
import { addDays, formatDay } from "@/lib/dates"
import { type FilterBarRule, passesFilters } from "@/lib/filter-bar"

export type TaskTab = "all" | "open" | "later"
export type TaskOrdering = (typeof TASK_ORDERINGS)[number]
/** Settings → Queue */
export type TaskQueue = {
  ordering: TaskOrdering
  desc: boolean
  includeCompleted: boolean
  doneByRecency: boolean
}
export const DEFAULT_QUEUE: TaskQueue = {
  ordering: "Priority",
  desc: true,
  includeCompleted: true,
  doneByRecency: true,
}

const OPEN = new Set<TaskStatus>(["Todo", "In Progress", "Waiting"])
export const isCompleted = (t: { status: TaskStatus }) =>
  t.status === "Done" || t.status === "Cancelled"

/** Whether a task belongs on a tab (and, with Include completed off, isn't Done or Cancelled) */
export function onTab(t: Task, tab: TaskTab, includeCompleted = true): boolean {
  if (!includeCompleted && isCompleted(t)) return false
  if (tab === "open") return OPEN.has(t.status)
  if (tab === "later") return t.status === "Later"
  return true
}

/** The counts beside the tabs: 12, 7 and 2 at first */
export function tabCounts(
  tasks: Task[],
  includeCompleted = true
): Record<TaskTab, number> {
  const n = (tab: TaskTab) =>
    tasks.filter((t) => onTab(t, tab, includeCompleted)).length
  return { all: n("all"), open: n("open"), later: n("later") }
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
}
/** Status as a scale, Later first; Done by recency ranks Done and Cancelled together, so recency alone orders them */
const statusRank = (s: TaskStatus, doneByRecency: boolean) =>
  ({
    Later: 0,
    Todo: 1,
    "In Progress": 2,
    Waiting: 3,
    Done: 4,
    Cancelled: doneByRecency ? 4 : 5,
  })[s]

/**
 * The queue's order: the ordering's value, then ties by how recently a task changed (Status) or by the
 * list's own order (the rest). Descending reverses the whole thing, ties included.
 */
export function orderTasks(tasks: Task[], q: TaskQueue): Task[] {
  const index = new Map(tasks.map((t, i) => [t.id, i]))
  const keys = (t: Task): number[] => {
    const i = -index.get(t.id)!
    switch (q.ordering) {
      case "Priority":
        return [PRIORITY_RANK[t.priority], i]
      case "Status":
        return [statusRank(t.status, q.doneByRecency), -t.updatedHoursAgo, i]
      case "Due date":
        return [t.due ? Date.parse(t.due) : Number.MAX_SAFE_INTEGER, i]
      case "Updated":
        return [-t.updatedHoursAgo, i]
    }
  }
  const compare = (a: Task, b: Task) => {
    const ka = keys(a)
    const kb = keys(b)
    for (const [k, x] of ka.entries()) {
      const y = kb[k] ?? 0
      if (x !== y) return x - y
    }
    return 0
  }
  // Ascending runs the descending order backwards, so the index tiebreak reads low-to-high there
  return tasks.toSorted((a, b) => (q.desc ? compare(b, a) : compare(a, b)))
}

/** A task passes the filter bar when it or any of its sub-tasks does (the sub-tasks then show under it) */
export function passesTaskFilters(
  t: Task,
  rules: FilterBarRule[],
  name: (id: string | null) => string
): boolean {
  const field = (row: SubTask, f: string) =>
    ({
      task: row.title,
      assignee: name(row.assigneeId),
      account: row.account,
      status: row.status,
      priority: row.priority,
    })[f] ?? ""
  return (
    passesFilters(t, rules, field) ||
    t.subtasks.some((s) => passesFilters(s, rules, field))
  )
}

/** The Due date cell: a task still open reads Overdue, Today or Tomorrow; anything else, and every sub-task, the day */
export function dueLabel(
  due: string | null,
  status: TaskStatus,
  sub = false,
  today = TASKS_TODAY
): string {
  if (!due) return "--"
  if (sub || isCompleted({ status })) return formatDay(due)
  if (due < today) return "Overdue"
  if (due === today) return "Today"
  if (due === addDays(today, 1)) return "Tomorrow"
  return formatDay(due)
}

/** The Updated cell: "Just now", "2h ago", "3d ago" */
export const updatedLabel = (hoursAgo: number) =>
  hoursAgo < 1
    ? "Just now"
    : hoursAgo < 24
      ? `${hoursAgo}h ago`
      : `${Math.floor(hoursAgo / 24)}d ago`

/** Set a task's or sub-task's status; the task it belongs to becomes the one updated just now */
export function setStatus(
  tasks: Task[],
  id: string,
  status: TaskStatus
): Task[] {
  const patch = <T extends SubTask>(t: T): T => ({
    ...t,
    status,
    statusDot: TASK_STATUS_DOT[status],
    done: status === "Done",
  })
  return tasks.map((t) => {
    if (t.id === id) return { ...patch(t), updatedHoursAgo: 0 }
    if (!t.subtasks.some((s) => s.id === id)) return t
    return {
      ...t,
      updatedHoursAgo: 0,
      subtasks: t.subtasks.map((s) => (s.id === id ? patch(s) : s)),
    }
  })
}

/** The round checkbox: Done, or back to Todo (unchecking always lands on Todo) */
export function toggleDone(tasks: Task[], id: string): Task[] {
  const row = tasks.flatMap((t) => [t, ...t.subtasks]).find((r) => r.id === id)
  return row
    ? setStatus(tasks, id, row.status === "Done" ? "Todo" : "Done")
    : tasks
}

/** Take a task or a sub-task off the list */
export const archiveTask = (tasks: Task[], id: string): Task[] =>
  tasks
    .filter((t) => t.id !== id)
    .map((t) =>
      t.subtasks.some((s) => s.id === id)
        ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== id) }
        : t
    )

/** The New task sheet's one required field */
export const taskNameError = (title: string) =>
  title.trim() ? null : "Enter a task name"

/** "In Progress · High · Julia Serrano · Parallax Cinemas", the Task created toast */
export const createdDescription = (
  status: string,
  priority: string,
  assignee: string,
  account: string
) => [status, priority, assignee, account].join(" · ")

const DUE_OFFSET: Record<string, number | null> = {
  Today: 0,
  Tomorrow: 1,
  "This week": 3,
  "Next week": 7,
  "No date": null,
}
const ESTIMATE_SHORT: Record<string, string> = {
  "30 min": "30m",
  "1 hour": "1h",
  "2 hours": "2h",
  "Half day": "4h",
  "1 day": "1d",
}

const ESTIMATE_LONG = Object.fromEntries(
  Object.entries(ESTIMATE_SHORT).map(([long, short]) => [short, long])
)

/**
 * What the task sheet edits. `due` is one of the sheet's choices (Today … No date) or, for a task being edited, the
 * day it already has (ISO); `estimate` a choice or the estimate it already has ("15m"); `assigneeId` "" for Unassigned.
 */
export type NewTask = {
  title: string
  priority: TaskPriority
  status: TaskStatus
  assigneeId: string
  account: string
  due: string
  estimate: string
}
type Row = SubTask & Partial<Pick<Task, "estimate">>

const dueOf = (choice: string, today: string) => {
  if (/^\d{4}-/.test(choice)) return choice
  const offset = DUE_OFFSET[choice]
  return offset === null || offset === undefined ? null : addDays(today, offset)
}
const fields = (f: NewTask, today: string) => ({
  title: f.title.trim(),
  status: f.status,
  statusDot: TASK_STATUS_DOT[f.status],
  assigneeId: f.assigneeId || null,
  priority: f.priority,
  account: f.account,
  accountId: f.account.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  done: f.status === "Done",
  due: dueOf(f.due, today),
})

/** A task from the New task sheet, updated just now */
export function newTask(id: string, f: NewTask, today = TASKS_TODAY): Task {
  return {
    id,
    ...fields(f, today),
    estimate: ESTIMATE_SHORT[f.estimate] ?? null,
    updatedHoursAgo: 0,
    subtasks: [],
  }
}

/** The sheet's values for a task or sub-task being opened */
export const taskForm = (r: Row): NewTask => ({
  title: r.title,
  priority: r.priority,
  status: r.status,
  assigneeId: r.assigneeId ?? "",
  account: r.account,
  due: r.due ?? "No date",
  estimate: r.estimate ? (ESTIMATE_LONG[r.estimate] ?? r.estimate) : "",
})

/** Save the sheet over a task or sub-task; its task becomes the one updated just now */
export function editTask(
  tasks: Task[],
  id: string,
  f: NewTask,
  today = TASKS_TODAY
): Task[] {
  return tasks.map((t) => {
    if (t.id === id)
      return {
        ...t,
        ...fields(f, today),
        estimate: f.estimate
          ? (ESTIMATE_SHORT[f.estimate] ?? f.estimate)
          : t.estimate,
        updatedHoursAgo: 0,
      }
    if (!t.subtasks.some((s) => s.id === id)) return t
    return {
      ...t,
      updatedHoursAgo: 0,
      subtasks: t.subtasks.map((s) =>
        s.id === id ? { ...s, ...fields(f, today) } : s
      ),
    }
  })
}
