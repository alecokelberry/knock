// An optimistic sign-in check on every page, from the session cookie alone (no database: the proxy runs on prefetches
// too). The real check is `requireUser` in the shell's layout. Public: the sign-in page and Better Auth's endpoints.
import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

const PUBLIC = ["/sign-in", "/api/auth/"]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p)))
    return NextResponse.next()
  if (getSessionCookie(request)) return NextResponse.next()
  const signIn = new URL("/sign-in", request.url)
  if (pathname !== "/") signIn.searchParams.set("next", pathname + search)
  return NextResponse.redirect(signIn)
}

export const config = {
  // Everything but Next's own files and static assets
  matcher: [
    "/((?!_next/static|_next/image|icon|apple-icon|manifest.webmanifest|.*\\.(?:png|svg|jpg|webp|ico)$).*)",
  ],
}
