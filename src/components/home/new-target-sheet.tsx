"use client"

import { PlusIcon, TargetIcon } from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
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
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ATT_SEGMENTS,
  ATT_VIEWS,
  type AttView,
  TARGET_HINT,
  TARGET_PERIOD,
  TARGET_PERIODS,
  TARGET_REPS,
} from "@/data/attainment"
import {
  money,
  stretchShare,
  targetAmount,
  targetError,
} from "@/lib/attainment"
import { cn } from "@/lib/utils"

const BAND = {
  comfortable: "**:data-[slot=progress-indicator]:bg-emerald-500",
  ambitious: "**:data-[slot=progress-indicator]:bg-amber-500",
  aggressive: "**:data-[slot=progress-indicator]:bg-red-500",
} as const

/** The New target sheet: office, week and rep, the accounts (its one check), the basis, and a meter against the stretch ceiling */
export function NewTargetSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [segment, setSegment] = useState(ATT_SEGMENTS[0]?.name ?? "")
  const [period, setPeriod] = useState(TARGET_PERIOD)
  const [rep, setRep] = useState<string | null>(TARGET_REPS[0] ?? null)
  const [amount, setAmount] = useState("")
  const [basis, setBasis] = useState<AttView>("Quota")
  const [submitted, setSubmitted] = useState(false)
  const error = submitted ? targetError(amount) : null
  const meter = stretchShare(amount)
  const close = (next: boolean) => {
    if (!next) {
      setSubmitted(false)
      setAmount("")
    }
    onOpenChange(next)
  }
  const create = () => {
    setSubmitted(true)
    if (targetError(amount)) return
    toast.add({
      type: "success",
      title: "Target created",
      description: `${rep ?? TARGET_REPS[0]} · ${segment} · ${period} · ${money(targetAmount(amount))} accounts`,
    })
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            New target
          </SheetTitle>
          <SheetDescription>
            Set a rep's serviced-account target for a coming week.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="target-segment">Office</FieldLabel>
                <Select
                  value={segment}
                  onValueChange={(v) => v && setSegment(v)}
                >
                  <SelectTrigger
                    id="target-segment"
                    size="sm"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATT_SEGMENTS.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="target-period">Week</FieldLabel>
                <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
                  <SelectTrigger
                    id="target-period"
                    size="sm"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_PERIODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="target-rep">Rep</FieldLabel>
              <Combobox items={TARGET_REPS} value={rep} onValueChange={setRep}>
                <ComboboxInput
                  id="target-rep"
                  placeholder="Search reps…"
                  className="h-7 w-full"
                />
                <ComboboxContent>
                  <ComboboxEmpty>No reps found.</ComboboxEmpty>
                  <ComboboxList>
                    {(r: string) => (
                      <ComboboxItem key={r} value={r}>
                        {r}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <Field>
              <FieldLabel htmlFor="target-amount">Serviced accounts</FieldLabel>
              <InputGroup className="h-7">
                <InputGroupInput
                  id="target-amount"
                  inputMode="numeric"
                  placeholder={TARGET_HINT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={!!error}
                  className="max-md:text-base"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>accounts</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Basis</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[basis]}
                onValueChange={(v) => v[0] && setBasis(v[0] as AttView)}
                className="grid w-full grid-cols-3 gap-2 *:w-full *:rounded-md! *:border-l!"
                aria-label="Basis"
              >
                {ATT_VIEWS.map((v) => (
                  <ToggleGroupItem
                    key={v}
                    value={v}
                    className="data-pressed:bg-muted"
                  >
                    {v}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TargetIcon aria-hidden className="size-3.5" />
                  Share of stretch ceiling
                </span>
                <span className="text-xs font-medium text-foreground tabular-nums">
                  {meter.share}%
                </span>
              </div>
              <Progress
                value={meter.share}
                aria-label="Share of stretch ceiling"
                className={cn("h-1.5", meter.band && BAND[meter.band])}
              />
              <p className="text-xs leading-4 text-muted-foreground">
                {meter.line}
              </p>
            </div>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={create}>
            <PlusIcon aria-hidden />
            Create target
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
