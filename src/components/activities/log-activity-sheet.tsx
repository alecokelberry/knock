"use client"

import {
  CalendarIcon,
  FileTextIcon,
  MailIcon,
  PlusIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ACTIVITY_OUTCOMES,
  ACTIVITY_TYPES,
  ACTIVITY_WHEN,
} from "@/data/activities"
import { ACTIVITY_OWNER_IDS, memberName, TEAM_BY_ID } from "@/data/team"
import {
  type LoggedActivity,
  loggedDescription,
  OUTCOME_DOT,
} from "@/lib/activities"

const TYPE_ICON = {
  Call: SmartphoneIcon,
  Email: MailIcon,
  Meeting: CalendarIcon,
  Note: FileTextIcon,
} as const
const owners = ACTIVITY_OWNER_IDS.map((id) => ({
  value: id,
  label: memberName(id),
}))
const item = (list: string[]) => list.map((v) => ({ value: v, label: v }))

/**
 * The Log activity sheet: type, summary, notes, outcome, owner, homeowner, address, when and time. Logging toasts, as
 * usual; where the page keeps a list (All Activities), `onLog` also lands the touch in it.
 */
export function LogActivitySheet({
  open,
  onOpenChange,
  onLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLog?: (activity: LoggedActivity) => void
}) {
  const [type, setType] = useState("Knock")
  const [summary, setSummary] = useState("")
  const [touched, setTouched] = useState(false)
  const [notes, setNotes] = useState("")
  const [outcome, setOutcome] = useState("Logged")
  const [owner, setOwner] = useState("julia-serrano")
  const [household, setHousehold] = useState("")
  const [address, setAddress] = useState("")
  const [when, setWhen] = useState("Today")
  const [time, setTime] = useState("")

  const reset = () => {
    setType("Knock")
    setSummary("")
    setTouched(false)
    setNotes("")
    setOutcome("Logged")
    setOwner("julia-serrano")
    setHousehold("")
    setAddress("")
    setWhen("Today")
    setTime("")
  }
  const invalid = touched && summary.trim() === ""

  function submit() {
    setTouched(true)
    if (summary.trim() === "") return
    onLog?.({
      type,
      summary,
      notes,
      outcome,
      ownerId: owner,
      ownerRole: TEAM_BY_ID[owner]?.activityRole ?? "",
      household,
      address,
      when,
      time,
    })
    toast.add({
      type: "success",
      title: "Activity logged",
      description: loggedDescription(type, outcome, memberName(owner)),
      timeout: 4000,
    })
    onOpenChange(false)
    reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            Log activity
          </SheetTitle>
          <SheetDescription>
            Record a knock, callback or service against the home it moved.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <form
            id="log-activity"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            className="@container/field-group flex w-full flex-col gap-5 p-5"
          >
            <Field>
              <FieldLabel>Type</FieldLabel>
              <ToggleGroup
                aria-label="Activity type"
                value={[type]}
                onValueChange={(v) => v[0] && setType(v[0])}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {ACTIVITY_TYPES.map((t) => {
                  const Icon = TYPE_ICON[t as keyof typeof TYPE_ICON]
                  return (
                    <ToggleGroupItem
                      key={t}
                      value={t}
                      className="min-w-0 flex-1 gap-1.5 px-2"
                    >
                      <Icon className="size-4" />
                      {t}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="log-summary">Summary</FieldLabel>
              <Input
                id="log-summary"
                autoFocus
                placeholder="e.g. Pitched, callback set for Saturday"
                value={summary}
                aria-invalid={invalid || undefined}
                onChange={(e) => setSummary(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              {invalid && <FieldError>Enter a summary</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="log-notes">Notes</FieldLabel>
              <Textarea
                id="log-notes"
                placeholder="Outcome, next step, or context…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="log-outcome">Outcome</FieldLabel>
                <Select
                  items={item(ACTIVITY_OUTCOMES)}
                  value={outcome}
                  onValueChange={(v) => v && setOutcome(v)}
                >
                  <SelectTrigger id="log-outcome" size="sm" className="w-full">
                    <span
                      className={`size-2 rounded-full ${OUTCOME_DOT[outcome]}`}
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger>
                    {ACTIVITY_OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o}>
                        <span
                          className={`size-2 shrink-0 rounded-full ${OUTCOME_DOT[o]}`}
                        />
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="log-owner">Owner</FieldLabel>
                <Select
                  items={owners}
                  value={owner}
                  onValueChange={(v) => v && setOwner(v)}
                >
                  <SelectTrigger id="log-owner" size="sm" className="w-full">
                    <PersonAvatar
                      name={memberName(owner)}
                      className="size-4 *:data-[slot=avatar-fallback]:text-[8px]"
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        <PersonAvatar
                          name={o.label}
                          className="size-4 *:data-[slot=avatar-fallback]:text-[8px]"
                        />
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="log-household">Homeowner</FieldLabel>
                <Input
                  id="log-household"
                  placeholder="Harriet Lawson"
                  value={household}
                  onChange={(e) => setHousehold(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="log-address">Address</FieldLabel>
                <Input
                  id="log-address"
                  placeholder="612 N Cottonwood Bench Rd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="log-when">When</FieldLabel>
                <Select
                  items={item(ACTIVITY_WHEN)}
                  value={when}
                  onValueChange={(v) => v && setWhen(v)}
                >
                  <SelectTrigger id="log-when" size="sm" className="w-full">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_WHEN.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="log-time">Time</FieldLabel>
                <Input
                  id="log-time"
                  placeholder="9:12 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>
            </div>
          </form>
        </ScrollArea>
        <SheetFooter className="mt-auto gap-2 border-t px-5 py-3">
          <div className="flex justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button type="submit" form="log-activity" size="sm">
              <PlusIcon />
              Log activity
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
