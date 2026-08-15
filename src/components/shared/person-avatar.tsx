import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PORTRAITS } from "@/data/portraits"

/** A person's slug: their name in kebab case, which is also their portrait's file name */
const slugOf = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")

/**
 * Anyone's avatar: their portrait (src/data/portraits.ts) over initials,
 * which show while it loads and for anyone without one. The vendored Avatar's sizes (sm 24, default 32, lg 40);
 * any other size through `className` (`size-5`, `size-9`…). Beside the name it's decoration; `labelled` names
 * it for an avatar that stands alone. `status` adds the corner dot (a colour class, e.g. `bg-emerald-500`).
 */
export function PersonAvatar({
  name,
  size = "default",
  labelled = false,
  status,
  className,
}: {
  name: string
  size?: "sm" | "default" | "lg"
  labelled?: boolean
  status?: string
  className?: string
}) {
  const slug = slugOf(name)
  const src = PORTRAITS.has(slug) ? `/people/${slug}.jpg` : null
  return (
    <Avatar
      size={size}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? name : undefined}
      aria-hidden={labelled ? undefined : true}
      className={className}
    >
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback
        delay={src ? 400 : undefined}
        className="font-medium text-foreground/75 group-data-[size=sm]/avatar:text-[10px]"
      >
        {initials(name)}
      </AvatarFallback>
      {status && <AvatarBadge className={status} />}
    </Avatar>
  )
}
