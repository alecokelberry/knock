// Activities → Tasks: the team's follow-ups (callbacks, agreements to save or fix, first services to book, permits and
// housing), a tree of 12 tasks and their sub-tasks.

import { DEMO_TODAY } from "./workspace"

export type TaskStatus =
  | "Todo"
  | "In Progress"
  | "Waiting"
  | "Later"
  | "Done"
  | "Cancelled"
export type TaskPriority = "Urgent" | "High" | "Medium" | "Low"

export type SubTask = {
  id: string
  title: string
  status: TaskStatus
  /** Dot class of the status badge. */
  statusDot: string
  /** Team member id; null renders "Unassigned". */
  assigneeId: string | null
  priority: TaskPriority
  /** The chip for what it's about: a homeowner, a territory, an office or the partner. */
  account: string
  accountId: string
  /** The round checkbox is checked and the title struck through: status Done. */
  done: boolean
  /** Due day (ISO); the hidden Due date column. A task shows it as Overdue, Today or Tomorrow while open. */
  due: string | null
}

export type Task = SubTask & {
  /** The hidden Estimate column: "1h", "15m". Sub-tasks show "--". */
  estimate: string | null
  /** The hidden Updated column, as hours before now: 2 → "2h ago", 48 → "2d ago", 0 → "Just now". */
  updatedHoursAgo: number
  subtasks: SubTask[]
}

/** The day the task list reads its due dates against: the demo's today (Jul 16 is "Today", Jul 17 "Tomorrow") */
export const TASKS_TODAY = DEMO_TODAY

/** The tabs: All tasks, Open (Todo, In Progress, Waiting) and Later */
export const TASK_TABS = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Open" },
  { value: "later", label: "Later" },
] as const
export const TASK_STATUSES: TaskStatus[] = [
  "Later",
  "Todo",
  "In Progress",
  "Waiting",
  "Done",
  "Cancelled",
]
export const TASK_PRIORITIES: TaskPriority[] = [
  "Urgent",
  "High",
  "Medium",
  "Low",
]
/** Settings → Ordering */
export const TASK_ORDERINGS = [
  "Status",
  "Priority",
  "Due date",
  "Updated",
] as const
/** Settings → Display properties: the columns that can be shown, and which show at first */
export const TASK_PROPERTIES = [
  "Status",
  "Assignee",
  "Priority",
  "Related",
  "Due date",
  "Estimate",
  "Updated",
] as const
export const TASK_PROPERTIES_SHOWN = [
  "Status",
  "Assignee",
  "Priority",
  "Related",
]
/** The New task sheet's choices */
export const TASK_ASSIGNEE_IDS = [
  "darnell-brooks",
  "kyle-bennett",
  "ayesha-malik",
  "meera-iyer",
  "haruka-mori",
  "julia-serrano",
  "rafael-lima",
  "mateo-alvarez",
  "grant-lowell",
  "niamh-kelly",
]
export const TASK_ACCOUNTS = [
  "Harriet Lawson",
  "Joon Park",
  "Valentina Ospina",
  "Graham Pritchard",
  "Margaret Doyle",
  "Stefan Richter",
  "Riverbend",
  "Wakefield Glen",
  "Camelback Terrace",
  "Boise office",
  "Raleigh office",
  "Ridgeline",
]
export const TASK_DUE_CHOICES = [
  "Today",
  "Tomorrow",
  "This week",
  "Next week",
  "No date",
]
export const TASK_ESTIMATES = [
  "30 min",
  "1 hour",
  "2 hours",
  "Half day",
  "1 day",
]

export const TASK_STATUS_DOT: Record<TaskStatus, string> = {
  "In Progress": "bg-amber-500",
  Done: "bg-emerald-500",
  Todo: "bg-sky-500",
  Waiting: "bg-violet-500",
  Later: "bg-zinc-400",
  Cancelled: "bg-rose-500",
}
/** Priority badge tone. */
export const TASK_PRIORITY_TONE: Record<
  TaskPriority,
  "destructive" | "warning" | "info" | "success"
> = { Urgent: "destructive", High: "warning", Medium: "info", Low: "success" }

/**
 * The 12 top-level tasks on /tasks ("All tasks 12"), each a step on a household, an office or the partner, with its sub-tasks (36 rows in all).
 * Tabs: All tasks = every task; Open = status In Progress, Todo or Waiting (9); Later = status Later (2). The sidebar count 11 is Open + Later.
 * The list starts sorted by Priority descending (ties in this order) with only the first task expanded.
 */
export const TASKS: Task[] = [
  {
    id: "task-1",
    title: "Get Tessa's answer on Valentina's 22%",
    status: "In Progress",
    statusDot: "bg-amber-500",
    assigneeId: "haruka-mori",
    priority: "Urgent",
    account: "Valentina Ospina",
    accountId: "valentina-ospina",
    done: false,
    due: "2026-07-16",
    estimate: "30m",
    updatedHoursAgo: 2,
    subtasks: [
      {
        id: "task-1-1",
        title: "Write up the other company's quote",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "haruka-mori",
        priority: "High",
        account: "Valentina Ospina",
        accountId: "valentina-ospina",
        done: true,
        due: "2026-07-15",
      },
      {
        id: "task-1-2",
        title: "Check the commission tier with Karim",
        status: "In Progress",
        statusDot: "bg-amber-500",
        assigneeId: "karim-nassar",
        priority: "Urgent",
        account: "Valentina Ospina",
        accountId: "valentina-ospina",
        done: false,
        due: "2026-07-16",
      },
      {
        id: "task-1-3",
        title: "Bring the new price to tomorrow's callback",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "haruka-mori",
        priority: "Urgent",
        account: "Valentina Ospina",
        accountId: "valentina-ospina",
        done: false,
        due: "2026-07-17",
      },
    ],
  },
  {
    id: "task-2",
    title: "Keep Joon Park before his window closes",
    status: "Todo",
    statusDot: "bg-sky-500",
    assigneeId: "meera-iyer",
    priority: "Urgent",
    account: "Joon Park",
    accountId: "joon-park",
    done: false,
    due: "2026-07-17",
    estimate: "15m",
    updatedHoursAgo: 16,
    subtasks: [],
  },
  {
    id: "task-3",
    title: "Close Harriet Lawson at tonight's callback",
    status: "In Progress",
    statusDot: "bg-amber-500",
    assigneeId: "darnell-brooks",
    priority: "Urgent",
    account: "Harriet Lawson",
    accountId: "harriet-lawson",
    done: false,
    due: "2026-07-16",
    estimate: "1h",
    updatedHoursAgo: 3,
    subtasks: [
      {
        id: "task-3-1",
        title: "Print the termite monitoring sheet",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "darnell-brooks",
        priority: "High",
        account: "Harriet Lawson",
        accountId: "harriet-lawson",
        done: true,
        due: "2026-07-15",
      },
      {
        id: "task-3-2",
        title: "Get Julia's answer on 15%",
        status: "Waiting",
        statusDot: "bg-violet-500",
        assigneeId: "darnell-brooks",
        priority: "Urgent",
        account: "Harriet Lawson",
        accountId: "harriet-lawson",
        done: false,
        due: "2026-07-16",
      },
      {
        id: "task-3-3",
        title: "Knock the houses either side",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "darnell-brooks",
        priority: "High",
        account: "Harriet Lawson",
        accountId: "harriet-lawson",
        done: false,
        due: "2026-07-17",
      },
    ],
  },
  {
    id: "task-4",
    title: "Renew Kyle's Boise solicitor permit",
    status: "Waiting",
    statusDot: "bg-violet-500",
    assigneeId: "niamh-kelly",
    priority: "High",
    account: "Boise office",
    accountId: "boise-office",
    done: false,
    due: "2026-07-17",
    estimate: "45m",
    updatedHoursAgo: 5,
    subtasks: [
      {
        id: "task-4-1",
        title: "Send the background check to the city",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "niamh-kelly",
        priority: "High",
        account: "Boise office",
        accountId: "boise-office",
        done: true,
        due: "2026-07-15",
      },
      {
        id: "task-4-2",
        title: "Pick up the new badge at city hall",
        status: "Waiting",
        statusDot: "bg-violet-500",
        assigneeId: "niamh-kelly",
        priority: "High",
        account: "Boise office",
        accountId: "boise-office",
        done: false,
        due: "2026-07-17",
      },
    ],
  },
  {
    id: "task-5",
    title: "Get Graham Pritchard a Saturday first service",
    status: "Todo",
    statusDot: "bg-sky-500",
    assigneeId: "kyle-bennett",
    priority: "High",
    account: "Graham Pritchard",
    accountId: "graham-pritchard",
    done: false,
    due: "2026-07-21",
    estimate: "1h",
    updatedHoursAgo: 20,
    subtasks: [
      {
        id: "task-5-1",
        title: "Ask Ridgeline for a Saturday slot",
        status: "In Progress",
        statusDot: "bg-amber-500",
        assigneeId: "grant-lowell",
        priority: "High",
        account: "Graham Pritchard",
        accountId: "graham-pritchard",
        done: false,
        due: "2026-07-17",
      },
      {
        id: "task-5-2",
        title: "Text Graham the agreement link",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "kyle-bennett",
        priority: "High",
        account: "Graham Pritchard",
        accountId: "graham-pritchard",
        done: false,
        due: "2026-07-20",
      },
    ],
  },
  {
    id: "task-6",
    title: "Fix Margaret Doyle's agreement before Friday",
    status: "In Progress",
    statusDot: "bg-amber-500",
    assigneeId: "darnell-brooks",
    priority: "High",
    account: "Margaret Doyle",
    accountId: "margaret-doyle",
    done: false,
    due: "2026-07-17",
    estimate: "30m",
    updatedHoursAgo: 6,
    subtasks: [
      {
        id: "task-6-1",
        title: "Correct the termite station count",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "darnell-brooks",
        priority: "High",
        account: "Margaret Doyle",
        accountId: "margaret-doyle",
        done: false,
        due: "2026-07-17",
      },
      {
        id: "task-6-2",
        title: "Send the corrected copy for e-sign",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "grant-lowell",
        priority: "Medium",
        account: "Margaret Doyle",
        accountId: "margaret-doyle",
        done: true,
        due: "2026-07-14",
      },
    ],
  },
  {
    id: "task-7",
    title: "Move Stefan Richter's first service",
    status: "In Progress",
    statusDot: "bg-amber-500",
    assigneeId: "haruka-mori",
    priority: "High",
    account: "Stefan Richter",
    accountId: "stefan-richter",
    done: false,
    due: "2026-07-20",
    estimate: "2h",
    updatedHoursAgo: 9,
    subtasks: [
      {
        id: "task-7-1",
        title: "Find a Tuesday slot with Ridgeline",
        status: "In Progress",
        statusDot: "bg-amber-500",
        assigneeId: "grant-lowell",
        priority: "High",
        account: "Stefan Richter",
        accountId: "stefan-richter",
        done: false,
        due: "2026-07-18",
      },
      {
        id: "task-7-2",
        title: "Confirm the side gate is unlocked",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "haruka-mori",
        priority: "High",
        account: "Stefan Richter",
        accountId: "stefan-richter",
        done: true,
        due: "2026-07-15",
      },
      {
        id: "task-7-3",
        title: "Text Stefan the new time",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "haruka-mori",
        priority: "Medium",
        account: "Stefan Richter",
        accountId: "stefan-richter",
        done: false,
        due: "2026-07-20",
      },
    ],
  },
  {
    id: "task-8",
    title: "Plan Raleigh's second wave of rookies",
    status: "Later",
    statusDot: "bg-zinc-400",
    assigneeId: "rafael-lima",
    priority: "High",
    account: "Raleigh office",
    accountId: "raleigh-office",
    done: false,
    due: "2026-08-14",
    estimate: "3h",
    updatedHoursAgo: 30,
    subtasks: [
      {
        id: "task-8-1",
        title: "Line up two more apartments",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "niamh-kelly",
        priority: "High",
        account: "Raleigh office",
        accountId: "raleigh-office",
        done: false,
        due: "2026-08-05",
      },
      {
        id: "task-8-2",
        title: "Order door hangers and badges",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "niamh-kelly",
        priority: "Medium",
        account: "Raleigh office",
        accountId: "raleigh-office",
        done: false,
        due: "2026-08-07",
      },
      {
        id: "task-8-3",
        title: "Schedule ride-alongs with Ayesha",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "ayesha-malik",
        priority: "High",
        account: "Raleigh office",
        accountId: "raleigh-office",
        done: false,
        due: "2026-08-12",
      },
    ],
  },
  {
    id: "task-9",
    title: "Ride along with Kyle on Saturday",
    status: "Todo",
    statusDot: "bg-sky-500",
    assigneeId: "julia-serrano",
    priority: "Medium",
    account: "Riverbend",
    accountId: "riverbend",
    done: false,
    due: "2026-07-22",
    estimate: "1h",
    updatedHoursAgo: 26,
    subtasks: [
      {
        id: "task-9-1",
        title: "Send Kyle the rebuttal list",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "julia-serrano",
        priority: "Medium",
        account: "Riverbend",
        accountId: "riverbend",
        done: true,
        due: "2026-07-13",
      },
    ],
  },
  {
    id: "task-10",
    title: "Work the Wakefield Glen referrals",
    status: "Todo",
    statusDot: "bg-sky-500",
    assigneeId: null,
    priority: "Medium",
    account: "Wakefield Glen",
    accountId: "wakefield-glen",
    done: false,
    due: "2026-07-17",
    estimate: "2h",
    updatedHoursAgo: 12,
    subtasks: [
      {
        id: "task-10-1",
        title: "Call Layla Khoury",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "meera-iyer",
        priority: "Medium",
        account: "Wakefield Glen",
        accountId: "wakefield-glen",
        done: true,
        due: "2026-07-14",
      },
      {
        id: "task-10-2",
        title: "Knock Dale Hutchins again",
        status: "Done",
        statusDot: "bg-emerald-500",
        assigneeId: "meera-iyer",
        priority: "Medium",
        account: "Wakefield Glen",
        accountId: "wakefield-glen",
        done: true,
        due: "2026-07-13",
      },
      {
        id: "task-10-3",
        title: "Text Jiwoo Han a thank-you",
        status: "Todo",
        statusDot: "bg-sky-500",
        assigneeId: "meera-iyer",
        priority: "Low",
        account: "Wakefield Glen",
        accountId: "wakefield-glen",
        done: false,
        due: "2026-07-17",
      },
    ],
  },
  {
    id: "task-11",
    title: "Redraw Owen's territory map",
    status: "Later",
    statusDot: "bg-zinc-400",
    assigneeId: "mateo-alvarez",
    priority: "Medium",
    account: "Camelback Terrace",
    accountId: "camelback-terrace",
    done: false,
    due: "2026-07-28",
    estimate: "2h",
    updatedHoursAgo: 50,
    subtasks: [
      {
        id: "task-11-1",
        title: "Pull last week's not-home doors",
        status: "Later",
        statusDot: "bg-zinc-400",
        assigneeId: "daniel-seo",
        priority: "Medium",
        account: "Camelback Terrace",
        accountId: "camelback-terrace",
        done: false,
        due: "2026-07-27",
      },
    ],
  },
  {
    id: "task-12",
    title: "Reconcile Ridgeline's June service file",
    status: "Done",
    statusDot: "bg-emerald-500",
    assigneeId: "grant-lowell",
    priority: "Low",
    account: "Ridgeline",
    accountId: "ridgeline",
    done: true,
    due: "2026-07-14",
    estimate: "30m",
    updatedHoursAgo: 60,
    subtasks: [
      {
        id: "task-12-1",
        title: "Visit Ridgeline's Boise branch",
        status: "Cancelled",
        statusDot: "bg-rose-500",
        assigneeId: "grant-lowell",
        priority: "Low",
        account: "Ridgeline",
        accountId: "ridgeline",
        done: false,
        due: "2026-07-15",
      },
    ],
  },
]
