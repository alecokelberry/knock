import {
  CalendarClockIcon,
  CircleDollarSignIcon,
  MapPinIcon,
} from "lucide-react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { FramePanel } from "@/components/ui/frame"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { DEAL_STATUS_DOT, type Deal } from "@/data/deals"
import { memberName } from "@/data/team"
import { dateKind, probTone } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

/** One row of a card's facts: an icon in a 16px column, then the text */
function Fact({
  icon: Icon,
  children,
}: {
  icon: typeof MapPinIcon
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-5 min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-x-2 text-sm leading-5">
      <span className="flex size-4 items-center justify-center text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** A household's card: its rep, the homeowner and plan, the odds it's serviced, where it is, the next step, what it's worth, its status and note */
export function DealCard({ deal }: { deal: Deal }) {
  const tone = probTone(deal.winProbability)
  const atRisk = deal.status === "At risk"
  // What's sold or priced ("New · Quarterly Pest + Mosquito Season")
  const plans = [deal.plan, deal.addOn].filter(Boolean).join(" + ")
  const subtitle = [deal.type, plans].filter(Boolean).join(" · ")
  return (
    <FramePanel className="flex min-h-50 flex-col gap-2.5 p-3 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm">
      <div className="flex min-w-0 items-start gap-2.5">
        <PersonAvatar
          name={memberName(deal.ownerId)}
          size="sm"
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-base leading-5 font-semibold"
            title={deal.household}
          >
            {deal.household}
          </div>
          <div
            className="truncate text-sm leading-5 text-muted-foreground"
            title={subtitle}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-sm leading-none font-medium text-muted-foreground">
            Odds
          </span>
          <span
            className={cn(
              "text-sm leading-none font-semibold tabular-nums",
              tone.text
            )}
          >
            {deal.winProbability}%
          </span>
        </div>
        <Progress
          value={deal.winProbability}
          className={cn(
            "gap-0 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:rounded-full",
            tone.bar
          )}
        >
          <ProgressLabel className="sr-only">
            {deal.household} odds of service
          </ProgressLabel>
        </Progress>
      </div>
      <div className="flex flex-col gap-1.5">
        <Fact icon={MapPinIcon}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate" title={deal.address}>
              {deal.address}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {deal.office}
            </span>
          </div>
        </Fact>
        <Fact icon={CalendarClockIcon}>
          <span className="truncate">
            <span className="text-muted-foreground">
              {dateKind(deal.stage)}
            </span>{" "}
            {deal.dateLabel}
          </span>
        </Fact>
        <Fact icon={CircleDollarSignIcon}>
          <span className="truncate tabular-nums">
            {deal.valueLabel}
            <span className="text-muted-foreground"> first year</span>
          </span>
        </Fact>
      </div>
      <div className="mt-auto flex min-w-0 items-center justify-between gap-2">
        <Badge
          variant="outline"
          className="min-w-0 shrink truncate"
          title={deal.status}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              DEAL_STATUS_DOT[deal.status]
            )}
            aria-hidden="true"
          />
          {deal.status}
        </Badge>
        {atRisk ? (
          <Badge
            variant="warning-light"
            className="min-w-0 shrink truncate"
            title={deal.note}
          >
            {deal.note}
          </Badge>
        ) : (
          <span
            className="truncate text-sm leading-5 text-muted-foreground"
            title={deal.note}
          >
            {deal.note}
          </span>
        )}
      </div>
    </FramePanel>
  )
}
