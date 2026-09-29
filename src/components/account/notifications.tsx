"use client"

import { useState } from "react"

import { AccountTabs } from "@/components/account/account-tabs"
import { CrumbHeader } from "@/components/shared/page-header"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { type Channel, CHANNELS, NOTICE_TABS } from "@/data/account"

/** Every notice's channels, keyed "row:channel" */
const START = Object.fromEntries(
  NOTICE_TABS.flatMap((t) =>
    t.groups.flatMap((g) =>
      g.rows.flatMap((r) =>
        CHANNELS.map((c) => [`${r.id}:${c}`, r.on.includes(c)])
      )
    )
  )
) as Record<string, boolean>

/** Account → Notifications: which notices reach Tessa by email, Slack and in the app, tab by tab; each tick saves */
export function Notifications() {
  const [on, setOn] = useState(START)
  const flip = (id: string, label: string, channel: Channel, next: boolean) => {
    setOn((s) => ({ ...s, [`${id}:${channel}`]: next }))
    toast.add({
      type: "success",
      title: "Notifications updated",
      description: `${label}: ${channel} ${next ? "on" : "off"}.`,
    })
  }
  return (
    <>
      <CrumbHeader page="Notifications" />
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Notifications</h1>
        <AccountTabs />
        <Tabs defaultValue={NOTICE_TABS[0]!.id} className="gap-4">
          <TabsList variant="line">
            {NOTICE_TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {NOTICE_TABS.map((t) => (
            <TabsContent
              key={t.id}
              value={t.id}
              className="flex flex-col gap-6"
            >
              {t.groups.map((g) => (
                <Table key={g.title}>
                  <caption className="sr-only">{g.title}</caption>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="ps-0 font-semibold">
                        {g.title}
                      </TableHead>
                      {CHANNELS.map((c) => (
                        <TableHead
                          key={c}
                          className="w-16 text-center text-xs font-normal text-muted-foreground"
                        >
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.rows.map((r) => (
                      <TableRow key={r.id} className="hover:bg-transparent">
                        <TableHead scope="row" className="ps-0 font-normal">
                          {r.label}
                        </TableHead>
                        {CHANNELS.map((c) => (
                          <TableCell key={c} className="text-center">
                            <Checkbox
                              aria-label={`${r.label} by ${c}`}
                              checked={on[`${r.id}:${c}`] ?? false}
                              onCheckedChange={(next) =>
                                flip(r.id, r.label, c, next)
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}
