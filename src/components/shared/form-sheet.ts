/**
 * The floating form sheet: 28rem wide, inset 1rem from the viewport's edges on every side, rounded, on the
 * popover surface, its body scrolling between a fixed header and footer. Every "Add …" / "New …" sheet uses it
 * (wider ones for the quote and approval sheets set their own).
 */
export const FORM_SHEET =
  "inset-y-4! right-4! left-auto z-50 flex h-[calc(100svh-2rem)]! w-[min(28rem,calc(100vw-2rem))]! max-w-[28rem]! flex-col gap-0 overflow-hidden rounded-xl border-0! bg-popover p-0 outline-none"
