"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type ProductStatus,
} from "@/data/products"
import {
  EMPTY_PRODUCT_FORM,
  type ProductForm,
  productErrors,
} from "@/lib/products"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<ProductStatus, string> = {
  Active: "bg-emerald-500",
  Draft: "bg-amber-500",
  Archived: "bg-rose-500",
}
const LEGEND = "text-[11px] tracking-wide text-muted-foreground uppercase"

/** The Add product sheet: basics, pricing (the initial service, the recurring charge and how often), availability */
export function ProductAddSheet({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (form: ProductForm) => void
}) {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? productErrors(form) : {}
  const set = (patch: Partial<ProductForm>) =>
    setForm((f) => ({ ...f, ...patch }))
  const close = (next: boolean) => {
    if (!next) {
      setForm(EMPTY_PRODUCT_FORM)
      setSubmitted(false)
    }
    onOpenChange(next)
  }
  const create = () => {
    setSubmitted(true)
    if (Object.keys(productErrors(form)).length) return
    onCreate(form)
    close(false)
  }
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="font-semibold tracking-tight">
            Add product
          </SheetTitle>
          <SheetDescription>
            Add a line reps can drop onto a quote.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-6 p-5">
            <FieldSet>
              <FieldLegend variant="label" className={LEGEND}>
                Basics
              </FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="product-name">Name</FieldLabel>
                  <Input
                    id="product-name"
                    placeholder="e.g. Spider Web Sweep"
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    aria-invalid={!!errors.name}
                    className="h-8 max-md:text-base"
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
                    <Input
                      id="product-sku"
                      placeholder="RPC-WEB"
                      autoCapitalize="characters"
                      value={form.sku}
                      onChange={(e) => set({ sku: e.target.value })}
                      className="max-md:text-base"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="product-category">Category</FieldLabel>
                    <Select
                      value={form.category}
                      onValueChange={(v) => v && set({ category: v })}
                    >
                      <SelectTrigger
                        id="product-category"
                        size="sm"
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label" className={LEGEND}>
                Pricing
              </FieldLegend>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="product-initial">Initial</FieldLabel>
                  <InputGroup className="h-7">
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="product-initial"
                      inputMode="numeric"
                      placeholder="149"
                      value={form.initial}
                      onChange={(e) => set({ initial: e.target.value })}
                      aria-invalid={!!errors.initial}
                      className="max-md:text-base"
                    />
                  </InputGroup>
                  {errors.initial && <FieldError>{errors.initial}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="product-price">Recurring</FieldLabel>
                  <InputGroup className="h-7">
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="product-price"
                      inputMode="numeric"
                      placeholder="119"
                      value={form.price}
                      onChange={(e) => set({ price: e.target.value })}
                      aria-invalid={!!errors.price}
                      className="max-md:text-base"
                    />
                  </InputGroup>
                  {errors.price && <FieldError>{errors.price}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="product-charges">Per year</FieldLabel>
                  <Input
                    id="product-charges"
                    inputMode="numeric"
                    placeholder="4"
                    value={form.charges}
                    onChange={(e) => set({ charges: e.target.value })}
                    aria-invalid={!!errors.charges}
                    className="max-md:text-base"
                  />
                  {errors.charges && <FieldError>{errors.charges}</FieldError>}
                </Field>
              </div>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label" className={LEGEND}>
                Availability
              </FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="product-status">Status</FieldLabel>
                  <Select
                    value={form.status}
                    onValueChange={(v) => v && set({ status: v })}
                  >
                    <SelectTrigger
                      id="product-status"
                      size="sm"
                      className="w-full"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          STATUS_DOT[form.status]
                        )}
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span
                            aria-hidden
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              STATUS_DOT[s]
                            )}
                          />
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="product-desc">Description</FieldLabel>
                  <Textarea
                    id="product-desc"
                    placeholder="What the technician does, and how often…"
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    className="min-h-20 max-md:text-base"
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="product-visible">
                      Visible on quotes
                    </FieldLabel>
                    <FieldDescription>
                      Reps can add it to a quote right away.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="product-visible"
                    checked={form.quotable}
                    onCheckedChange={(quotable) => set({ quotable })}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-5 py-3">
          <SheetClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </SheetClose>
          <Button size="sm" onClick={create}>
            <PlusIcon aria-hidden />
            Create product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
