import { NextRequest, NextResponse } from "next/server";

import { esAdministrador, verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { guardarConexionFacebook, guardarConexionInstagram } from "@/lib/en-vivo/conexiones";
import { canjearCodigo, COOKIE_STATE, cuentaInstagram, origenPublico, redirectUri, verificarTokenDePagina } from "@/lib/en-vivo/facebook";

export const dynamic = "force-dynamic";

/**
 * Paso 2: Facebook vuelve con el código. Se canjea por un token largo, se elige la página, se
 * verifica que su token no venza y se guarda.
 *
 * La página es la de META_PAGE_ID, obligatoria en Vercel: quien conecta puede administrar otras
 * páginas (la suya, la de otro medio) y no se debe adivinar. En local, sin la variable, sólo se
 * acepta si administra una sola página.
 */
function elegirPagina<P extends { id: string; name: string }>(paginas: P[]): { pagina: P } | { error: string } {
  const esperada = process.env.META_PAGE_ID?.trim();
  if (esperada) {
    const pagina = paginas.find((p) => p.id === esperada);
    return pagina ? { pagina } : { error: `Tu usuario no administra la página ${esperada} o no tiene permiso de crear contenido en ella.` };
  }
  if (process.env.VERCEL) return { error: "Falta META_PAGE_ID: define en Vercel el id de la página de Facebook que se va a conectar." };
  if (paginas.length === 1) return { pagina: paginas[0] };
  if (!paginas.length) return { error: "Tu usuario no administra ninguna página con permiso de crear contenido." };
  const lista = paginas.map((p) => `${p.name} (${p.id})`).join(", ");
  return { error: `Administras varias páginas: ${lista}. Define META_PAGE_ID con la que se va a conectar.` };
}

export async function GET(request: NextRequest) {
  const origen = origenPublico(request.headers, request.nextUrl.origin);
  const volver = (mensaje: string) => {
    const r = NextResponse.redirect(`${origen}/dashboard/en-vivo?facebook=${encodeURIComponent(mensaje)}`);
    r.cookies.delete({ name: COOKIE_STATE, path: "/api/en-vivo/facebook" });
    return r;
  };

  const { negado, organizationId, userId, role } = await verificarAccesoEnVivo();
  if (negado) return volver(negado.mensaje);
  if (!esAdministrador(role)) return volver("Sólo un administrador puede conectar la página de Facebook.");

  const q = request.nextUrl.searchParams;
  if (q.get("error")) return volver(q.get("error_description") || "Se canceló la conexión con Facebook.");
  const state = request.cookies.get(COOKIE_STATE)?.value;
  if (!state || state !== q.get("state")) return volver("La conexión con Facebook venció o no es válida. Inténtalo de nuevo.");
  const code = q.get("code");
  if (!code) return volver("Facebook no devolvió el código de autorización.");

  try {
    const { paginas, scopes } = await canjearCodigo(code, redirectUri(origen));
    const elegida = elegirPagina(paginas);
    if ("error" in elegida) return volver(elegida.error);
    const { pagina } = elegida;
    const token = await verificarTokenDePagina(pagina.access_token);
    if (!token.valido) return volver("Facebook dio un token de página que no es válido. Inténtalo de nuevo.");

    await guardarConexionFacebook(organizationId, userId, { pageId: pagina.id, pageName: pagina.name, pageToken: pagina.access_token, scopes });
    const aviso = token.vence ? " Ojo: el token de esta página vence; habrá que reconectar." : "";

    // Instagram sale del mismo login: la cuenta profesional vinculada a la página, si la hay y si
    // se concedieron los permisos. Si falla, Facebook queda conectado igual.
    let instagram = "";
    if (scopes.includes("instagram_content_publish")) {
      try {
        const cuenta = await cuentaInstagram(pagina.id, pagina.access_token);
        await guardarConexionInstagram(organizationId, userId, cuenta ? { igUserId: cuenta.id, usuario: cuenta.usuario, pageId: pagina.id } : null);
        instagram = cuenta ? ` Instagram: ${cuenta.usuario}.` : " La página no tiene una cuenta de Instagram profesional vinculada.";
      } catch (error) {
        console.error("[en-vivo] ❌ no se pudo leer la cuenta de Instagram:", error);
        instagram = " No se pudo leer la cuenta de Instagram vinculada.";
      }
    } else {
      instagram = " No se concedió el permiso de Instagram: para publicar ahí, reconecta y acéptalo.";
    }
    return volver(`Página conectada: ${pagina.name}.${instagram}${aviso}`);
  } catch (error) {
    console.error("[en-vivo] ❌ no se pudo conectar Facebook:", error);
    return volver(error instanceof Error ? error.message : "No se pudo conectar con Facebook.");
  }
}
