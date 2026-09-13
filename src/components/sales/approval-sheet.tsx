"use client"

import { CheckIcon, FileTextIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { StatusBadge } from "@/components/sales/approval-status"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  APPROVERS,
  type Approval,
  type CheckState,
  REQUESTERS,
} from "@/data/approvals"
import { blockingChecks, money } from "@/lib/approvals"
import { cn } from "@/lib/utils"

const CHECK: Record<
  CheckState,
  { icon: typeof CheckIcon; ink: string; label: string }
> = {
  pass: { icon: CheckIcon, ink: "text-success", label: "Passes" },
  warn: { icon: TriangleAlertIcon, ink: "text-warning", label: "Warning" },
  block: { icon: XIcon, ink: "text-destructive", label: "Blocks sign-off" },
}
const HEADING =
  "text-xs font-medium tracking-wide text-muted-foreground uppercase"
const Dot = () => (
  <span
    aria-hidden
    className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
  />
)

/** The approval detail (the row menu's View quote): the rep, the request, why, the checks, and a pending one's Deny and Approve */
export function ApprovalSheet({
  approval,
  onOpenChange,
  onDecide,
}: {
  approval: Approval | null
  onOpenChange: (open: boolean) => void
  onDecide: (a: Approval, status: "Approved" | "Denied") => void
}) {
  const a = approval
  const blocking = a ? blockingChecks(a) : 0
  return (
    <Sheet open={!!a} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="inset-y-4! right-4! left-auto z-[60] flex h-[calc(100svh-2rem)]! w-[min(30rem,calc(100vw-2rem))]! max-w-none! flex-col gap-0 overflow-hidden rounded-xl border-0! bg-popover p-0 outline-none"
      >
        {a && (
          <>
            <SheetHeader className="shrink-0 gap-0 border-b p-0">
              <div className="flex min-h-11 items-center justify-between gap-2 px-5">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <FileTextIcon aria-hidden className="size-3.5" />
                  {a.id}
                </span>
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close approval detail"
                      className="shrink-0"
                    />
                  }
                >
                  <XIcon aria-hidden />
                </SheetClose>
              </div>
              <div className="flex min-w-0 flex-col gap-2 px-5 pt-1 pb-4">
                <div className="flex min-w-0 items-center gap-2">
                  <SheetTitle className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
                    {a.request}
                  </SheetTitle>
                  <StatusBadge status={a.status} />
                </div>
                <SheetDescription className="flex items-center gap-1.5 text-xs">
                  <span>{a.rep}</span>
                  <Dot />
                  <span>
                    submitted{" "}
                    {a.requested === "Just now" ? "just now" : a.requested}
                  </span>
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              <ScrollArea className="h-full min-h-0">
                <section className="flex flex-col gap-3 px-5 py-4">
                  <h3 className={HEADING}>Rep</h3>
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={a.rep} className="size-9" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.rep}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <span className="truncate">
                          {REQUESTERS[a.rep]?.title}
                        </span>
                        <Dot />
                        <span className="truncate">
                          {REQUESTERS[a.rep]?.email}
                        </span>
                      </p>
                    </div>
                  </div>
                </section>
                <Separator className="opacity-60" />
                <section className="flex flex-col gap-3 px-5 py-4">
                  <h3 className={HEADING}>Request</h3>
                  <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2.5">
                    {[
                      ["Type", a.type],
                      ["For", `${a.account} · ${a.quote}`],
                      ["Value", money(a.value)],
                    ].map(([term, value]) => (
                      <div key={term} className="contents">
                        <dt className="text-sm text-muted-foreground">
                          {term}
                        </dt>
                        <dd className="min-w-0 text-sm text-foreground">
                          {value}
                        </dd>
                      </div>
                    ))}
                    <div className="contents">
                      <dt className="text-sm text-muted-foreground">
                        Approver
                      </dt>
                      <dd className="min-w-0 text-sm text-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <span className="truncate">{a.approver}</span>
                          <Dot />
                          <span className="truncate">
                            {APPROVERS[a.approver]}
                          </span>
                        </span>
                      </dd>
                    </div>
                  </dl>
                </section>
                <Separator className="opacity-60" />
                <section className="flex flex-col gap-3 px-5 py-4">
                  <h3 className={HEADING}>Justification</h3>
                  <p className="text-sm leading-6 text-foreground">
                    {a.justification}
                  </p>
                </section>
                {a.checks.length > 0 && (
                  <>
                    <Separator className="opacity-60" />
                    <section className="flex flex-col gap-3 px-5 py-4">
                      <h3 className={HEADING}>Approval checks</h3>
                      <ul className="flex flex-col gap-3.5">
                        {a.checks.map((c) => {
                          const k = CHECK[c.state]
                          return (
                            <li
                              key={c.label}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center border-2 border-background bg-muted shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border [&_svg]:size-4",
                                  k.ink
                                )}
                              >
                                <k.icon role="img" aria-label={k.label} />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <p className="min-w-0 text-sm leading-5 font-medium text-foreground">
                                  {c.label}
                                </p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                  {c.detail}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                      {blocking > 0 && (
                        <Badge
                          variant="destructive-outline"
                          className="h-5 min-w-5 gap-1 self-start rounded-sm px-1.25 py-0.5 text-xs dark:text-rose-400"
                        >
                          {blocking} blocking{" "}
                          {blocking === 1 ? "check" : "checks"}
                        </Badge>
                      )}
                    </section>
                  </>
                )}
              </ScrollArea>
            </div>
            {a.status === "Pending" && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDecide(a, "Denied")}
                >
                  <XIcon aria-hidden data-icon="inline-start" />
                  Deny
                </Button>
                <Button size="sm" onClick={() => onDecide(a, "Approved")}>
                  <CheckIcon aria-hidden data-icon="inline-start" />
                  Approve
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
