"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect } from "react"

import { Button } from "@/components/ui/button"

/** The key that flips light and dark on any screen, as on shadcn's docs */
const THEME_HOTKEY = "d"

/** Flip between light and dark from what's on screen now (the D key, the rail's Theme button, sign-in's toggle) */
export function useToggleTheme() {
  const { setTheme } = useTheme()
  return useCallback(
    () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "light" : "dark"
      ),
    [setTheme]
  )
}

/** Whether a key press is someone typing (a field, a textarea, anything editable), so D stays a letter there */
const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

/** D flips the theme anywhere in the app (the shell mounts this once) */
export function ThemeHotkey() {
  const toggle = useToggleTheme()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() !== THEME_HOTKEY ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.repeat ||
        typing(e.target)
      )
        return
      e.preventDefault()
      toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])
  return null
}

/** Two icons, the sun spinning out as the moon spins in; they swap on `dark:`, so they're right before hydration */
export function SunMoon() {
  return (
    <>
      <SunIcon className="scale-100 rotate-0 opacity-100 transition-[scale,rotate,opacity] duration-300 motion-reduce:transition-none dark:scale-0 dark:-rotate-90 dark:opacity-0" />
      <MoonIcon className="absolute scale-0 rotate-90 opacity-0 transition-[scale,rotate,opacity] duration-300 motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </>
  )
}

/** The sign-in page's toggle, borderless, top right; D works there too */
export function ThemeToggle() {
  const toggle = useToggleTheme()
  return (
    <>
      <ThemeHotkey />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        aria-keyshortcuts="D"
        className="relative text-muted-foreground [&_svg:not([class*='size-'])]:size-4.5"
        onClick={toggle}
      >
        <SunMoon />
      </Button>
    </>
  )
}
