"use client"

import { HousePlusIcon, MapPinIcon } from "lucide-react"
import { useRef, useState } from "react"

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
import { toast } from "@/components/ui/toast"
import {
  DEAL_STAGES,
  DEAL_STATUS_DOT,
  DEAL_STATUSES,
  DEAL_TYPES,
  type Deal,
  type DealStageId,
  type DealStatus,
  type DealType,
} from "@/data/deals"
import { PLAN_NAMES, type PlanName } from "@/data/products"
import { SELLER_IDS, MARKETS, type Market, memberName } from "@/data/team"
import {
  type DealFormErrors,
  dealCreatedLine,
  dealFromForm,
  planValue,
  usd,
  validateDeal,
} from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const dot = (cls: string) => (
  <span
    className={cn("size-2 shrink-0 rounded-full", cls)}
    aria-hidden="true"
  />
)

/** The add-on select's empty choice */
const NO_ADD_ON = "none"

type Form = {
  household: string
  address: string
  type: DealType
  stage: DealStageId
  plan: PlanName
  addOn: PlanName | typeof NO_ADD_ON
  win: string
  owner: string
  date: string
  status: DealStatus
  office: Market
}
const BLANK: Form = {
  household: "",
  address: "",
  type: "New",
  stage: "lead",
  plan: "Quarterly Pest",
  addOn: NO_ADD_ON,
  win: "40",
  owner: SELLER_IDS[0],
  date: "",
  status: "New",
  office: "Boise",
}

/**
 * Add deal: a household on the board, in the stage picked (a column's "+" opens it on that stage). It checks the
 * homeowner, the address and the date; the value is the plans' first-year contract value. The typed values stay if
 * the sheet is dismissed; a created household clears the text fields and keeps the picks.
 */
export function DealAddSheet({
  open,
  onOpenChange,
  stage,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage?: DealStageId
  onCreate?: (deal: Deal) => void
}) {
  const [form, setForm] = useState<Form>(BLANK)
  // Ids for the households added this visit
  const added = useRef(0)
  // A column's "+" opens the sheet on its stage
  const [openedFor, setOpenedFor] = useState<DealStageId | undefined>(undefined)
  if (open && stage && openedFor !== stage) {
    setOpenedFor(stage)
    setForm((f) => ({ ...f, stage }))
  }
  if (!open && openedFor) setOpenedFor(undefined)
  const [submitted, setSubmitted] = useState(false)
  const errors: DealFormErrors = submitted ? validateDeal(form) : {}
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }))
  const addOn = form.addOn === NO_ADD_ON ? undefined : form.addOn
  const value = planValue(form.plan, addOn)

  const close = (next: boolean) => {
    if (!next) setSubmitted(false)
    onOpenChange(next)
  }

  const create = () => {
    setSubmitted(true)
    if (Object.keys(validateDeal(form)).length) return
    const picked = DEAL_STAGES.find((s) => s.id === form.stage)!
    toast.add({
      type: "success",
      title: "Household added",
      description: dealCreatedLine(picked.label, form.status, value, form.win),
    })
    onCreate?.(dealFromForm(`deal-new-${++added.current}`, { ...form, addOn }))
    setForm((f) => ({ ...BLANK, ...f, household: "", address: "", date: "" }))
    close(false)
  }

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            Add deal
          </SheetTitle>
          <SheetDescription>
            Put a household on the board with its plan, stage and odds.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5 *:data-[slot=field-group]:gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deal-household">Homeowner</FieldLabel>
                <Input
                  id="deal-household"
                  autoFocus
                  placeholder="e.g. Rosa Delgado"
                  value={form.household}
                  onChange={(e) => set("household", e.target.value)}
                  aria-invalid={!!errors.household}
                />
                {errors.household && (
                  <FieldError>{errors.household}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-type">Type</FieldLabel>
                <Select
                  value={form.type}
                  onValueChange={(v) => set("type", v as DealType)}
                >
                  <SelectTrigger id="deal-type" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="deal-address">Address</FieldLabel>
              <Input
                id="deal-address"
                autoComplete="off"
                placeholder="e.g. 3377 W Desert Willow Ln"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                aria-invalid={!!errors.address}
              />
              {errors.address && <FieldError>{errors.address}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deal-plan">Plan</FieldLabel>
                <Select
                  value={form.plan}
                  onValueChange={(v) => set("plan", v as PlanName)}
                >
                  <SelectTrigger id="deal-plan" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_NAMES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-add-on">Add-on</FieldLabel>
                <Select
                  value={form.addOn}
                  onValueChange={(v) => set("addOn", v as Form["addOn"])}
                >
                  <SelectTrigger id="deal-add-on" size="sm">
                    <SelectValue>
                      {(v: string) => (v === NO_ADD_ON ? "None" : v)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ADD_ON}>None</SelectItem>
                    {PLAN_NAMES.filter((p) => p !== form.plan).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="deal-stage">Stage</FieldLabel>
              <Select
                value={form.stage}
                onValueChange={(v) => set("stage", v as DealStageId)}
              >
                <SelectTrigger id="deal-stage" size="sm">
                  {dot(DEAL_STAGES.find((s) => s.id === form.stage)!.dot)}
                  <SelectValue>
                    {(v: DealStageId) =>
                      DEAL_STAGES.find((s) => s.id === v)?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {dot(s.dot)}
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deal-value">First-year value</FieldLabel>
                <Input
                  id="deal-value"
                  readOnly
                  value={usd(value)}
                  className="tabular-nums"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-win">Odds of service</FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="deal-win"
                    inputMode="numeric"
                    value={form.win}
                    onChange={(e) => set("win", e.target.value)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deal-owner">Rep</FieldLabel>
                <Select
                  value={form.owner}
                  onValueChange={(v) => set("owner", v as string)}
                >
                  <SelectTrigger id="deal-owner" size="sm">
                    <PersonAvatar
                      name={memberName(form.owner)}
                      className="size-4"
                    />
                    <SelectValue>{(v: string) => memberName(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SELLER_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        <PersonAvatar
                          name={memberName(id)}
                          className="size-4"
                        />
                        {memberName(id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-date">Next step</FieldLabel>
                <Input
                  id="deal-date"
                  placeholder="Jul 18, 2026"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  aria-invalid={!!errors.date}
                />
                {errors.date && <FieldError>{errors.date}</FieldError>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deal-status">Status</FieldLabel>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as DealStatus)}
                >
                  <SelectTrigger id="deal-status" size="sm">
                    {dot(DEAL_STATUS_DOT[form.status])}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {dot(DEAL_STATUS_DOT[s])}
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="deal-office">Office</FieldLabel>
                <Select
                  value={form.office}
                  onValueChange={(v) => set("office", v as Market)}
                >
                  <SelectTrigger id="deal-office" size="sm">
                    <MapPinIcon
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={create}>
              <HousePlusIcon data-icon="inline-start" />
              Add household
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
