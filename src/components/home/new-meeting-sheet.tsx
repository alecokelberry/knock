"use client"

import { ClockIcon, PlusIcon, VideoIcon } from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  MEETING_ACCOUNTS,
  MEETING_DEFAULT_ATTENDEES,
  MEETING_DURATIONS,
  MEETING_LOCATIONS,
  MEETING_PEOPLE,
  MEETING_TYPES,
} from "@/data/today"
import { type MeetingDraft, meetingErrors, scheduledLine } from "@/lib/today"

const BLANK: MeetingDraft = {
  title: "",
  account: MEETING_ACCOUNTS[0],
  type: MEETING_TYPES[0],
  date: "",
  start: "",
  duration: "30 min",
  attendees: MEETING_DEFAULT_ATTENDEES,
  location: MEETING_LOCATIONS[0].value,
  agenda: "",
}

/**
 * The New meeting sheet (floating on the right): the meeting, its account and type, when and how long, who's
 * coming (chips), where, and the agenda. The name, date and start are required. Scheduling
 * closes it with a toast and adds the meeting to the day.
 */
export function NewMeetingSheet({
  open,
  onOpenChange,
  onSchedule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (d: MeetingDraft) => void
}) {
  const [form, setForm] = useState(BLANK)
  const [submitted, setSubmitted] = useState(false)
  const anchor = useComboboxAnchor()
  const errors = submitted ? meetingErrors(form) : {}
  const set = <K extends keyof MeetingDraft>(key: K, value: MeetingDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }))
  const close = (next: boolean) => {
    if (!next) setSubmitted(false)
    onOpenChange(next)
  }
  const schedule = () => {
    setSubmitted(true)
    if (Object.keys(meetingErrors(form)).length) return
    toast.add({
      type: "success",
      title: "Meeting scheduled",
      description: scheduledLine(form),
    })
    onSchedule(form)
    setForm(BLANK)
    close(false)
  }
  const location = MEETING_LOCATIONS.find((l) => l.value === form.location)!
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            New meeting
          </SheetTitle>
          <SheetDescription>
            Put a call on the calendar and set the agenda.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <Field>
              <FieldLabel htmlFor="meeting-title">Meeting</FieldLabel>
              <Input
                id="meeting-title"
                autoFocus
                placeholder="e.g. Saturday blitz — Cottonwood Bench"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                aria-invalid={!!errors.title}
                className="max-md:text-base"
              />
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="meeting-account">Where</FieldLabel>
                <Select
                  value={form.account}
                  onValueChange={(v) => set("account", String(v))}
                >
                  <SelectTrigger
                    id="meeting-account"
                    size="sm"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_ACCOUNTS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="meeting-type">Type</FieldLabel>
                <Select
                  value={form.type}
                  onValueChange={(v) => set("type", String(v))}
                >
                  <SelectTrigger id="meeting-type" size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="meeting-date">Date</FieldLabel>
                <Input
                  id="meeting-date"
                  placeholder="Jul 18, 2026"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  aria-invalid={!!errors.date}
                  className="max-md:text-base"
                />
                {errors.date && <FieldError>{errors.date}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="meeting-time">Start</FieldLabel>
                <Input
                  id="meeting-time"
                  placeholder="10:00 AM MT"
                  value={form.start}
                  onChange={(e) => set("start", e.target.value)}
                  aria-invalid={!!errors.start}
                  className="max-md:text-base"
                />
                {errors.start && <FieldError>{errors.start}</FieldError>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="meeting-duration">Duration</FieldLabel>
              <Select
                value={form.duration}
                onValueChange={(v) => set("duration", String(v))}
              >
                <SelectTrigger
                  id="meeting-duration"
                  size="sm"
                  className="w-full"
                >
                  <ClockIcon aria-hidden />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_DURATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-attendees">Attendees</FieldLabel>
              <Combobox
                items={MEETING_PEOPLE.map((p) => p.name)}
                multiple
                value={form.attendees}
                onValueChange={(v) => set("attendees", v)}
              >
                <ComboboxChips ref={anchor}>
                  {form.attendees.map((name) => (
                    <ComboboxChip key={name} aria-label={name}>
                      <PersonAvatar
                        name={name}
                        size="sm"
                        className="data-[size=sm]:size-3.5"
                      />
                      {name}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="meeting-attendees"
                    placeholder="Add attendees..."
                    className="max-md:text-base"
                  />
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No one found.</ComboboxEmpty>
                  <ComboboxList>
                    {(name: string) => {
                      const p = MEETING_PEOPLE.find((x) => x.name === name)!
                      return (
                        <ComboboxItem key={name} value={name} className="gap-2">
                          <PersonAvatar name={name} size="sm" />
                          <span className="grid leading-tight">
                            <span className="font-medium">{name}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.title}
                            </span>
                          </span>
                        </ComboboxItem>
                      )
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-location">Location</FieldLabel>
              <Select
                value={form.location}
                onValueChange={(v) => set("location", String(v))}
              >
                <SelectTrigger
                  id="meeting-location"
                  size="sm"
                  className="w-full"
                >
                  <VideoIcon aria-hidden />
                  <SelectValue>{() => location.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MEETING_LOCATIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-agenda">Agenda</FieldLabel>
              <Textarea
                id="meeting-agenda"
                placeholder="What this meeting needs to land…"
                value={form.agenda}
                onChange={(e) => set("agenda", e.target.value)}
                className="min-h-20 max-md:text-base"
              />
            </Field>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={schedule}>
            <PlusIcon aria-hidden />
            Schedule meeting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
