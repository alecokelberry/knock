import { describe, expect, it } from "vitest"

import { TASKS } from "@/data/tasks"

import {
  archiveTask,
  createdDescription,
  DEFAULT_QUEUE,
  dueLabel,
  editTask,
  newTask,
  onTab,
  orderTasks,
  passesTaskFilters,
  setStatus,
  type TaskQueue,
  tabCounts,
  taskForm,
  taskNameError,
  toggleDone,
  updatedLabel,
} from "./tasks"

const titles = (q: Partial<TaskQueue>) =>
  orderTasks(TASKS, { ...DEFAULT_QUEUE, ...q }).map((t) =>
    t.title.split(" ").slice(0, 2).join(" ")
  )
const name = (id: string | null) => id ?? "Unassigned"

describe("tasks", () => {
  it("counts the tabs", () => {
    expect(tabCounts(TASKS)).toEqual({ all: 12, open: 9, later: 2 })
    expect(tabCounts(TASKS, false)).toEqual({ all: 11, open: 9, later: 2 })
    expect(TASKS.filter((t) => onTab(t, "later")).map((t) => t.id)).toEqual([
      "task-8",
      "task-11",
    ])
  })

  it("orders the queue by priority, ties in the list's order, and reverses it all ascending", () => {
    expect(titles({})).toEqual([
      "Get Tessa's",
      "Keep Joon",
      "Close Harriet",
      "Renew Kyle's",
      "Get Graham",
      "Fix Margaret",
      "Move Stefan",
      "Plan Raleigh's",
      "Ride along",
      "Work the",
      "Redraw Owen's",
      "Reconcile Ridgeline's",
    ])
    expect(titles({ desc: false })).toEqual(titles({}).toReversed())
  })

  it("orders by status, completed by recency when asked", () => {
    expect(titles({ ordering: "Status", desc: false })).toEqual([
      "Redraw Owen's",
      "Plan Raleigh's",
      "Ride along",
      "Get Graham",
      "Keep Joon",
      "Work the",
      "Move Stefan",
      "Fix Margaret",
      "Close Harriet",
      "Get Tessa's",
      "Renew Kyle's",
      "Reconcile Ridgeline's",
    ])
    expect(
      titles({ ordering: "Status", desc: false, doneByRecency: false }).slice(
        -3
      )
    ).toEqual(["Get Tessa's", "Renew Kyle's", "Reconcile Ridgeline's"])
    expect(titles({ ordering: "Status" }).slice(0, 3)).toEqual([
      "Reconcile Ridgeline's",
      "Renew Kyle's",
      "Get Tessa's",
    ])
  })

  it("orders by due date and by last update", () => {
    expect(titles({ ordering: "Due date", desc: false })).toEqual([
      "Reconcile Ridgeline's",
      "Close Harriet",
      "Get Tessa's",
      "Work the",
      "Fix Margaret",
      "Renew Kyle's",
      "Keep Joon",
      "Move Stefan",
      "Get Graham",
      "Ride along",
      "Redraw Owen's",
      "Plan Raleigh's",
    ])
    expect(titles({ ordering: "Updated" })).toEqual([
      "Get Tessa's",
      "Close Harriet",
      "Renew Kyle's",
      "Fix Margaret",
      "Move Stefan",
      "Work the",
      "Keep Joon",
      "Get Graham",
      "Ride along",
      "Plan Raleigh's",
      "Redraw Owen's",
      "Reconcile Ridgeline's",
    ])
  })

  it("words the due and updated cells", () => {
    expect([
      dueLabel("2026-07-15", "Todo"),
      dueLabel("2026-07-16", "In Progress"),
      dueLabel("2026-07-17", "Waiting"),
      dueLabel("2026-07-21", "In Progress"),
    ]).toEqual(["Overdue", "Today", "Tomorrow", "Jul 21"])
    expect([
      dueLabel("2026-07-13", "Done"),
      dueLabel("2026-07-15", "Todo", true),
      dueLabel(null, "Todo"),
    ]).toEqual(["Jul 13", "Jul 15", "--"])
    expect([
      updatedLabel(0),
      updatedLabel(16),
      updatedLabel(50),
      updatedLabel(192),
    ]).toEqual(["Just now", "16h ago", "2d ago", "8d ago"])
  })

  it("matches a task by its own fields or a sub-task's", () => {
    const rule = (field: string, value: string) => [
      {
        id: "r",
        field,
        operator: field === "task" ? "contains" : "is",
        values: [value],
      },
    ]
    expect(
      TASKS.filter((t) => passesTaskFilters(t, rule("task", "gate"), name)).map(
        (t) => t.id
      )
    ).toEqual(["task-7"])
    expect(
      TASKS.filter((t) =>
        passesTaskFilters(t, rule("task", "Valentina"), name)
      ).map((t) => t.id)
    ).toEqual(["task-1"])
    expect(
      TASKS.filter((t) =>
        passesTaskFilters(t, rule("assignee", "Unassigned"), name)
      ).map((t) => t.id)
    ).toEqual(["task-10"])
  })

  it("completes, reopens as Todo, marks waiting and archives", () => {
    let list = toggleDone(TASKS, "task-2")
    expect(list[1]).toMatchObject({
      status: "Done",
      done: true,
      statusDot: "bg-emerald-500",
      updatedHoursAgo: 0,
    })
    expect(tabCounts(list).open).toBe(8)
    list = toggleDone(list, "task-1-1")
    expect(list[0]!.subtasks[0]!.status).toBe("Todo")
    expect(list[0]!.updatedHoursAgo).toBe(0)
    expect(setStatus(TASKS, "task-2", "Waiting")[1]!.status).toBe("Waiting")
    expect(
      archiveTask(TASKS, "task-1-2")[0]!.subtasks.map((s) => s.id)
    ).toEqual(["task-1-1", "task-1-3"])
    expect(archiveTask(TASKS, "task-2")).toHaveLength(11)
  })

  it("makes a new task from the sheet", () => {
    expect(taskNameError("  ")).toBe("Enter a task name")
    expect(
      createdDescription(
        "In Progress",
        "High",
        "Kyle Bennett",
        "Graham Pritchard"
      )
    ).toBe("In Progress · High · Kyle Bennett · Graham Pritchard")
    const t = newTask("task-13", {
      title: " Call Graham back ",
      priority: "High",
      status: "Todo",
      assigneeId: "kyle-bennett",
      account: "Graham Pritchard",
      due: "Tomorrow",
      estimate: "2 hours",
    })
    expect(t).toMatchObject({
      title: "Call Graham back",
      due: "2026-07-17",
      estimate: "2h",
      updatedHoursAgo: 0,
      statusDot: "bg-sky-500",
    })
    expect(dueLabel(t.due, t.status)).toBe("Tomorrow")
  })
})

describe("opening a task in the sheet", () => {
  it("round-trips a task's own day and estimate, and saves over a sub-task", () => {
    const f = taskForm(TASKS[1]!)
    expect(f).toMatchObject({
      due: "2026-07-17",
      estimate: "15m",
      assigneeId: "meera-iyer",
    })
    const saved = editTask(TASKS, "task-2", {
      ...f,
      title: "Keep Joon Park signed",
      priority: "High",
    })
    expect(saved[1]).toMatchObject({
      title: "Keep Joon Park signed",
      priority: "High",
      due: "2026-07-17",
      estimate: "15m",
      updatedHoursAgo: 0,
    })
    expect(taskForm(TASKS[9]!).assigneeId).toBe("")
    const sub = editTask(TASKS, "task-1-3", {
      ...taskForm(TASKS[0]!.subtasks[2]!),
      status: "Done",
    })
    expect(sub[0]!.subtasks[2]!).toMatchObject({ status: "Done", done: true })
    expect(sub[0]!.updatedHoursAgo).toBe(0)
  })
})
