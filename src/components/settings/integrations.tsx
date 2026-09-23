"use client"

import { ExternalLinkIcon, PlugZapIcon } from "lucide-react"
import { useState } from "react"

import { CrumbHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Frame, FrameFooter, FramePanel } from "@/components/ui/frame"
import { Item, ItemMedia } from "@/components/ui/item"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { INTEGRATIONS, type Integration } from "@/data/integrations"
import { WORKSPACE_SETTINGS } from "@/data/workspace"

/** Settings → Integrations: the partner's service file and the tools around it, to connect or disconnect */
export function Integrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected]))
  )
  const set = (id: string, on: boolean) =>
    setConnected((c) => ({ ...c, [id]: on }))
  return (
    <>
      <CrumbHeader page="Integrations" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold">Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Connect Knock to the tools {WORKSPACE_SETTINGS.name} already runs
              on for calls, payments, and automation.
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {INTEGRATIONS.map((i) => (
            <IntegrationCard
              key={i.id}
              integration={i}
              on={connected[i.id] ?? false}
              onChange={(on) => set(i.id, on)}
            />
          ))}
        </ul>
      </div>
    </>
  )
}

function IntegrationCard({
  integration: i,
  on,
  onChange,
}: {
  integration: Integration
  on: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <li className="contents">
      <Frame>
        <FramePanel className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <Item className="flex size-11 shrink-0 items-center justify-center border-2 border-background bg-muted/60 p-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border">
              {/* The brand's own mark (our data, not user input) */}
              <ItemMedia
                variant="icon"
                role="img"
                aria-label={i.name}
                // the brand's mark from src/data, not user input
                dangerouslySetInnerHTML={{
                  __html: i.logo.replace("<svg", '<svg class="size-6"'),
                }}
              />
            </Item>
            {/* Opens the vendor's developer docs */}
            <Button
              variant="ghost"
              size="icon-sm"
              render={
                <a
                  href={i.docs}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${i.name} docs`}
                />
              }
              nativeButton={false}
              onClick={() =>
                toast.add({
                  type: "info",
                  title: `${i.name} docs`,
                  description: "Opening the integration docs.",
                })
              }
            >
              <ExternalLinkIcon aria-hidden className="opacity-60" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{i.description}</p>
        </FramePanel>
        <FrameFooter className="flex flex-row items-center justify-between p-2">
          {on ? (
            <Button variant="outline" size="sm" onClick={() => onChange(false)}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={() => onChange(true)}>
              <PlugZapIcon aria-hidden data-icon="inline-start" />
              Connect
            </Button>
          )}
          <Switch
            checked={on}
            onCheckedChange={onChange}
            aria-label={`${i.name} connected`}
          />
        </FrameFooter>
      </Frame>
    </li>
  )
}
