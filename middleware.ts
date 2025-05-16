import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if the user is trying to access auth routes with active auth cookies
  const hasSuperbaseAuthCookie = req.cookies.has("sb-access-token") || req.cookies.has("sb-refresh-token")

  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/reset-password")

  // If user appears to be authenticated and trying to access auth routes
  if (hasSuperbaseAuthCookie && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/login", "/register", "/reset-password/:path*"],
}
