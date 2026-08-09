"use client"

import { CalendarIcon, CheckIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"

/**
 * The breadcrumb page header: "Home › CRM › <page>" (only the page on a phone) with the page's actions on
 * the right. The page's h1 is its own (often an sr-only heading like "Home overview").
 */
export function CrumbHeader({
  page,
  children,
}: {
  page: string
  children?: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex min-h-9 w-full shrink-0 items-center justify-between gap-2">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:flex" />
            <BreadcrumbItem className="hidden md:inline-flex">
              <span>CRM</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:flex" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children && (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        )}
      </header>
    </div>
  )
}

/** The date range menu beside a page's actions: the range on the button (on a phone, `short` for `shortFor`, the page's first range unless said), the ranges to pick; a pick says so in a toast */
export function RangeMenu({
  ranges,
  short,
  shortFor = ranges[0],
  value,
  onChange,
}: {
  ranges: readonly string[]
  short: string
  shortFor?: string
  value: string
  onChange: (range: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <CalendarIcon aria-hidden className="size-4" />
        <span className="hidden sm:block">{value}</span>
        <span className="sm:hidden">{value === shortFor ? short : value}</span>
        <ChevronDownIcon aria-hidden className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {ranges.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => {
              onChange(r)
              toast.add({
                type: "info",
                title: r,
                description: `Showing ${r}.`,
              })
            }}
          >
            {r}
            {r === value && (
              <CheckIcon aria-hidden className="ml-auto size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
