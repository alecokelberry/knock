"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  LOG_ACCOUNTS,
  LOG_REPS,
  TIME_CATEGORIES,
  TIME_TODAY,
  type TimeCategory,
  type WorkDay,
} from "@/data/quick-stats"
import { fmt, localDate } from "@/lib/dates"
import {
  addLog,
  logErrors,
  logLine,
  mondayOf,
  parseLogDate,
} from "@/lib/quick-stats"
import { cn } from "@/lib/utils"

const CATEGORY_DOT = {
  Doors: "bg-emerald-500",
  Training: "bg-sky-500",
  Office: "bg-violet-500",
} as const

/** A saved log, as the week it changes: that person's Monday-to-Saturday with the hours added */
export type NewLog = { monday: string; rep: string; days: (WorkDay | null)[] }

/**
 * The New log sheet: who, when, how long (the two it checks), what kind, where, a note. The hours land on that day
 * on Hours by Rep when the date falls on a work day.
 */
export function NewLogSheet({
  open,
  onOpenChange,
  logs,
  onLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: Record<string, Record<string, (WorkDay | null)[]>>
  onLog: (log: NewLog) => void
}) {
  const [rep, setRep] = useState(LOG_REPS[0] ?? "")
  const [date, setDate] = useState("")
  const [hours, setHours] = useState("")
  const [category, setCategory] = useState<TimeCategory>("Doors")
  const [account, setAccount] = useState(LOG_ACCOUNTS[0] ?? "")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? logErrors(date, hours) : {}
  const close = (next: boolean) => {
    if (!next) {
      setSubmitted(false)
      setDate("")
      setHours("")
      setNote("")
    }
    onOpenChange(next)
  }
  const save = () => {
    setSubmitted(true)
    if (Object.keys(logErrors(date, hours)).length) return
    const h = Number(hours)
    const day = parseLogDate(date)
    const weekday = day ? localDate(day).getDay() - 1 : -1
    if (day && weekday >= 0 && weekday < 6) {
      const monday = mondayOf(day)
      onLog({
        monday,
        rep,
        days: addLog(
          logs[monday]?.[rep],
          weekday,
          h,
          category,
          note.trim() || account
        ),
      })
    }
    toast.add({
      type: "success",
      title: "Time logged",
      description: logLine(rep, h, category, account),
    })
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            New log
          </SheetTitle>
          <SheetDescription>
            Log a day on the doors, in training or at the office.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <Field>
              <FieldLabel htmlFor="log-person">Rep</FieldLabel>
              <Select value={rep} onValueChange={(v) => v && setRep(v)}>
                <SelectTrigger id="log-person" size="sm" className="w-full">
                  <PersonAvatar
                    name={rep}
                    size="sm"
                    className="data-[size=sm]:size-4"
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_REPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      <PersonAvatar
                        name={r}
                        size="sm"
                        className="data-[size=sm]:size-4"
                      />
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="log-date">Date</FieldLabel>
                <Input
                  id="log-date"
                  placeholder={fmt.dayYear.format(localDate(TIME_TODAY))}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={!!errors.date}
                  className="max-md:text-base"
                />
                {errors.date && <FieldError>{errors.date}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="log-hours">Hours</FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="log-hours"
                    inputMode="decimal"
                    placeholder="6.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    aria-invalid={!!errors.hours}
                    className="max-md:text-base"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>h</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {errors.hours && <FieldError>{errors.hours}</FieldError>}
              </Field>
            </div>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[category]}
                onValueChange={(v) => v[0] && setCategory(v[0] as TimeCategory)}
                className="grid w-full grid-cols-3 gap-2 *:w-full *:rounded-md! *:border-l!"
                aria-label="Category"
              >
                {TIME_CATEGORIES.map((c) => (
                  <ToggleGroupItem
                    key={c}
                    value={c}
                    className="gap-1.5 data-pressed:bg-muted"
                  >
                    <span
                      aria-hidden
                      className={cn("size-2 rounded-full", CATEGORY_DOT[c])}
                    />
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="log-account">Where</FieldLabel>
              <Select value={account} onValueChange={(v) => v && setAccount(v)}>
                <SelectTrigger id="log-account" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_ACCOUNTS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="log-note">Note</FieldLabel>
              <Textarea
                id="log-note"
                placeholder="What the time went to…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-20 max-md:text-base"
              />
            </Field>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            <PlusIcon aria-hidden />
            Save log
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
