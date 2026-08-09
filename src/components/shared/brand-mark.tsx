import { cn } from "@/lib/utils"

/**
 * Knock's mark: a front door and its knob, the thing every rep's day is made of. Drawn on lucide's 24-unit grid in the
 * current colour; `src/app/icon.svg` and the home-screen icons in `public/icons` are the same drawing.
 */
function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M6.5 20V5.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2V20M4 20h16M14 12h.01" />
    </svg>
  )
}

/** The mark on its tile: near-black (the primary) with the glyph in white, `rounded-lg` */
export function BrandMark({
  className,
  glyphClassName,
}: {
  className?: string
  glyphClassName?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <BrandGlyph className={cn("size-5", glyphClassName)} />
    </span>
  )
}
