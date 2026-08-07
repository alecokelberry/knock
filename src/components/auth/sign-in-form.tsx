"use client"

import { ChevronRightIcon } from "lucide-react"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { BrandMark } from "@/components/shared/brand-mark"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { ThemeToggle } from "@/components/shell/theme-toggle"
import { FieldError } from "@/components/ui/field"
import { Frame, FramePanel } from "@/components/ui/frame"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { DEMO_ACCOUNT, DEMO_PASSWORD } from "@/lib/demo-account"

/**
 * One card centred on a grained surface: the brand tile and name, then the one way in. The demo account's card
 * (face, name, title, a chevron) signs in with one tap; there is no email form, password reset or sign-up.
 */
export function SignInForm({ next }: { next: Route | null }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const me = DEMO_ACCOUNT

  function signIn() {
    setError(null)
    startTransition(async () => {
      const { error: failed } = await authClient.signIn.email({
        email: me.email,
        password: DEMO_PASSWORD,
      })
      if (failed) {
        setError(
          failed.status === 429
            ? "Too many tries. Wait a minute, then try again."
            : "That account couldn't sign in. Try again."
        )
        return
      }
      router.replace(next ?? "/")
      router.refresh()
    })
  }

  return (
    <div className="relative isolate flex min-h-svh flex-col bg-muted dark:bg-background">
      {/* Grain: SVG noise over the surface, darker specks in light, lighter in dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22] mix-blend-multiply dark:opacity-[0.12] dark:mix-blend-screen dark:invert"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* In the page's flow, not over it, so a phone's card never runs under it */}
      <div className="flex justify-end p-3 sm:p-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-8">
        <div className="flex w-full max-w-[28rem] flex-col gap-4">
          <Frame>
            <FramePanel className="p-9 sm:p-11">
              <div className="mb-9 flex flex-col items-center gap-5 pt-3 text-center">
                <BrandMark
                  className="size-10 rounded-xl"
                  glyphClassName="size-5"
                />
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-[28px] leading-[1.333] font-semibold tracking-tight">
                    Knock
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    A door-to-door sales CRM.
                  </p>
                </div>
              </div>
              <ItemGroup aria-label="Demo account" className="gap-2">
                <div role="listitem">
                  <Item
                    variant="outline"
                    className="flex-nowrap text-left hover:bg-muted disabled:opacity-50"
                    render={
                      <button
                        type="button"
                        aria-label={`Sign in as ${me.name}`}
                        disabled={pending}
                        onClick={signIn}
                      />
                    }
                  >
                    <ItemMedia>
                      <PersonAvatar name={me.name} />
                    </ItemMedia>
                    <ItemContent className="min-w-0 gap-0">
                      <ItemTitle>{me.name}</ItemTitle>
                      <ItemDescription>{me.title}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="shrink-0 text-muted-foreground">
                      {pending ? (
                        <Spinner />
                      ) : (
                        <ChevronRightIcon aria-hidden className="size-4" />
                      )}
                    </ItemActions>
                  </Item>
                </div>
              </ItemGroup>
              {error && (
                <FieldError role="alert" className="mt-3">
                  {error}
                </FieldError>
              )}
            </FramePanel>
          </Frame>
        </div>
      </main>
    </div>
  )
}
