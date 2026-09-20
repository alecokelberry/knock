"use client"

import {
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  FlagIcon,
  PlusIcon,
  TimerIcon,
} from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  TASK_ACCOUNTS,
  TASK_ASSIGNEE_IDS,
  TASK_DUE_CHOICES,
  TASK_ESTIMATES,
  TASK_PRIORITIES,
  TASK_STATUS_DOT,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/data/tasks"
import { memberName } from "@/data/team"
import { formatDay } from "@/lib/dates"
import { createdDescription, type NewTask, taskNameError } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const FLAG: Record<TaskPriority, string> = {
  Urgent: "text-destructive",
  High: "text-warning",
  Medium: "text-info",
  Low: "text-success",
}
const items = (list: readonly string[]) =>
  list.map((v) => ({ value: v, label: v }))
const UNASSIGNED = "unassigned"
const ASSIGNEES = TASK_ASSIGNEE_IDS.map((id) => ({
  value: id,
  label: memberName(id),
}))
const START = {
  title: "",
  description: "",
  priority: "Medium" as TaskPriority,
  status: "Todo" as TaskStatus,
  assigneeId: TASK_ASSIGNEE_IDS[0] ?? UNASSIGNED,
  account: TASK_ACCOUNTS[0] ?? "",
  due: "This week",
  estimate: "2 hours",
  today: false,
}
const personName = (id: string) =>
  id === UNASSIGNED ? "Unassigned" : memberName(id)

/**
 * The New task sheet: name (required), description, priority, status, assignee, related to, due, estimate, Today's
 * focus. Creating toasts and hands the task to the list. Given `editing` (a task's own values),
 * the same sheet opens that task and saves over it (a title click and View details open it).
 */
export function TaskSheet({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: NewTask | null
  onSubmit: (task: NewTask) => void
}) {
  const initial = editing
    ? { ...START, ...editing, assigneeId: editing.assigneeId || UNASSIGNED }
    : START
  const [f, setF] = useState(initial)
  // A task keeps its own day and estimate as the first choice ("Jul 21", "15m"); a sub-task has no estimate
  const dues = [
    ...(editing && /^\d/.test(editing.due)
      ? [{ value: editing.due, label: formatDay(editing.due) }]
      : []),
    ...items(TASK_DUE_CHOICES),
  ]
  const estimates = [
    ...(editing?.estimate && !TASK_ESTIMATES.includes(editing.estimate)
      ? [{ value: editing.estimate, label: editing.estimate }]
      : []),
    ...items(TASK_ESTIMATES),
  ]
  const assignees =
    editing && !editing.assigneeId
      ? [...ASSIGNEES, { value: UNASSIGNED, label: "Unassigned" }]
      : ASSIGNEES
  const withEstimate = !editing || !!editing.estimate
  const [submitted, setSubmitted] = useState(false)
  const set = <K extends keyof typeof START>(
    key: K,
    value: (typeof START)[K]
  ) => setF((x) => ({ ...x, [key]: value }))
  const error = submitted ? taskNameError(f.title) : null
  const close = (next: boolean) => {
    if (!next) {
      setF(initial)
      setSubmitted(false)
    }
    onOpenChange(next)
  }
  const create = () => {
    setSubmitted(true)
    if (taskNameError(f.title)) return
    onSubmit({
      ...f,
      assigneeId: f.assigneeId === UNASSIGNED ? "" : f.assigneeId,
    })
    toast.add({
      type: "success",
      title: editing ? "Task updated" : "Task created",
      description: createdDescription(
        f.status,
        f.priority,
        personName(f.assigneeId),
        f.account
      ),
    })
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            {editing ? "Task details" : "New task"}
          </SheetTitle>
          <SheetDescription>
            {editing
              ? "Update the task and route it to an owner."
              : "Add a follow-up or to-do and route it to an owner."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <form
            id="new-task"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              create()
            }}
          >
            <FieldGroup className="gap-5 p-5">
              <Field>
                <FieldLabel htmlFor="task-title">Task</FieldLabel>
                <Input
                  id="task-title"
                  autoFocus
                  placeholder="e.g. Call back Kenji Watanabe on Saturday"
                  value={f.title}
                  onChange={(e) => set("title", e.target.value)}
                  aria-invalid={!!error || undefined}
                  className="max-md:text-base"
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="task-desc">Description</FieldLabel>
                <Textarea
                  id="task-desc"
                  placeholder="Context, blockers, or the next step…"
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="min-h-20 max-md:text-base"
                />
              </Field>
              <Field>
                <FieldLabel>Priority</FieldLabel>
                <ToggleGroup
                  aria-label="Priority"
                  value={[f.priority]}
                  onValueChange={(v) =>
                    v[0] && set("priority", v[0] as TaskPriority)
                  }
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <ToggleGroupItem
                      key={p}
                      value={p}
                      className="min-w-0 flex-1 gap-1.5 px-2"
                    >
                      <FlagIcon
                        aria-hidden
                        className={cn("size-4 shrink-0", FLAG[p])}
                      />
                      {p}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="task-status">Status</FieldLabel>
                  <Select
                    items={items(TASK_STATUSES)}
                    value={f.status}
                    onValueChange={(v) => v && set("status", v)}
                  >
                    <SelectTrigger
                      id="task-status"
                      size="sm"
                      className="w-full"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          TASK_STATUS_DOT[f.status]
                        )}
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span
                            aria-hidden
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              TASK_STATUS_DOT[s]
                            )}
                          />
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="task-assignee">Assignee</FieldLabel>
                  <Select
                    items={assignees}
                    value={f.assigneeId}
                    onValueChange={(v) => v && set("assigneeId", v)}
                  >
                    <SelectTrigger
                      id="task-assignee"
                      size="sm"
                      className="w-full"
                    >
                      <PersonAvatar
                        name={personName(f.assigneeId)}
                        className="size-4 *:data-[slot=avatar-fallback]:text-[8px]"
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignees.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          <PersonAvatar
                            name={a.label}
                            className="size-4 *:data-[slot=avatar-fallback]:text-[8px]"
                          />
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="task-account">Related</FieldLabel>
                <Select
                  items={items(TASK_ACCOUNTS)}
                  value={f.account}
                  onValueChange={(v) => v && set("account", v)}
                >
                  <SelectTrigger id="task-account" size="sm" className="w-full">
                    <Building2Icon
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_ACCOUNTS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className={cn("grid gap-4", withEstimate && "grid-cols-2")}>
                <Field>
                  <FieldLabel htmlFor="task-due">Due</FieldLabel>
                  <Select
                    items={dues}
                    value={f.due}
                    onValueChange={(v) => v && set("due", v)}
                  >
                    <SelectTrigger id="task-due" size="sm" className="w-full">
                      <CalendarIcon
                        aria-hidden
                        className="size-4 text-muted-foreground"
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dues.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {withEstimate && (
                  <Field>
                    <FieldLabel htmlFor="task-estimate">Estimate</FieldLabel>
                    <Select
                      items={estimates}
                      value={f.estimate}
                      onValueChange={(v) => v && set("estimate", v)}
                    >
                      <SelectTrigger
                        id="task-estimate"
                        size="sm"
                        className="w-full"
                      >
                        <TimerIcon
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estimates.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>
              <FieldSeparator />
              <Field orientation="horizontal" className="items-center">
                <FieldContent>
                  <FieldLabel id="task-today-label" htmlFor="task-today">
                    Add to Today&apos;s focus
                  </FieldLabel>
                  <FieldDescription>
                    Surface this task at the top of the Today view.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="task-today"
                  aria-labelledby="task-today-label"
                  checked={f.today}
                  onCheckedChange={(v) => set("today", v)}
                />
              </Field>
            </FieldGroup>
          </form>
        </ScrollArea>
        <SheetFooter className="mt-auto shrink-0 gap-2 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button type="submit" form="new-task" size="sm">
              {editing ? <CheckIcon aria-hidden /> : <PlusIcon aria-hidden />}
              {editing ? "Save task" : "Create task"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
