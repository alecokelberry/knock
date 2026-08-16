"use client"

import { CalendarClockIcon, CheckIcon } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FOLLOW_UP_DUE } from "@/data/activity-feed"
import { ACTIVITY_OWNER_IDS, memberName } from "@/data/team"
import { followUpError, followUpLine } from "@/lib/activity-feed"

/** The Add follow-up sheet: the next step (required), when it's due, whose it is, a reminder, a note */
export function FollowUpSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState("")
  const [due, setDue] = useState<string>("Tomorrow")
  const [owner, setOwner] = useState(ACTIVITY_OWNER_IDS[0] ?? "")
  const [remind, setRemind] = useState(true)
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const error = submitted ? followUpError(step) : null
  const close = (next: boolean) => {
    if (!next) {
      setSubmitted(false)
      setStep("")
      setNote("")
    }
    onOpenChange(next)
  }
  const schedule = () => {
    setSubmitted(true)
    if (followUpError(step)) return
    toast.add({
      type: "success",
      title: "Follow-up scheduled",
      description: followUpLine(due, memberName(owner), remind),
    })
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            Add follow-up
          </SheetTitle>
          <SheetDescription>
            Line up the next step so it doesn&apos;t slip.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <Field>
              <FieldLabel htmlFor="followup-step">Next step</FieldLabel>
              <Input
                id="followup-step"
                autoFocus
                placeholder="e.g. Bring the termite sheet to the callback"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                aria-invalid={!!error}
                className="max-md:text-base"
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Due</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[due]}
                onValueChange={(v) => v[0] && setDue(v[0])}
                className="grid w-full grid-cols-4 gap-2 *:w-full *:rounded-md! *:border-l!"
                aria-label="Due"
              >
                {FOLLOW_UP_DUE.map((d) => (
                  <ToggleGroupItem
                    key={d}
                    value={d}
                    className="gap-1.5 data-pressed:bg-muted [&_svg]:size-4"
                  >
                    <CalendarClockIcon aria-hidden />
                    {d}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="followup-owner">Owner</FieldLabel>
              <Select value={owner} onValueChange={(v) => setOwner(String(v))}>
                <SelectTrigger id="followup-owner" size="sm" className="w-full">
                  <PersonAvatar
                    name={memberName(owner)}
                    size="sm"
                    className="data-[size=sm]:size-4"
                  />
                  <SelectValue>{(v: string) => memberName(v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OWNER_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      <PersonAvatar
                        name={memberName(id)}
                        size="sm"
                        className="data-[size=sm]:size-4"
                      />
                      {memberName(id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="followup-remind">Remind me</FieldLabel>
                <FieldDescription>
                  Ping the owner the morning it&apos;s due.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="followup-remind"
                checked={remind}
                onCheckedChange={setRemind}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="followup-note">Note</FieldLabel>
              <Textarea
                id="followup-note"
                placeholder="Anything the owner needs to know…"
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
          <Button size="sm" onClick={schedule}>
            <CheckIcon aria-hidden />
            Schedule follow-up
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
