"use client"

import {
  CheckIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  InfoIcon,
  PencilIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { CrumbHeader } from "@/components/shared/page-header"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  BILLING_DETAILS,
  BILLING_REGIONS,
  BILLING_TIPS,
  type BillingDetails,
  INVOICES,
  type Invoice,
  PLAN,
  USAGE,
  type UsageMeter,
} from "@/data/billing"
import {
  billingErrors,
  type CardForm,
  cardErrors,
  cardLabel,
  formatCardNumber,
  formatExpiry,
  previewNumber,
} from "@/lib/billing"
import { downloadCsv, toCsv } from "@/lib/csv"
import { isoDate } from "@/lib/dates"
import { cn } from "@/lib/utils"

const BADGE = "h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const METER_ICON = {
  users: UsersIcon,
  "file-text": FileTextIcon,
  "circle-dollar-sign": CircleDollarSignIcon,
} satisfies Record<UsageMeter["icon"], unknown>

/** Settings → Billing: the plan and usage, billing details, the company card and invoices */
export function Billing() {
  const [details, setDetails] = useState<BillingDetails>(BILLING_DETAILS)
  // The saved card, as the page may show it: "Visa •••• 4242" (kept once a card is saved)
  const [card, setCard] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  return (
    <>
      <CrumbHeader page="Billing" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Billing</h1>
        {!card && (
          <Alert variant="destructive">
            <ShieldAlertIcon aria-hidden />
            <AlertTitle>Renewal is blocked.</AlertTitle>
            {/* A shade darker than the muted grey, which misses contrast on the tint */}
            <AlertDescription className="text-neutral-600 dark:text-muted-foreground">
              No company card is saved. Add one before {PLAN.renewalDateLong} so
              renewal, seat changes, and receipt delivery can continue normally.
            </AlertDescription>
            <AlertAction>
              <Button size="sm" onClick={() => setAdding(true)}>
                Add company card
              </Button>
            </AlertAction>
          </Alert>
        )}
        <PlanSection card={card} />
        <DetailsSection
          details={details}
          card={card}
          onEdit={() => setEditing(true)}
        />
        <InvoiceSection />
      </div>
      <AddCardSheet
        open={adding}
        onOpenChange={setAdding}
        onAdd={(label) => {
          setCard(label)
          setAdding(false)
        }}
      />
      <EditDetailsSheet
        open={editing}
        onOpenChange={setEditing}
        details={details}
        card={card}
        onAddCard={() => {
          setEditing(false)
          setAdding(true)
        }}
        onSave={(d) => {
          setDetails(d)
          setEditing(false)
        }}
      />
    </>
  )
}

/** A section's title row: heading and one line, an action on the right */
function SectionHead({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-px">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </div>
  )
}

/** The raised icon tile beside the plan and each meter */
function IconTile({
  icon: Icon,
  small,
}: {
  icon: React.ComponentType<{ "aria-hidden"?: boolean }>
  small?: boolean
}) {
  return (
    <Item
      className={cn(
        "flex shrink-0 items-center justify-center border-2 border-background bg-muted p-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border [&_svg]:text-accent-foreground",
        small ? "size-9 [&_svg]:size-4" : "size-10.5 [&_svg]:size-5"
      )}
    >
      <ItemMedia variant="icon" className="size-auto">
        <Icon aria-hidden />
      </ItemMedia>
    </Item>
  )
}

const CARD = "gap-0 p-0"
const FOOT =
  "flex-col items-start justify-between gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:px-6"

function PlanSection({ card }: { card: string | null }) {
  const facts: [string, string][] = [
    ["Renewal date", PLAN.renewalDate],
    // Once a card is saved
    ["Renewal status", card ? "Renews automatically" : "Card required"],
    ["Billing owner", PLAN.billingOwner],
  ]
  return (
    <section aria-labelledby="plan-title" className="flex flex-col gap-5">
      <SectionHead
        title="Plan"
        description="Current subscription and core usage."
      />
      <div className="grid gap-5">
        <Card className={CARD}>
          <CardHeader className="gap-6 px-5 py-5 sm:px-6">
            <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(10rem,13rem)]">
              <div className="flex min-w-0 gap-4">
                <IconTile icon={CreditCardIcon} />
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle id="plan-title">{PLAN.name}</CardTitle>
                    <Badge variant="warning-light" className={BADGE}>
                      {PLAN.badge}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">${PLAN.price}</span>{" "}
                    <span className="text-muted-foreground">{PLAN.unit}</span>
                  </p>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    {PLAN.blurb}
                  </p>
                </div>
              </div>
              <dl className="grid gap-4 md:pl-4">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {k}
                    </dt>
                    <dd className="text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </CardHeader>
          <CardFooter className={FOOT}>
            <p className="max-w-xl text-sm text-muted-foreground">
              {card
                ? `Renews on ${PLAN.renewalDate} with ${card}.`
                : "Renewal stays paused until a company card is added."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.add({
                  type: "info",
                  title: "Manage plan",
                  description: "Change or cancel your Knock subscription.",
                })
              }
            >
              Manage plan
            </Button>
          </CardFooter>
        </Card>
        <Card className={CARD}>
          <CardContent className="grid gap-0 p-0 sm:grid-cols-3 sm:divide-x">
            {USAGE.map((m) => (
              <div
                key={m.id}
                className="flex min-h-[7.75rem] flex-col justify-between gap-4 px-5 py-5 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <IconTile icon={METER_ICON[m.icon]} small />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-sm text-muted-foreground">{m.note}</p>
                  </div>
                </div>
                <p className="text-lg font-semibold tracking-tight tabular-nums">
                  {m.value}
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className={FOOT}>
            <p className="max-w-xl text-sm text-muted-foreground">
              Usage counters reset on {PLAN.renewalDate} with the next billing
              cycle.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.add({
                  type: "info",
                  title: "Usage details",
                  description: "See a full breakdown of this cycle's usage.",
                })
              }
            >
              View usage
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}

/** The (i) beside a detail, its words in a tooltip */
function Tip({ label, children }: { label: string; children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${label} details`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <InfoIcon aria-hidden />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{children}</TooltipContent>
    </Tooltip>
  )
}

function DetailRow({
  label,
  description,
  tip,
  badge,
  value,
  muted,
}: {
  label: string
  description: string
  tip?: string
  badge?: string
  value: string
  muted?: boolean
}) {
  return (
    <Field
      orientation="responsive"
      className="gap-4 px-5 py-4 @md/field-group:gap-8"
    >
      <div className="flex w-full min-w-0 flex-col gap-0.5 @md/field-group:w-3/5 @md/field-group:basis-3/5 @md/field-group:pr-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <FieldTitle>{label}</FieldTitle>
          {badge && (
            <Badge variant="warning-light" className={BADGE}>
              {badge}
            </Badge>
          )}
          {tip && <Tip label={label}>{tip}</Tip>}
        </div>
        <FieldDescription className="max-w-[28rem] text-sm leading-5">
          {description}
        </FieldDescription>
      </div>
      <FieldContent className="w-full min-w-0 @md/field-group:w-2/5 @md/field-group:basis-2/5">
        <div className="flex w-full justify-start @md/field-group:justify-end">
          <span
            className={cn(
              "block max-w-full truncate text-end text-sm",
              muted ? "text-muted-foreground" : "font-medium"
            )}
          >
            {value}
          </span>
        </div>
      </FieldContent>
    </Field>
  )
}

function DetailsSection({
  details,
  card,
  onEdit,
}: {
  details: BillingDetails
  card: string | null
  onEdit: () => void
}) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHead
        title="Billing Details"
        description="Invoice contact and payment readiness."
        action={
          <Button variant="outline" size="sm" onClick={onEdit}>
            <PencilIcon aria-hidden data-icon="inline-start" />
            Edit details
          </Button>
        }
      />
      <Card className={CARD}>
        <CardContent className="p-0">
          <FieldGroup className="gap-0">
            <DetailRow
              label="Billing contact"
              description="Receives invoices and renewal notices."
              tip={BILLING_TIPS.contact}
              value={details.contact}
            />
            <FieldSeparator className="-my-2 h-5" />
            <DetailRow
              label="Legal entity"
              description="Shown on invoices and receipts."
              value={details.entity}
            />
            <FieldSeparator className="-my-2 h-5" />
            <DetailRow
              label="Region"
              description="Used for tax and invoice formatting."
              tip={BILLING_TIPS.region}
              value={details.region}
            />
            <FieldSeparator className="-my-2 h-5" />
            <DetailRow
              label="Payment method"
              description="Required before the trial renews."
              badge={card ? undefined : "Action required"}
              tip={BILLING_TIPS.payment}
              value={card ?? "No company card added"}
              muted={!card}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </section>
  )
}

const invoiceCsv = (rows: readonly Invoice[]) =>
  toCsv([
    ["Invoice", "Period", "Date", "Total", "Status"],
    ...rows.map((i) => [i.id, i.period, i.date, i.total, i.status]),
  ])

function InvoiceSection() {
  // The toast offers the invoices as a CSV
  const all = () =>
    toast.add({
      type: "success",
      title: "Invoices exported",
      description: "All invoices are ready as a CSV.",
      actionProps: {
        children: "Download",
        onClick: () => downloadCsv("invoices.csv", invoiceCsv(INVOICES)),
      },
    })
  const one = (i: Invoice) =>
    toast.add({
      type: "success",
      title: "Invoice ready",
      description: `${i.id} is ready to download.`,
      actionProps: {
        children: "Download",
        onClick: () => downloadCsv(`${i.id}.csv`, invoiceCsv([i])),
      },
    })
  return (
    <section className="flex flex-col gap-5">
      <SectionHead
        title="Invoice History"
        description="Recent invoices."
        action={
          <Button variant="outline" size="sm" onClick={all}>
            <DownloadIcon aria-hidden data-icon="inline-start" />
            Download all
          </Button>
        }
      />
      <Card className={CARD}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[42rem] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[22%] ps-5! sm:ps-6!">
                    Invoice
                  </TableHead>
                  <TableHead className="w-[22%]">Period</TableHead>
                  <TableHead className="w-[18%]">Date</TableHead>
                  <TableHead className="w-[16%]">Total</TableHead>
                  <TableHead className="w-[14%] text-end">Status</TableHead>
                  <TableHead className="w-[8%] pe-5! text-end sm:pe-6!">
                    <span className="sr-only">Download</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="ps-5! font-medium whitespace-nowrap sm:ps-6!">
                      {i.id}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {i.period}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {i.date}
                    </TableCell>
                    <TableCell className="font-semibold tracking-tight whitespace-nowrap tabular-nums">
                      {USD.format(i.total)}
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge
                        variant={
                          i.status === "Paid"
                            ? "success-light"
                            : "warning-light"
                        }
                        className={BADGE}
                      >
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pe-5! text-end sm:pe-6!">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download ${i.id}`}
                        onClick={() => one(i)}
                      >
                        <DownloadIcon aria-hidden />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

const EMPTY_CARD: CardForm = {
  name: "",
  number: "",
  expiry: "",
  cvc: "",
  zip: "",
}

/** The Add company card sheet: a live preview of the card, its fields and the default switch. Nothing leaves the browser. */
function AddCardSheet({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdd: (label: string) => void
}) {
  const [form, setForm] = useState<CardForm>(EMPTY_CARD)
  const [isDefault, setIsDefault] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [today] = useState(() => isoDate(new Date()))
  const errors = submitted ? cardErrors(form, today) : {}
  const set = (patch: Partial<CardForm>) => setForm((f) => ({ ...f, ...patch }))
  const reset = () => {
    setForm(EMPTY_CARD)
    setSubmitted(false)
  }
  const add = () => {
    setSubmitted(true)
    if (Object.keys(cardErrors(form, isoDate(new Date()))).length) return
    // Only the brand and last four are kept, never the number
    const label = cardLabel(form.number)
    onAdd(label)
    toast.add({
      type: "success",
      title: "Company card added",
      description: `${label} will be used for renewals and receipts.`,
    })
    reset()
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Add company card
          </SheetTitle>
          <SheetDescription>
            Save a card so renewal and receipts continue.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <div
              aria-hidden
              className="flex aspect-[1.6/1] max-h-44 flex-col justify-between rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-950 p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
                <span className="text-sm font-medium tracking-wide">Card</span>
              </div>
              <div className="font-mono text-lg tracking-[0.15em] tabular-nums">
                {previewNumber(form.number)}
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="min-w-0 truncate text-xs tracking-wide uppercase">
                  {form.name.trim() || "Cardholder name"}
                </span>
                <span className="shrink-0 text-xs tabular-nums">
                  {form.expiry || "MM/YY"}
                </span>
              </div>
            </div>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="card-name">Cardholder name</FieldLabel>
              <Input
                id="card-name"
                placeholder="e.g. Julia Serrano"
                autoComplete="cc-name"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                aria-invalid={!!errors.name}
                className="max-md:text-base"
              />
              <FieldError>{errors.name}</FieldError>
            </Field>
            <Field data-invalid={!!errors.number}>
              <FieldLabel htmlFor="card-number">Card number</FieldLabel>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={23}
                value={form.number}
                onChange={(e) =>
                  set({ number: formatCardNumber(e.target.value) })
                }
                aria-invalid={!!errors.number}
                className="max-md:text-base"
              />
              <FieldError>{errors.number}</FieldError>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.expiry}>
                <FieldLabel htmlFor="card-expiry">Expiry</FieldLabel>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  value={form.expiry}
                  onChange={(e) =>
                    set({ expiry: formatExpiry(e.target.value) })
                  }
                  aria-invalid={!!errors.expiry}
                  className="max-md:text-base"
                />
                <FieldError>{errors.expiry}</FieldError>
              </Field>
              <Field data-invalid={!!errors.cvc}>
                <FieldLabel htmlFor="card-cvc">CVC</FieldLabel>
                <Input
                  id="card-cvc"
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  value={form.cvc}
                  onChange={(e) =>
                    set({ cvc: e.target.value.replace(/\D/g, "") })
                  }
                  aria-invalid={!!errors.cvc}
                  className="max-md:text-base"
                />
                <FieldError>{errors.cvc}</FieldError>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="card-zip">Billing ZIP</FieldLabel>
              <Input
                id="card-zip"
                placeholder="94107"
                autoComplete="postal-code"
                value={form.zip}
                onChange={(e) => set({ zip: e.target.value })}
                className="max-md:text-base"
              />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="card-default">
                  Set as default payment method
                </FieldLabel>
                <FieldDescription>
                  Renewals and receipts will use this card.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="card-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              Demo only — no real card is stored.
            </p>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="mt-auto shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button size="sm" onClick={add}>
              <CreditCardIcon aria-hidden data-icon="inline-start" />
              Add card
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** The Edit billing details sheet: contact, entity, region, and the payment method with its Add card */
function EditDetailsSheet({
  open,
  onOpenChange,
  details,
  card,
  onAddCard,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  details: BillingDetails
  card: string | null
  onAddCard: () => void
  onSave: (d: BillingDetails) => void
}) {
  const [form, setForm] = useState(details)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? billingErrors(form) : {}
  const save = () => {
    setSubmitted(true)
    if (Object.keys(billingErrors(form)).length) return
    onSave({
      contact: form.contact.trim(),
      entity: form.entity.trim(),
      region: form.region,
    })
    toast.add({
      type: "success",
      title: "Billing details saved",
      description: "Invoice contact and region updated.",
    })
  }
  const row = (
    id: string,
    label: string,
    description: string,
    control: React.ReactNode,
    error?: string
  ) => (
    <Field orientation="horizontal" data-invalid={!!error}>
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        <FieldError>{error}</FieldError>
      </FieldContent>
      {control}
    </Field>
  )
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) setForm(details)
        setSubmitted(false)
      }}
    >
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Edit billing details
          </SheetTitle>
          <SheetDescription>
            Update your invoice contact and payment method.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            {row(
              "billing-contact",
              "Billing contact",
              "Receives invoices and renewal notices.",
              <Input
                id="billing-contact"
                type="email"
                placeholder="finance@company.com"
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
                aria-invalid={!!errors.contact}
                className="w-48 max-md:text-base"
              />,
              errors.contact
            )}
            {row(
              "billing-entity",
              "Legal entity",
              "Shown on invoices and receipts.",
              <Input
                id="billing-entity"
                placeholder="Company legal name"
                value={form.entity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, entity: e.target.value }))
                }
                aria-invalid={!!errors.entity}
                className="w-48 max-md:text-base"
              />,
              errors.entity
            )}
            {row(
              "billing-region",
              "Region",
              "Used for tax and invoice formatting.",
              <Select
                items={BILLING_REGIONS.map((r) => ({ value: r, label: r }))}
                value={form.region}
                onValueChange={(v) =>
                  v && setForm((f) => ({ ...f, region: v }))
                }
              >
                <SelectTrigger id="billing-region" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Item
              variant="outline"
              className={cn(!card && "border-amber-500/40 bg-amber-500/5")}
            >
              <ItemContent>
                <ItemTitle>
                  Payment method
                  {!card && (
                    <Badge variant="warning-light" className={BADGE}>
                      Action required
                    </Badge>
                  )}
                </ItemTitle>
                <ItemDescription>
                  {card ?? "No company card added"}
                </ItemDescription>
              </ItemContent>
              {!card && (
                <ItemActions>
                  <Button size="sm" onClick={onAddCard}>
                    Add card
                  </Button>
                </ItemActions>
              )}
            </Item>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="mt-auto shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button size="sm" onClick={save}>
              <CheckIcon aria-hidden data-icon="inline-start" />
              Save changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
