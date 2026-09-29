"use client"

import {
  ActivityIcon,
  BellIcon,
  CalendarIcon,
  ChartColumnIcon,
  IdCardIcon,
  type LucideIcon,
  MailCheckIcon,
  SearchIcon,
} from "lucide-react"
import { useState } from "react"

import { AccountTabs } from "@/components/account/account-tabs"
import { CrumbHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { type Preference, PREFERENCES } from "@/data/account"

const ICONS: Record<Preference["icon"], LucideIcon> = {
  search: SearchIcon,
  "mail-check": MailCheckIcon,
  activity: ActivityIcon,
  calendar: CalendarIcon,
  "id-card": IdCardIcon,
  "chart-column": ChartColumnIcon,
  bell: BellIcon,
}

type State = { switches: Record<string, boolean>; calendar: boolean }
const START: State = {
  switches: Object.fromEntries(
    PREFERENCES.filter((p) => p.control === "switch").map((p) => [p.id, !!p.on])
  ),
  calendar: false,
}

/** Account → Preferences: how Tessa appears to the offices and what Knock sends her, saved together */
export function Preferences() {
  const [state, setState] = useState<State>(START)
  const [saved, setSaved] = useState<State>(START)
  const dirty = JSON.stringify(state) !== JSON.stringify(saved)
  return (
    <>
      <CrumbHeader page="Preferences" />
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Preferences</h1>
        <AccountTabs />
        <Frame>
          <FrameHeader>
            <FrameTitle className="font-semibold">Preferences</FrameTitle>
            <FrameDescription>
              Control how you appear to the offices and what Knock sends you.
            </FrameDescription>
          </FrameHeader>
          <FramePanel className="p-0">
            <ItemGroup className="gap-0">
              {PREFERENCES.map((p) => {
                const Icon = ICONS[p.icon]
                const id = `pref-${p.id}`
                return (
                  <Item
                    key={p.id}
                    role="listitem"
                    className="rounded-none border-x-0 border-t-0 border-b-border px-4 py-3 last:border-b-0"
                  >
                    <ItemMedia className="size-8 rounded-lg border bg-muted/40 text-muted-foreground">
                      <Icon aria-hidden className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        <label
                          htmlFor={p.control === "switch" ? id : undefined}
                        >
                          {p.title}
                        </label>
                        {p.badge && (
                          <Badge
                            variant={
                              p.badge === "Pro" ? "secondary" : "info-light"
                            }
                            size="sm"
                          >
                            {p.badge}
                          </Badge>
                        )}
                      </ItemTitle>
                      <ItemDescription>{p.description}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {p.control === "switch" && (
                        <Switch
                          id={id}
                          checked={state.switches[p.id] ?? false}
                          onCheckedChange={(on) =>
                            setState((s) => ({
                              ...s,
                              switches: { ...s.switches, [p.id]: on },
                            }))
                          }
                        />
                      )}
                      {p.control === "connect" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setState((s) => ({ ...s, calendar: !s.calendar }))
                          }
                        >
                          {state.calendar ? "Disconnect" : "Connect"}
                        </Button>
                      )}
                      {p.control === "all-email" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.add({
                                type: "info",
                                title: "Emails off",
                                description:
                                  "No household, mention or report emails.",
                              })
                            }
                          >
                            Disable all
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.add({
                                type: "success",
                                title: "Emails on",
                                description:
                                  "Every household, mention and report email.",
                              })
                            }
                          >
                            Enable all
                          </Button>
                        </>
                      )}
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          </FramePanel>
          <FrameFooter className="flex-row justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!dirty}
              onClick={() => setState(saved)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!dirty}
              onClick={() => {
                setSaved(state)
                toast.add({
                  type: "success",
                  title: "Preferences saved",
                  description: "Your changes apply across the workspace.",
                })
              }}
            >
              Save changes
            </Button>
          </FrameFooter>
        </Frame>
      </div>
    </>
  )
}
