"use client"

import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS: { href: Route; label: string }[] = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/preferences", label: "Preferences" },
  { href: "/account/notifications", label: "Notifications" },
]

/** The account pages' tabs: each a link to its page, the current one selected */
export function AccountTabs() {
  const pathname = usePathname()
  return (
    <Tabs value={pathname}>
      <TabsList aria-label="Account">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.href}
            value={t.href}
            nativeButton={false}
            render={<Link href={t.href} />}
            className="px-2.5"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
