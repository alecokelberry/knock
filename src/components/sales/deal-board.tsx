"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import {
  FunnelIcon,
  GripVerticalIcon,
  PlusIcon,
  UserPlusIcon,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Frame, FrameHeader, FrameTitle } from "@/components/ui/frame"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/ui/kanban"
import {
  DEAL_STAGES,
  DEAL_STATUS_DOT,
  DEAL_STATUSES,
  DEALS,
  type Deal,
  type DealStage,
  type DealStageId,
  type DealStatus,
} from "@/data/deals"
import { type Market, MARKETS } from "@/data/team"
import { dealMatches, groupByStage } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

import { DealAddSheet } from "./deal-add-sheet"
import { DealCard } from "./deal-card"

/** Every household, when no filter is set */
const showAll = () => true

const STAGE_BY_ID = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.id, s])
) as Record<DealStageId, DealStage>
const getDealId = (d: Deal) => d.id

/** One stage column: its header with the count, "+" and the drag handle, and its cards. The drag overlay draws the same column. */
function StageColumn({
  id,
  deals,
  shown = showAll,
  onAdd,
}: {
  id: DealStageId
  deals: Deal[]
  shown?: (d: Deal) => boolean
  onAdd?: () => void
}) {
  const stage = STAGE_BY_ID[id]
  const count = deals.filter(shown).length
  return (
    <KanbanColumn
      value={id}
      className="w-[calc(100vw-3rem)] max-w-[18.5rem] shrink-0 self-start sm:w-[18.5rem]"
    >
      <Frame
        spacing="sm"
        className="group/column"
        aria-label={`${stage.label}: ${stage.description}`}
      >
        <FrameHeader className="min-h-9 flex-row items-center gap-2 px-2 py-1.5">
          <span
            className={`size-2.5 shrink-0 rounded-full ${stage.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <FrameTitle className="truncate leading-5" title={stage.label}>
                {stage.label}
              </FrameTitle>
              <span className="shrink-0 text-xs leading-none font-medium text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within/kanban-column:opacity-100 group-hover/kanban-column:opacity-100 group-data-[dragging=true]/kanban-column:opacity-0!">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={stage.addLabel}
              className="border-transparent bg-transparent text-muted-foreground hover:border-border! hover:bg-background! hover:text-foreground"
              onClick={onAdd}
            >
              <PlusIcon />
            </Button>
            <KanbanColumnHandle
              aria-label={`Move ${stage.label} column`}
              className="group-focus-within/kanban-column:opacity-100"
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="border-transparent bg-transparent text-muted-foreground hover:border-border! hover:bg-background! hover:text-foreground"
                />
              }
            >
              <GripVerticalIcon />
            </KanbanColumnHandle>
          </div>
        </FrameHeader>
        <KanbanColumnContent value={id} className="flex flex-col gap-2 p-0.5">
          {deals.map((deal) => (
            // Filtered-out cards stay mounted (hidden) so dragging keeps every card in its place
            <KanbanItem
              key={deal.id}
              value={deal.id}
              className={cn(!shown(deal) && "hidden")}
            >
              <KanbanItemHandle className="block">
                <DealCard deal={deal} />
              </KanbanItemHandle>
            </KanbanItem>
          ))}
        </KanbanColumnContent>
      </Frame>
    </KanbanColumn>
  )
}

/**
 * The pipeline board: the header with Filters and Add deal, and six stage columns of households you can drag between
 * and within, and reorder by their handle. Filters keep statuses and offices; a column's "+" opens Add deal on its
 * stage, and a created household lands on the board.
 */
export function DealBoard() {
  const [columns, setColumns] = useState<Record<DealStageId, Deal[]>>(() =>
    groupByStage(DEALS)
  )
  const [adding, setAdding] = useState<{ stage?: DealStageId } | null>(null)
  const [statuses, setStatuses] = useState<DealStatus[]>([])
  const [offices, setOffices] = useState<Market[]>([])
  const shown = (d: Deal) => dealMatches(d, statuses, offices)
  const byId = Object.fromEntries(
    Object.values(columns)
      .flat()
      .map((d) => [d.id, d])
  )
  const picked = statuses.length + offices.length

  return (
    <>
      <header className="px-1">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-sm leading-5 font-semibold">
              Pipeline review
            </h2>
            <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
              Households from first knock to first service, with their odds.
            </p>
          </div>
          <div
            className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end"
            role="group"
            aria-label="Pipeline actions"
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <FunnelIcon data-icon="inline-start" />
                Filters
                {picked > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 rounded-sm px-1 text-[10px] tabular-nums"
                  >
                    {picked}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {DEAL_STATUSES.map((st) => (
                    <DropdownMenuCheckboxItem
                      key={st}
                      checked={statuses.includes(st)}
                      onCheckedChange={(on) =>
                        setStatuses((x) =>
                          on ? [...x, st] : x.filter((y) => y !== st)
                        )
                      }
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          DEAL_STATUS_DOT[st]
                        )}
                      />
                      {st}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Office</DropdownMenuLabel>
                  {MARKETS.map((r) => (
                    <DropdownMenuCheckboxItem
                      key={r}
                      checked={offices.includes(r)}
                      onCheckedChange={(on) =>
                        setOffices((x) =>
                          on ? [...x, r] : x.filter((y) => y !== r)
                        )
                      }
                    >
                      {r}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                {picked > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setStatuses([])
                        setOffices([])
                      }}
                    >
                      Reset filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => setAdding({})}>
              <UserPlusIcon data-icon="inline-start" />
              Add deal
            </Button>
          </div>
        </div>
      </header>
      <Kanban
        value={columns}
        onValueChange={setColumns}
        getItemValue={getDealId}
        className="w-full"
      >
        <ScrollAreaPrimitive.Root
          data-slot="scroll-area"
          className="relative w-full min-w-0 pb-3"
        >
          <ScrollAreaPrimitive.Viewport
            data-slot="scroll-area-viewport"
            className="w-full rounded-lg transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
          >
            <ScrollAreaPrimitive.Content className="w-max min-w-full">
              <KanbanBoard className="flex min-w-full items-start gap-3 p-1">
                {Object.entries(columns).map(([id, deals]) => (
                  <StageColumn
                    key={id}
                    id={id as DealStageId}
                    deals={deals}
                    shown={shown}
                    onAdd={() => setAdding({ stage: id as DealStageId })}
                  />
                ))}
              </KanbanBoard>
            </ScrollAreaPrimitive.Content>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar
            orientation="horizontal"
            data-slot="scroll-area-scrollbar"
            className="flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent"
          >
            <ScrollAreaPrimitive.Thumb
              data-slot="scroll-area-thumb"
              className="relative flex-1 rounded-full bg-foreground/15"
            />
          </ScrollAreaPrimitive.Scrollbar>
        </ScrollAreaPrimitive.Root>
        <KanbanOverlay>
          {({ value, variant }) => {
            const stageDeals = (columns as Partial<Record<string, Deal[]>>)[
              value as string
            ]
            const deal = byId[value as string]
            if (variant === "column" && stageDeals)
              return (
                <StageColumn
                  id={value as DealStageId}
                  deals={stageDeals}
                  shown={shown}
                />
              )
            return deal ? (
              <div className="cursor-grabbing [--frame-panel-bg:var(--color-card)] [--frame-panel-border-color:var(--color-border)] [--frame-panel-radius:10px] *:border-foreground/20 *:shadow-sm">
                <DealCard deal={deal} />
              </div>
            ) : null
          }}
        </KanbanOverlay>
      </Kanban>
      <DealAddSheet
        open={!!adding}
        onOpenChange={(o) => !o && setAdding(null)}
        stage={adding?.stage}
        onCreate={(deal) =>
          setColumns((c) => ({ ...c, [deal.stage]: [deal, ...c[deal.stage]] }))
        }
      />
    </>
  )
}
