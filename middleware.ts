import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Dynamically determine the Supabase cookie names based on the project ref
const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(".")[0]
const accessTokenCookie = projectRef ? `sb-${projectRef}-auth-token` : "sb-access-token"
const refreshTokenCookie = projectRef ? `sb-${projectRef}-refresh-token` : "sb-refresh-token"

export async function middleware(req: NextRequest) {
  // Check if current domain is aihub.lasillavacia.com and redirect to www.elkit.ai
  if (req.nextUrl.hostname === 'aihub.lasillavacia.com') {
    const newUrl = new URL(req.nextUrl.pathname + req.nextUrl.search + req.nextUrl.hash, 'https://www.elkit.ai')
    return NextResponse.redirect(newUrl, 301)
  }

  const res = NextResponse.next()

  // Check if the user is trying to access auth routes with active auth cookies
  const hasSupabaseAuthCookie =
    req.cookies.has(accessTokenCookie) || req.cookies.has(refreshTokenCookie)

  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/reset-password")

  // If user appears to be authenticated and trying to access auth routes
  if (hasSupabaseAuthCookie && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}