import { Badge } from "@/components/ui/badge"
import { QUOTE_PLAN_DOT, type QuotePlan, type QuoteStatus } from "@/data/quotes"
import { cn } from "@/lib/utils"

/** The small badges on the quote pages */
export const BADGE = "h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"
export const STATUS_BADGE: Record<
  QuoteStatus,
  "destructive-light" | "info-light" | "secondary" | "success-light" | "outline"
> = {
  Expired: "destructive-light",
  Sent: "info-light",
  Draft: "secondary",
  Accepted: "success-light",
  Withdrawn: "outline",
}

export const PlanBadge = ({ plan }: { plan: QuotePlan }) => (
  <Badge variant="outline" className={BADGE}>
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", QUOTE_PLAN_DOT[plan])}
    />
    {plan}
  </Badge>
)
