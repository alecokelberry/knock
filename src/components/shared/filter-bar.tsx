"use client"

import { FunnelIcon, XIcon } from "lucide-react"
import { Fragment, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  FILTER_OPERATORS,
  type FilterBarFieldType,
  type FilterBarRule,
} from "@/lib/filter-bar"
import { cn } from "@/lib/utils"

export type FilterBarField = {
  id: string
  label: string
  icon?: React.ReactNode
  type: FilterBarFieldType
  options?: readonly string[]
  /** The rule's search box ("Search accounts..."); "Search..." by default */
  placeholder?: string
  /** How a picked value shows on the rule (a status shows its badge); the plain text by default */
  renderValue?: (value: string) => React.ReactNode
}

/**
 * The filter bar over a table: Filters lists the fields under a "Filter..." search (a select field opens its
 * values), and each rule is a button group of the field, its operator, its value (a search box or the values
 * picked) and a remove button.
 */
export function FilterBar({
  fields,
  rules,
  onChange,
}: {
  fields: FilterBarField[]
  rules: FilterBarRule[]
  onChange: (rules: FilterBarRule[]) => void
}) {
  const next = useRef(0)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const id = () => `rule-${++next.current}`
  const update = (rid: string, patch: Partial<FilterBarRule>) =>
    onChange(rules.map((r) => (r.id === rid ? { ...r, ...patch } : r)))
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]))
  const shown = fields.filter((f) =>
    f.label.toLowerCase().includes(query.trim().toLowerCase())
  )
  const add = (rule: Omit<FilterBarRule, "id">) => {
    onChange([...rules, { id: id(), ...rule }])
    setOpen(false)
  }
  const addText = (f: FilterBarField) =>
    add({ field: f.id, operator: "contains", values: [""] })
  return (
    <div className="flex max-w-full min-w-0 flex-wrap items-center gap-1.5">
      <DropdownMenu
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setQuery("")
        }}
      >
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <FunnelIcon aria-hidden data-icon="inline-start" />
          Filters
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          <input
            // the menu opens straight into its filter box, as a combobox does
            autoFocus
            aria-label="Filter fields"
            placeholder="Filter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Typing stays in the box (the menu's typeahead would take it); arrows, Tab and Escape reach the menu
              if (["ArrowDown", "ArrowUp", "Escape", "Tab"].includes(e.key))
                return
              e.stopPropagation()
              const first = shown[0]
              if (e.key === "Enter" && first?.type === "text") addText(first)
            }}
            className="h-8 w-full min-w-0 bg-transparent px-2 text-sm outline-none placeholder:text-foreground max-md:text-base"
          />
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {shown.map((f) =>
              f.type === "select" ? (
                <DropdownMenuSub key={f.id}>
                  <DropdownMenuSubTrigger>
                    {f.icon}
                    {f.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px]">
                    <DropdownMenuGroup>
                      {f.options?.map((o) => (
                        <DropdownMenuCheckboxItem
                          key={o}
                          checked={false}
                          onCheckedChange={() =>
                            add({ field: f.id, operator: "is", values: [o] })
                          }
                        >
                          <span className="truncate">{o}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem key={f.id} onClick={() => addText(f)}>
                  {f.icon}
                  {f.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {rules.map((r) => {
        const field = byId[r.field]
        if (!field) return null
        const ops = FILTER_OPERATORS[field.type]
        const op = ops.find((o) => o.value === r.operator) ?? ops[0]
        if (!op) return null
        return (
          <ButtonGroup
            key={r.id}
            aria-label={`Filter: ${field.label}`}
            className="max-w-full"
          >
            <ButtonGroupText className="h-7 gap-2 bg-background px-2.5 text-sm font-medium [&_svg]:size-3.5">
              {field.icon}
              {field.label}
            </ButtonGroupText>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    aria-label={`${field.label} operator: ${op.label}`}
                  />
                }
              >
                {op.label}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuGroup>
                  {ops
                    .filter((o) => !o.linkOnly)
                    .map((o) => (
                      <DropdownMenuItem
                        key={o.value}
                        onClick={() =>
                          update(r.id, {
                            operator: o.value,
                            values:
                              o.takesValue === false
                                ? []
                                : r.values.length
                                  ? r.values
                                  : [""],
                          })
                        }
                      >
                        {o.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {op.takesValue !== false &&
              (field.type === "text" ? (
                <InputGroup className="h-7 w-48 min-w-28 shrink">
                  <InputGroupInput
                    aria-label={`${field.label} ${op.label}`}
                    placeholder={field.placeholder ?? "Search..."}
                    value={r.values[0] ?? ""}
                    onChange={(e) => update(r.id, { values: [e.target.value] })}
                    className="max-md:text-base"
                  />
                </InputGroup>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          !r.values.length && "text-muted-foreground"
                        )}
                        aria-label={`${field.label} values`}
                      />
                    }
                  >
                    {!r.values.length ? (
                      "Select..."
                    ) : field.renderValue ? (
                      <span className="flex items-center gap-1.5">
                        {r.values.map((v) => (
                          <Fragment key={v}>{field.renderValue?.(v)}</Fragment>
                        ))}
                      </span>
                    ) : (
                      r.values.join(", ")
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuGroup>
                      {field.options?.map((o) => (
                        <DropdownMenuCheckboxItem
                          key={o}
                          checked={r.values.includes(o)}
                          onCheckedChange={(on) =>
                            update(r.id, {
                              values: on
                                ? [...r.values, o]
                                : r.values.filter((v) => v !== o),
                            })
                          }
                        >
                          {o}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Remove ${field.label} filter`}
              onClick={() => onChange(rules.filter((x) => x.id !== r.id))}
            >
              <XIcon aria-hidden />
            </Button>
          </ButtonGroup>
        )
      })}
    </div>
  )
}
