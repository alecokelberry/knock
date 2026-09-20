import {
  CalendarIcon,
  DoorOpenIcon,
  FilePenLineIcon,
  FileTextIcon,
  FlowerIcon,
  HouseIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareIcon,
  MountainIcon,
  MountainSnowIcon,
  PhoneIcon,
  SparklesIcon,
  SprayCanIcon,
  SunIcon,
  TreeDeciduousIcon,
  TreePineIcon,
  TreesIcon,
  WavesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LIFECYCLE_DOT, type Lifecycle } from "@/data/contacts"
import { cn } from "@/lib/utils"

/** The Lucide icon each territory uses (src/data/territories.ts names them) */
const TERRITORY_ICONS: Record<string, LucideIcon> = {
  flower: FlowerIcon,
  house: HouseIcon,
  "map-pin": MapPinIcon,
  mountain: MountainIcon,
  "mountain-snow": MountainSnowIcon,
  sun: SunIcon,
  "tree-deciduous": TreeDeciduousIcon,
  "tree-pine": TreePineIcon,
  trees: TreesIcon,
  waves: WavesIcon,
}

/** The icon for each Last Activity kind */
const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  calendar: CalendarIcon,
  "door-open": DoorOpenIcon,
  "file-pen-line": FilePenLineIcon,
  "file-text": FileTextIcon,
  mail: MailIcon,
  "message-square": MessageSquareIcon,
  phone: PhoneIcon,
  sparkles: SparklesIcon,
  "spray-can": SprayCanIcon,
}

export function TerritoryIcon({
  icon,
  className,
}: {
  icon: string
  className?: string
}) {
  const Icon = TERRITORY_ICONS[icon] ?? MapPinIcon
  return <Icon aria-hidden className={className} />
}

export function ActivityIcon({
  icon,
  className,
}: {
  icon: string
  className?: string
}) {
  const Icon = ACTIVITY_ICONS[icon] ?? SparklesIcon
  return (
    <Icon
      aria-hidden
      className={cn("size-3.5 shrink-0 text-muted-foreground", className)}
    />
  )
}

/** The small badges: 20px tall, 12px type */
export const BADGE = "h-5 min-w-5 gap-1 rounded-sm px-1.25 py-0.5 text-xs"

/** A lifecycle stage as an outline badge with its coloured dot */
export function LifecycleBadge({ lifecycle }: { lifecycle: Lifecycle }) {
  return (
    <Badge variant="outline" className={BADGE}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full!",
          LIFECYCLE_DOT[lifecycle]
        )}
      />
      {lifecycle}
    </Badge>
  )
}

/** A dot between two bits of meta text */
export const Dot = () => (
  <span
    aria-hidden
    className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
  />
)

/**
 * A tile's background with white initials on it: the -500 and -600 swatches fail AA with white text, so each takes the
 * -700 of its hue (violet-600 already passes)
 */
const TILE_INK: Record<string, string> = {
  "bg-sky-500": "bg-sky-700",
  "bg-violet-600": "bg-violet-600",
  "bg-emerald-600": "bg-emerald-700",
  "bg-amber-500": "bg-amber-700",
  "bg-rose-500": "bg-rose-700",
  "bg-fuchsia-600": "bg-fuchsia-700",
  "bg-orange-600": "bg-orange-700",
  "bg-green-600": "bg-green-700",
}
export const tileInk = (bg: string) => TILE_INK[bg] ?? bg
