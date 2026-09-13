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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  APPROVER_NAMES,
  APPROVERS,
  REQUEST_TYPES,
  REQUESTER_NAMES,
  type RequestType,
} from "@/data/approvals"
import { type RequestForm, requestErrors } from "@/lib/approvals"

const EMPTY: RequestForm = {
  requester: REQUESTER_NAMES[0] ?? "",
  type: "Price override",
  account: "",
  quote: "",
  value: "",
  discount: "",
  approver: APPROVER_NAMES[0] ?? "",
  justification: "",
}

/** The New request sheet: who asks, what kind, for which home, for whom to sign, and why */
export function RequestSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: RequestForm) => void
}) {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? requestErrors(form) : {}
  const set = (patch: Partial<RequestForm>) =>
    setForm((f) => ({ ...f, ...patch }))
  const close = (next: boolean) => {
    if (!next) {
      // The last requester and approver stay for the next request; the rest starts over
      setForm((f) => ({
        ...EMPTY,
        requester: f.requester,
        approver: f.approver,
      }))
      setSubmitted(false)
    }
    onOpenChange(next)
  }
  const submit = () => {
    setSubmitted(true)
    if (Object.keys(requestErrors(form)).length) return
    onSubmit(form)
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            New request
          </SheetTitle>
          <SheetDescription>
            Send an exception to the desk for sign-off.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <Field>
              <FieldLabel htmlFor="req-requester">Requester</FieldLabel>
              <Select
                value={form.requester}
                onValueChange={(v) => v && set({ requester: v })}
              >
                <SelectTrigger id="req-requester" size="sm" className="w-full">
                  <PersonAvatar
                    name={form.requester}
                    size="sm"
                    className="data-[size=sm]:size-4"
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUESTER_NAMES.map((r) => (
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
            <Field>
              <FieldLabel>Request type</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={2}
                value={[form.type]}
                onValueChange={(v) =>
                  v[0] && set({ type: v[0] as RequestType })
                }
                aria-label="Request type"
                className="grid w-full grid-cols-2"
              >
                {REQUEST_TYPES.map((t) => (
                  <ToggleGroupItem
                    key={t}
                    value={t}
                    className="w-full min-w-0 px-2"
                  >
                    {t}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="req-account">Homeowner</FieldLabel>
                <Input
                  id="req-account"
                  placeholder="Harriet Lawson"
                  value={form.account}
                  onChange={(e) => set({ account: e.target.value })}
                  aria-invalid={!!errors.account}
                  className="max-md:text-base"
                />
                {errors.account && <FieldError>{errors.account}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="req-quote">Quote</FieldLabel>
                <Input
                  id="req-quote"
                  placeholder="Q-2041"
                  autoCapitalize="characters"
                  value={form.quote}
                  onChange={(e) => set({ quote: e.target.value })}
                  className="max-md:text-base"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="req-value">Amount</FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="req-value"
                    inputMode="numeric"
                    placeholder="1,039"
                    value={form.value}
                    onChange={(e) => set({ value: e.target.value })}
                    aria-invalid={!!errors.value}
                    className="max-md:text-base"
                  />
                </InputGroup>
                {errors.value && <FieldError>{errors.value}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="req-discount">Price off</FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="req-discount"
                    inputMode="decimal"
                    placeholder="15"
                    value={form.discount}
                    onChange={(e) => set({ discount: e.target.value })}
                    aria-invalid={!!errors.discount}
                    className="max-md:text-base"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {errors.discount && <FieldError>{errors.discount}</FieldError>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="req-approver">Approver</FieldLabel>
              <Select
                value={form.approver}
                onValueChange={(v) => v && set({ approver: v })}
              >
                <SelectTrigger id="req-approver" size="sm" className="w-full">
                  <PersonAvatar
                    name={form.approver}
                    size="sm"
                    className="data-[size=sm]:size-4"
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVER_NAMES.map((a) => (
                    <SelectItem key={a} value={a}>
                      <PersonAvatar
                        name={a}
                        size="sm"
                        className="data-[size=sm]:size-4"
                      />
                      <span className="flex flex-col">
                        <span>{a}</span>
                        <span className="text-xs text-muted-foreground">
                          {APPROVERS[a]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="req-justification">Justification</FieldLabel>
              <Textarea
                id="req-justification"
                placeholder="Why the desk should sign this off…"
                value={form.justification}
                onChange={(e) => set({ justification: e.target.value })}
                aria-invalid={!!errors.justification}
                className="min-h-24 max-md:text-base"
              />
              {errors.justification && (
                <FieldError>{errors.justification}</FieldError>
              )}
            </Field>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-5 py-3">
          <SheetClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </SheetClose>
          <Button size="sm" onClick={submit}>
            <PlusIcon aria-hidden />
            Submit request
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
