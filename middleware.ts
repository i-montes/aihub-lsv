import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/settings",
  "/dashboard/corrections",
  "/dashboard/threads",
  "/dashboard/writing-assistant",
]

// Rutas de autenticación
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Verificar si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  const path = req.nextUrl.pathname

  // Redirigir a usuarios no autenticados a la página de inicio de sesión
  if (!isAuthenticated && protectedRoutes.some((route) => path.startsWith(route))) {
    const redirectUrl = new URL("/auth/login", req.url)
    redirectUrl.searchParams.set("redirectUrl", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirigir a usuarios autenticados al dashboard si intentan acceder a rutas de autenticación
  if (isAuthenticated && authRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * 1. Todas las rutas que comienzan con /api, _next, static, public, favicon.ico
     * 2. Todas las rutas que terminan con un punto (archivos)
     */
    "/((?!api|_next|static|public|favicon.ico).*)",
  ],
}
