"use client"

import { UserIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"

import { FORM_SHEET } from "@/components/shared/form-sheet"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  LIFECYCLE_DOT,
  LIFECYCLE_SHORT,
  LIFECYCLES,
  type Lifecycle,
} from "@/data/contacts"
import { CONTACT_OWNER_IDS, memberName } from "@/data/team"
import {
  type ContactForm,
  contactFromForm,
  initialsOf,
  territoriesByName,
  validateContact,
} from "@/lib/contacts"
import { cn } from "@/lib/utils"

import { updateContacts, useTerritories } from "./contacts-store"
import { LifecycleBadge, TerritoryIcon } from "./marks"

const BLANK = { name: "", email: "", address: "", phone: "" }

/**
 * The Add contact: a preview of the card as you type, name and email (the two it checks), address, territory, owner,
 * lifecycle and phone. The homeowner joins the directory, their territory's card, and gets a page of their own.
 */
export function AddContactSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const territories = territoriesByName(useTerritories())
  const [text, setText] = useState(BLANK)
  const [territoryId, setTerritoryId] = useState(territories[0]!.id)
  const [ownerId, setOwnerId] = useState(CONTACT_OWNER_IDS[0]!)
  const [lifecycle, setLifecycle] = useState<Lifecycle>("Lead")
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validateContact(text) : {}
  const territory =
    territories.find((t) => t.id === territoryId) ?? territories[0]!
  const set =
    (key: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setText((t) => ({ ...t, [key]: e.target.value }))

  const close = (next: boolean) => {
    if (!next) setSubmitted(false)
    onOpenChange(next)
  }
  const save = () => {
    setSubmitted(true)
    if (Object.keys(validateContact(text)).length) return
    const form: ContactForm = { ...text, territoryId, ownerId, lifecycle }
    updateContacts((all) => [...all, contactFromForm(all, territories, form)])
    toast.add({
      type: "success",
      title: "Contact added",
      description: `${text.name.trim()} · ${territory.name}`,
    })
    setText(BLANK)
    close(false)
  }

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Add contact
          </SheetTitle>
          <SheetDescription>
            Add a homeowner, their territory and the rep who owns them.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
              {text.name.trim() ? (
                <Avatar className="size-11 shrink-0">
                  <AvatarFallback className="text-sm font-medium">
                    {initialsOf(text.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="size-11 shrink-0">
                  <AvatarFallback>
                    <UserIcon
                      aria-hidden
                      className="size-5 text-muted-foreground"
                    />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {text.name.trim() || "New homeowner"}
                  </span>
                  <LifecycleBadge lifecycle={lifecycle} />
                </div>
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <TerritoryIcon
                    icon={territory.icon}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">{territory.name}</span>
                </div>
              </div>
            </div>
            <Field>
              <FieldLabel htmlFor="contact-name">Full name</FieldLabel>
              <Input
                id="contact-name"
                placeholder="e.g. Rosa Delgado"
                value={text.name}
                onChange={set("name")}
                aria-invalid={!!errors.name}
                className="max-md:text-base"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                placeholder="name@example.com"
                value={text.email}
                onChange={set("email")}
                aria-invalid={!!errors.email}
                className="max-md:text-base"
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-address">Address</FieldLabel>
              <Input
                id="contact-address"
                autoComplete="off"
                placeholder="e.g. 3377 W Desert Willow Ln"
                value={text.address}
                onChange={set("address")}
                className="max-md:text-base"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="contact-territory">Territory</FieldLabel>
                <Select
                  value={territoryId}
                  onValueChange={(v) => v && setTerritoryId(v)}
                >
                  <SelectTrigger
                    id="contact-territory"
                    size="sm"
                    className="w-full"
                  >
                    <TerritoryIcon icon={territory.icon} className="size-4" />
                    <SelectValue>{() => territory.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {territories.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <TerritoryIcon icon={t.icon} className="size-4" />
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-owner">Owner</FieldLabel>
                <Select
                  value={ownerId}
                  onValueChange={(v) => v && setOwnerId(v)}
                >
                  <SelectTrigger
                    id="contact-owner"
                    size="sm"
                    className="w-full"
                  >
                    <PersonAvatar
                      name={memberName(ownerId)}
                      size="sm"
                      className="data-[size=sm]:size-4"
                    />
                    <SelectValue>{(v: string) => memberName(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OWNER_IDS.map((id) => (
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
            </div>
            <Field>
              <FieldLabel>Lifecycle</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[lifecycle]}
                onValueChange={(v) => v[0] && setLifecycle(v[0] as Lifecycle)}
                className="w-full"
                aria-label="Lifecycle"
              >
                {LIFECYCLES.map((l) => (
                  <ToggleGroupItem
                    key={l}
                    value={l}
                    className="min-w-0 flex-1 gap-1.5 px-2"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        LIFECYCLE_DOT[l]
                      )}
                    />
                    {LIFECYCLE_SHORT[l]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-phone">Phone</FieldLabel>
              <Input
                id="contact-phone"
                type="tel"
                inputMode="tel"
                placeholder="Optional"
                value={text.phone}
                onChange={set("phone")}
                className="max-md:text-base"
              />
            </Field>
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button size="sm" onClick={save}>
              <UserPlusIcon aria-hidden />
              Add contact
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
