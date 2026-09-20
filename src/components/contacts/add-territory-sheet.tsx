"use client"

import { CheckIcon, MapPinIcon, PlusIcon } from "lucide-react"
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
  MARKETS,
  type Market,
  memberName,
  SELLER_IDS,
  TEAM_BY_ID,
} from "@/data/team"
import { BRAND_COLORS } from "@/data/territories"
import {
  initialsOf,
  territoryFromForm,
  validateTerritory,
} from "@/lib/contacts"
import { cn } from "@/lib/utils"

import { addTerritory, useTerritories } from "./contacts-store"
import { tileInk } from "./marks"

/**
 * The Add territory: a colour for its tile, the name (the one it must have), the office, how many homes it holds, and
 * the rep who works it. It leads the grid on /territories and joins the Territory pickers.
 */
export function AddTerritorySheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const territories = useTerritories()
  const [name, setName] = useState("")
  const [doors, setDoors] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)
  const [color, setColor] = useState(BRAND_COLORS[0]!.bg)
  const [office, setOffice] = useState<Market>(MARKETS[0])
  const reps = SELLER_IDS.filter((id) => TEAM_BY_ID[id]?.market === office)
  const [picked, setRepId] = useState<string>(reps[0]!)
  // A rep from another office is swapped for this office's team leader
  const repId = reps.includes(picked as never) ? picked : reps[0]!
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validateTerritory({ name, doors }) : {}
  const initials = initialsOf(name)

  const close = (next: boolean) => {
    if (!next) setSubmitted(false)
    onOpenChange(next)
  }
  const save = () => {
    setSubmitted(true)
    if (Object.keys(validateTerritory({ name, doors })).length) return
    addTerritory(
      territoryFromForm(territories, { name, office, doors, repId, color })
    )
    toast.add({
      type: "success",
      title: "Territory added",
      description: `${name.trim()} · ${office} · ${memberName(repId)}`,
    })
    setName("")
    setDoors("")
    close(false)
  }

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className={FORM_SHEET} initialFocus={nameRef}>
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Add territory
          </SheetTitle>
          <SheetDescription>
            Mark out a neighborhood and give it to a rep.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <FieldGroup className="gap-5 p-5">
            <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
              {/* The tile the card shows: decoration beside the name field */}
              <div
                aria-hidden
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white transition-colors",
                  initials ? tileInk(color) : "bg-muted-foreground/25"
                )}
              >
                {initials || (
                  <MapPinIcon className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <span
                  id="brand-color"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Color
                </span>
                <div
                  role="group"
                  aria-labelledby="brand-color"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-label={c.name}
                      aria-pressed={color === c.bg}
                      onClick={() => setColor(c.bg)}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full transition-transform outline-none hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        c.bg,
                        color === c.bg &&
                          "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      )}
                    >
                      {color === c.bg && (
                        <CheckIcon
                          aria-hidden
                          className="size-3.5 text-white"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Field>
              <FieldLabel htmlFor="territory-name">Territory name</FieldLabel>
              <Input
                ref={nameRef}
                id="territory-name"
                placeholder="e.g. Mesquite Flats"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                className="max-md:text-base"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Office</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[office]}
                onValueChange={(v) => v[0] && setOffice(v[0] as Market)}
                className="w-full"
                aria-label="Office"
              >
                {MARKETS.map((m) => (
                  <ToggleGroupItem
                    key={m}
                    value={m}
                    className="min-w-0 flex-1 gap-1.5 px-2"
                  >
                    {m}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="territory-doors">Homes</FieldLabel>
                <Input
                  id="territory-doors"
                  inputMode="numeric"
                  placeholder="e.g. 1,100"
                  value={doors}
                  onChange={(e) => setDoors(e.target.value)}
                  aria-invalid={!!errors.doors}
                  className="max-md:text-base"
                />
                {errors.doors && <FieldError>{errors.doors}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="territory-rep">Rep</FieldLabel>
                <Select value={repId} onValueChange={(v) => v && setRepId(v)}>
                  <SelectTrigger
                    id="territory-rep"
                    size="sm"
                    className="w-full"
                  >
                    <PersonAvatar
                      name={memberName(repId)}
                      size="sm"
                      className="data-[size=sm]:size-4"
                    />
                    <SelectValue>{(v: string) => memberName(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {reps.map((id) => (
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
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </SheetClose>
            <Button size="sm" onClick={save}>
              <PlusIcon aria-hidden />
              Add territory
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
