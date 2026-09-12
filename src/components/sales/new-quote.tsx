"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import {
  ArrowLeftIcon,
  HouseIcon,
  CalendarIcon,
  CircleCheckIcon,
  HashIcon,
  InfoIcon,
  MegaphoneIcon,
  PlusIcon,
  ReceiptIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  COLLECTIONS,
  NEW_QUOTE,
  PAYMENT_TERMS,
  QUOTE_CUSTOMERS,
  QUOTE_ITEMS,
  QUOTE_FIELD_TIPS,
  type QuoteCurrency,
  type QuoteLine,
  TAX_RATES,
} from "@/data/quotes"
import { fmt, isoDate, localDate } from "@/lib/dates"
import {
  formatMoney,
  lineAmount,
  nextQuoteNumber,
  quoteFormErrors,
  quoteFromForm,
  quoteTotals,
} from "@/lib/quotes"
import { cn } from "@/lib/utils"

import { BADGE } from "./quote-badges"
import { updateQuotes, useQuotes } from "./quotes-store"

/** The lines a quote can carry: each quotable plan's initial and recurring charge, and the one-time services */
const CATALOG = QUOTE_ITEMS
const SYMBOL: Record<QuoteCurrency, string> = { USD: "$" }
const taxLabel = (t: number) => (t === 0 ? "No tax" : `${t}%`)
const FORM_ID = "new-quote-form"

/** Pipeline → Quotes → New quote: a price for a home, line by line, saved or sent into the ledger */
export function NewQuote() {
  const router = useRouter()
  const quotes = useQuotes()
  const taken = quotes.map((q) => q.id)
  const [customer, setCustomer] = useState<string | null>(NEW_QUOTE.customer)
  const [account, setAccount] = useState(NEW_QUOTE.account)
  const [number, setNumber] = useState(() =>
    nextQuoteNumber(taken, NEW_QUOTE.number)
  )
  const [po, setPo] = useState(NEW_QUOTE.po)
  const [issued, setIssued] = useState(NEW_QUOTE.issued)
  const [validUntil, setValidUntil] = useState(NEW_QUOTE.validUntil)
  const currency: QuoteCurrency = NEW_QUOTE.currency
  const [terms, setTerms] = useState(NEW_QUOTE.terms)
  const [collection, setCollection] = useState(NEW_QUOTE.collection)
  const [billing, setBilling] = useState(NEW_QUOTE.billing)
  const [lines, setLines] = useState<QuoteLine[]>(NEW_QUOTE.lines)
  const [memo, setMemo] = useState(NEW_QUOTE.memo)
  const [footer, setFooter] = useState(NEW_QUOTE.footer)
  const [discount, setDiscount] = useState(NEW_QUOTE.discount)
  const [submitted, setSubmitted] = useState(false)
  const nextLine = useRef(NEW_QUOTE.lines.length)
  const errors = submitted
    ? quoteFormErrors({ customer, number, billing }, taken)
    : {}
  const totals = quoteTotals(lines, discount)
  const money = (n: number) => formatMoney(n, currency)
  const setLine = (id: string, patch: Partial<QuoteLine>) =>
    setLines((all) => all.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  // Save draft and Send quote put the quote in the ledger and go back to it
  const save = (status: "Draft" | "Sent") => {
    setSubmitted(true)
    if (
      Object.keys(quoteFormErrors({ customer, number, billing }, taken)).length
    )
      return
    const home = QUOTE_CUSTOMERS.find((c) => c.name === customer)!
    updateQuotes((all) => [
      quoteFromForm(
        { customer: home, number, po, issued, validUntil, lines, discount },
        status,
        CATALOG
      ),
      ...all,
    ])
    if (status === "Draft")
      toast.add({
        type: "success",
        title: "Quote draft saved",
        description: "The lines and terms are saved for this visit.",
      })
    else
      toast.add({
        type: "success",
        title: "Quote sent",
        description:
          "The price is on its way to the homeowner by text and email.",
      })
    router.push("/quotes")
  }

  return (
    <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-3 text-foreground">
      <h1 className="sr-only">New quote</h1>
      <div>
        <Link
          href="/quotes"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ms-2"
          )}
        >
          <ArrowLeftIcon aria-hidden data-icon="inline-start" />
          Back to quotes
        </Link>
      </div>
      <section aria-label="Quote">
        <div className="flex w-full flex-col">
          <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-sm leading-5 font-semibold">
                Create quote
              </h2>
              <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
                Price a home from Ridgeline's plans and leave it with the
                homeowner.
              </p>
            </div>
            <div
              role="group"
              aria-label="Quote actions"
              className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end"
            >
              <FeedbackButton />
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => save("Draft")}
              >
                <SaveIcon aria-hidden data-icon="inline-start" />
                Save draft
              </Button>
              <Button type="submit" form={FORM_ID} size="sm">
                <SendIcon aria-hidden data-icon="inline-start" />
                Send quote
              </Button>
            </div>
          </header>
          <div className="flex flex-1 pt-5">
            <form
              id={FORM_ID}
              noValidate
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault()
                save("Sent")
              }}
            >
              <Card className="gap-0 p-0">
                <CardHeader className="gap-1 px-5 py-5 sm:px-6">
                  <CardTitle>Quote Details</CardTitle>
                  <CardDescription>
                    Account, terms, line items, and notes.
                  </CardDescription>
                  <CardAction className="flex items-center gap-1.5 self-center">
                    <Badge variant="warning-light" className={BADGE}>
                      <ReceiptIcon aria-hidden />
                      Draft
                    </Badge>
                    <Badge
                      variant="primary-outline"
                      className={`${BADGE} hidden sm:inline-flex`}
                    >
                      {currency}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col gap-7 px-5 py-5 sm:px-6 sm:py-6">
                  <FieldSet className="gap-0">
                    <FieldLegend className="sr-only">Quote form</FieldLegend>
                    <FieldDescription className="sr-only">
                      Build a quote against a deal, with terms, line items and
                      notes.
                    </FieldDescription>
                    <FieldGroup className="gap-7">
                      <Part
                        title="Customer"
                        badge={
                          <Badge variant="success-light" className={BADGE}>
                            Required
                          </Badge>
                        }
                        description="The account and the deal this quote is for."
                      >
                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <LabelTip
                              htmlFor="quote-customer"
                              label="Customer"
                              tip={QUOTE_FIELD_TIPS.customer}
                            />
                            <Combobox
                              items={QUOTE_CUSTOMERS.map((c) => c.name)}
                              value={customer}
                              onValueChange={(v) => setCustomer(v ?? null)}
                            >
                              <ComboboxInput
                                id="quote-customer"
                                placeholder="Find a homeowner..."
                                aria-invalid={!!errors.customer}
                                className="h-7 w-full max-md:[&_input]:text-base"
                              >
                                {/* The vendored clear button has no name; this one says what it clears */}
                                {customer && (
                                  <InputGroupAddon
                                    align="inline-end"
                                    className="-ms-2"
                                  >
                                    <ComboboxPrimitive.Clear
                                      data-slot="combobox-clear"
                                      aria-label="Clear customer"
                                      render={
                                        <InputGroupButton
                                          variant="ghost"
                                          size="icon-xs"
                                        />
                                      }
                                    >
                                      <XIcon
                                        aria-hidden
                                        className="pointer-events-none"
                                      />
                                    </ComboboxPrimitive.Clear>
                                  </InputGroupAddon>
                                )}
                              </ComboboxInput>
                              <ComboboxContent>
                                <ComboboxEmpty>
                                  No homeowners found.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  {(name: string) => {
                                    const c = QUOTE_CUSTOMERS.find(
                                      (x) => x.name === name
                                    )!
                                    return (
                                      <ComboboxItem key={name} value={name}>
                                        <span className="flex min-w-0 flex-col">
                                          <span className="truncate">
                                            {c.name}
                                          </span>
                                          <span className="truncate text-xs text-muted-foreground">
                                            {c.email}
                                          </span>
                                        </span>
                                      </ComboboxItem>
                                    )
                                  }}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                            {errors.customer && (
                              <FieldError>{errors.customer}</FieldError>
                            )}
                          </Field>
                          <Field>
                            <LabelTip
                              htmlFor="quote-account"
                              label="Ridgeline Account"
                              tip={QUOTE_FIELD_TIPS.account}
                            />
                            <InputGroup className="h-7">
                              <InputGroupAddon>
                                <HouseIcon aria-hidden />
                              </InputGroupAddon>
                              <InputGroupInput
                                id="quote-account"
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                                className="max-md:text-base"
                              />
                            </InputGroup>
                          </Field>
                          <Field>
                            <LabelTip
                              htmlFor="quote-number"
                              label="Quote Number"
                              tip={QUOTE_FIELD_TIPS.number}
                            />
                            <InputGroup className="h-7">
                              <InputGroupAddon>
                                <HashIcon aria-hidden />
                              </InputGroupAddon>
                              <InputGroupInput
                                id="quote-number"
                                value={number}
                                aria-invalid={!!errors.number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="max-md:text-base"
                              />
                            </InputGroup>
                            {errors.number && (
                              <FieldError>{errors.number}</FieldError>
                            )}
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="quote-po">
                              Household
                            </FieldLabel>
                            <Input
                              id="quote-po"
                              value={po}
                              onChange={(e) => setPo(e.target.value)}
                            />
                          </Field>
                        </FieldGroup>
                      </Part>
                      <Separator />
                      <Part
                        title="Terms"
                        badge={
                          <Badge variant="info-light" className={BADGE}>
                            {terms}
                          </Badge>
                        }
                        description="Dates, billing and how it's paid."
                      >
                        <FieldGroup className="grid gap-4 md:grid-cols-3">
                          <DateField
                            id="quote-issued"
                            label="Issue Date"
                            pick="issue date"
                            value={issued}
                            onChange={setIssued}
                          />
                          <DateField
                            id="quote-valid"
                            label="Valid Until"
                            pick="valid-until date"
                            value={validUntil}
                            onChange={setValidUntil}
                          />
                          <Field>
                            <FieldLabel htmlFor="quote-terms">
                              Payment Terms
                            </FieldLabel>
                            <Select
                              value={terms}
                              onValueChange={(v) => v && setTerms(v)}
                            >
                              <SelectTrigger
                                id="quote-terms"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_TERMS.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="quote-collection">
                              Collection
                            </FieldLabel>
                            <Select
                              value={collection}
                              onValueChange={(v) => v && setCollection(v)}
                            >
                              <SelectTrigger
                                id="quote-collection"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLLECTIONS.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="quote-billing">
                              Service Address
                            </FieldLabel>
                            <Input
                              id="quote-billing"
                              value={billing}
                              aria-invalid={!!errors.billing}
                              onChange={(e) => setBilling(e.target.value)}
                            />
                            {errors.billing && (
                              <FieldError>{errors.billing}</FieldError>
                            )}
                          </Field>
                        </FieldGroup>
                      </Part>
                      <Separator />
                      <Part
                        title="Line Items"
                        badge={
                          <Badge variant="secondary" className={BADGE}>
                            {lines.length}{" "}
                            {lines.length === 1 ? "item" : "items"}
                          </Badge>
                        }
                        description="Plans and services, how many charges, tax and amount."
                        action={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const item =
                                CATALOG.find((p) => p.id === "msq-season") ??
                                CATALOG[0]
                              if (!item) return
                              setLines((all) => [
                                ...all,
                                {
                                  id: `line-${++nextLine.current}`,
                                  productId: item.id,
                                  qty: String(item.qty),
                                  rate: String(item.price),
                                  tax: all[0]?.tax ?? 0,
                                },
                              ])
                            }}
                          >
                            <PlusIcon aria-hidden data-icon="inline-start" />
                            Add item
                          </Button>
                        }
                      >
                        <Table
                          className="min-w-[820px]"
                          aria-label="Quote line items"
                        >
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[42%] ps-0">
                                Item
                              </TableHead>
                              <TableHead className="w-24">Qty</TableHead>
                              <TableHead className="w-36">Rate</TableHead>
                              <TableHead className="w-32">Tax</TableHead>
                              <TableHead className="w-32 text-end">
                                Amount
                              </TableHead>
                              <TableHead className="w-10 pe-0">
                                <span className="sr-only">Remove</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lines.map((l, i) => {
                              const item = CATALOG.find(
                                (p) => p.id === l.productId
                              )!
                              return (
                                <TableRow key={l.id}>
                                  <TableCell className="ps-0 align-middle">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <Select
                                        items={CATALOG.map((p) => ({
                                          value: p.id,
                                          label: p.name,
                                        }))}
                                        value={l.productId}
                                        onValueChange={(v) => {
                                          const p =
                                            v && CATALOG.find((x) => x.id === v)
                                          if (p)
                                            setLine(l.id, {
                                              productId: p.id,
                                              qty: String(p.qty),
                                              rate: String(p.price),
                                            })
                                        }}
                                      >
                                        <SelectTrigger
                                          aria-label={`Item for line ${i + 1}`}
                                          className="w-full min-w-0 flex-1"
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CATALOG.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                              {p.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Tip
                                        label={`${item.name} details`}
                                        tip={item.note}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-middle">
                                    <Input
                                      type="number"
                                      min={1}
                                      step={1}
                                      aria-label={`Quantity for ${item.name}`}
                                      value={l.qty}
                                      onChange={(e) =>
                                        setLine(l.id, { qty: e.target.value })
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell className="align-middle">
                                    <InputGroup className="h-7">
                                      <InputGroupAddon>
                                        {SYMBOL[currency]}
                                      </InputGroupAddon>
                                      <InputGroupInput
                                        type="number"
                                        min={0}
                                        step={1}
                                        aria-label={`Rate for ${item.name}`}
                                        value={l.rate}
                                        onChange={(e) =>
                                          setLine(l.id, {
                                            rate: e.target.value,
                                          })
                                        }
                                      />
                                    </InputGroup>
                                  </TableCell>
                                  <TableCell className="align-middle">
                                    <Select
                                      items={TAX_RATES.map((t) => ({
                                        value: String(t),
                                        label: taxLabel(t),
                                      }))}
                                      value={String(l.tax)}
                                      onValueChange={(v) =>
                                        v && setLine(l.id, { tax: Number(v) })
                                      }
                                    >
                                      <SelectTrigger
                                        aria-label={`Tax rate for ${item.name}`}
                                        className="w-24"
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {TAX_RATES.map((t) => (
                                          <SelectItem key={t} value={String(t)}>
                                            {taxLabel(t)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-end align-middle font-medium tabular-nums">
                                    <span className="inline-flex min-h-9 items-center justify-end">
                                      {money(lineAmount(l))}
                                    </span>
                                  </TableCell>
                                  <TableCell className="pe-0 text-end align-middle">
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Remove ${item.name}`}
                                      disabled={lines.length === 1}
                                      onClick={() =>
                                        setLines((all) =>
                                          all.filter((x) => x.id !== l.id)
                                        )
                                      }
                                    >
                                      <Trash2Icon aria-hidden />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </Part>
                      <Separator />
                      <Part
                        title="Notes"
                        badge={
                          <Badge variant="secondary" className={BADGE}>
                            Optional
                          </Badge>
                        }
                        description="Customer-facing memo and payment footer."
                      >
                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor="quote-memo">Memo</FieldLabel>
                            <Textarea
                              id="quote-memo"
                              value={memo}
                              onChange={(e) => setMemo(e.target.value)}
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="quote-footer">
                              Footer Note
                            </FieldLabel>
                            <Textarea
                              id="quote-footer"
                              value={footer}
                              onChange={(e) => setFooter(e.target.value)}
                            />
                          </Field>
                        </FieldGroup>
                      </Part>
                    </FieldGroup>
                  </FieldSet>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4 border-t bg-muted/50 px-5 py-5 sm:px-6">
                  <div className="grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
                    <div className="flex min-w-0 flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="info-light" className={BADGE}>
                          <CircleCheckIcon aria-hidden />
                          Ready to send
                        </Badge>
                        <Badge variant="outline" className={BADGE}>
                          PDF preview ready
                        </Badge>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1 text-sm text-muted-foreground">
                        <p>
                          The PDF and the signature link are prepared after
                          sending.
                        </p>
                        <p>
                          Totals update as items, taxes, and discounts change.
                        </p>
                      </div>
                    </div>
                    <div className="relative isolate overflow-hidden rounded-md border bg-background p-4 shadow-xs">
                      <DiscountArt />
                      <div className="relative flex flex-col gap-4">
                        <div className="grid gap-3 sm:grid-cols-[1fr_8rem] sm:items-center">
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              Quote Discount
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Applied before tax calculation.
                            </span>
                          </div>
                          <InputGroup className="h-7 bg-background">
                            <InputGroupInput
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              aria-label="Quote discount percentage"
                              value={discount}
                              onChange={(e) => setDiscount(e.target.value)}
                            />
                            <InputGroupAddon align="inline-end">
                              %
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                        <dl className="grid gap-2.5 rounded-md border bg-background/70 p-3 text-sm backdrop-blur-sm">
                          <div className="flex items-center justify-between gap-4">
                            <dt>Subtotal</dt>
                            <dd className="text-foreground tabular-nums">
                              {money(totals.subtotal)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt>Discount</dt>
                            <dd className="text-foreground tabular-nums">
                              {money(-totals.discount)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt>Tax</dt>
                            <dd className="text-foreground tabular-nums">
                              {money(totals.tax)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt className="font-medium text-foreground">
                              Quote Total
                            </dt>
                            <dd className="text-base font-semibold text-foreground tabular-nums">
                              {money(totals.total)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

/** One part of the form: its heading, badge and line, an action on the right, and its fields */
function Part({
  title,
  badge,
  description,
  action,
  children,
}: {
  title: string
  badge: React.ReactNode
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 sm:gap-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base leading-6 font-semibold text-foreground">
              {title}
            </h2>
            {badge}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}

function Tip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className="shrink-0 text-muted-foreground"
          />
        }
      >
        <InfoIcon aria-hidden />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{tip}</TooltipContent>
    </Tooltip>
  )
}

/** A label with an info tip beside it */
function LabelTip({
  htmlFor,
  label,
  tip,
}: {
  htmlFor: string
  label: string
  tip: string
}) {
  return (
    <div className="-my-1 flex items-center gap-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <Tip label={`${label} info`} tip={tip} />
    </div>
  )
}

/** Issue Date and Valid Until: the date on a button, a calendar to pick another (ours closes on the pick) */
function DateField({
  id,
  label,
  pick,
  value,
  onChange,
}: {
  id: string
  label: string
  pick: string
  value: string
  onChange: (iso: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              size="sm"
              aria-label={`Choose ${pick}, ${fmt.dayYear.format(localDate(value))}`}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="truncate">
            {fmt.dayYear.format(localDate(value))}
          </span>
          <CalendarIcon aria-hidden className="text-muted-foreground/80" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={localDate(value)}
            selected={localDate(value)}
            onSelect={(d) => {
              if (!d) return
              onChange(isoDate(d))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

/** Feedback opens a panel and sends the note */
function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" />
        }
      >
        <MegaphoneIcon aria-hidden data-icon="inline-start" />
        Feedback
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Feedback</PopoverTitle>
          <PopoverDescription>
            Share quote flow notes before this draft is sent.
          </PopoverDescription>
        </PopoverHeader>
        <Textarea
          aria-label="Feedback"
          placeholder="What should the quote flow do better?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-20 max-md:text-base"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!note.trim()}
            onClick={() => {
              toast.add({
                type: "success",
                title: "Feedback sent",
                description: "Thanks. The deal desk will read your note.",
              })
              setNote("")
              setOpen(false)
            }}
          >
            Send feedback
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** The discount card's backdrop: a warm wash, a dot grid and a coupon drawing */
function DiscountArt() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_84%_12%,color-mix(in_oklch,var(--color-warning)_26%,transparent),transparent_34%),radial-gradient(circle_at_8%_96%,color-mix(in_oklch,var(--color-primary)_12%,transparent),transparent_30%),linear-gradient(135deg,color-mix(in_oklch,var(--color-warning)_7%,transparent),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklch,var(--color-muted-foreground)_12%,transparent)_1px,transparent_1.6px)] [mask-image:linear-gradient(135deg,transparent_0%,black_22%,black_76%,transparent_100%)] bg-[length:20px_20px] opacity-35" />
      <svg
        aria-hidden
        viewBox="0 0 360 220"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-warning"
      >
        <path
          d="M236 8H331L360 37V126H236C225 126 216 117 216 106V28C216 17 225 8 236 8Z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M331 8V37H360"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.24"
        />
        <circle
          cx="326"
          cy="41"
          r="6.5"
          fill="var(--color-background)"
          opacity="0.88"
        />
        <g opacity="0.24">
          <circle
            cx="269"
            cy="56"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="6.5"
          />
          <circle
            cx="315"
            cy="100"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="6.5"
          />
          <path
            d="M251 116L333 37"
            fill="none"
            stroke="currentColor"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M147 41L156 59L175 68L156 77L147 96L138 77L119 68L138 59Z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M201 145L207 157L219 163L207 169L201 181L195 169L183 163L195 157Z"
          fill="currentColor"
          opacity="0.1"
        />
        <circle cx="333" cy="162" r="42" fill="currentColor" opacity="0.07" />
        <circle cx="333" cy="162" r="18" fill="currentColor" opacity="0.09" />
        <path
          d="M-14 204C39 175 91 164 152 171C213 178 259 164 371 116V220H-14Z"
          fill="currentColor"
          opacity="0.07"
        />
      </svg>
      <div className="absolute top-1/2 -right-2 size-4 rounded-full border bg-background/90 shadow-xs" />
      <div className="absolute right-16 -bottom-2 size-4 rounded-full border bg-background/90 shadow-xs" />
    </div>
  )
}
