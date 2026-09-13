import { Badge } from "@/components/ui/badge"
import type { ApprovalStatus, RequestType } from "@/data/approvals"
import { TYPE_DOT } from "@/data/approvals"
import { cn } from "@/lib/utils"

/** Outline badges; Approved and Denied read a shade lighter in dark mode, where the base inks fall short of AA */
const STATUS: Record<
  ApprovalStatus,
  {
    variant:
      | "warning-outline"
      | "success-outline"
      | "destructive-outline"
      | "secondary"
    dot: string
    ink?: string
  }
> = {
  Pending: {
    variant: "warning-outline",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  Approved: {
    variant: "success-outline",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    ink: "dark:text-emerald-400",
  },
  Denied: {
    variant: "destructive-outline",
    dot: "bg-rose-500 dark:bg-rose-400",
    ink: "dark:text-rose-400",
  },
  Expired: { variant: "secondary", dot: "bg-muted-foreground/60" },
}
const BADGE = "h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"

/** An approval's status: an outline badge with a dot */
export function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <Badge
      variant={STATUS[status].variant}
      className={cn(BADGE, STATUS[status].ink)}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full!", STATUS[status].dot)}
      />
      {status}
    </Badge>
  )
}

/** The request's name on an outline badge, with its type's dot */
export function RequestBadge({
  request,
  type,
}: {
  request: string
  type: RequestType
}) {
  return (
    <Badge variant="outline" className={cn(BADGE, "max-w-full justify-start")}>
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", TYPE_DOT[type])}
      />
      <span className="truncate">{request}</span>
    </Badge>
  )
}
