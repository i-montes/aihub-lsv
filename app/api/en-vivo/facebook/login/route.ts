import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { esAdministrador, verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { COOKIE_STATE, origenPublico, redirectUri, urlDeLogin } from "@/lib/en-vivo/facebook";

export const dynamic = "force-dynamic";

/** Paso 1 de "Conectar con Facebook": sólo OWNER o ADMIN. Guarda un state y manda al diálogo de Facebook. */
export async function GET(request: NextRequest) {
  const origen = origenPublico(request.headers, request.nextUrl.origin);
  const volver = (mensaje: string) =>
    NextResponse.redirect(`${origen}/dashboard/en-vivo?facebook=${encodeURIComponent(mensaje)}`);

  const { negado, role } = await verificarAccesoEnVivo();
  if (negado) return volver(negado.mensaje);
  if (!esAdministrador(role)) return volver("Sólo un administrador puede conectar la página de Facebook.");

  let destino: string;
  try {
    const state = randomBytes(16).toString("hex");
    destino = urlDeLogin(state, redirectUri(origen));
    const r = NextResponse.redirect(destino);
    r.cookies.set(COOKIE_STATE, state, {
      httpOnly: true,
      secure: origen.startsWith("https:"),
      sameSite: "lax",
      path: "/api/en-vivo/facebook",
      maxAge: 600,
    });
    return r;
  } catch (error) {
    return volver(error instanceof Error ? error.message : "No se pudo iniciar la conexión con Facebook.");
  }
}
