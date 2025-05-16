import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if we have a session cookie
  const hasSuperbaseAuthCookie = req.cookies.has("sb-access-token") || req.cookies.has("sb-refresh-token")

  // Check if the user is authenticated
  const isAuthenticated = hasSuperbaseAuthCookie

  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/reset-password")

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/reset-password/:path*"],
}
