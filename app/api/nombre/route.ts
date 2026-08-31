import { NextRequest, NextResponse } from "next/server";

import { verificarAccesoQuienEsQuien } from "@/lib/quien-es-quien/acceso";
import { MAX_NOMBRE_LENGTH } from "@/app/dashboard/quien-es-quien/constants";

/** El upstream tarda entre 3 y 10 segundos: con el default de Vercel sobra. */
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const NOMBRE_API_URL = "https://quienai.vercel.app/api/nombre";

function jsonError(mensaje: string, status: number) {
  return NextResponse.json({ error: mensaje }, { status });
}

/**
 * POST /api/nombre
 *
 * Proxy del API que resuelve un nombre contra el archivo antes de generar el
 * perfil. Existe por lo mismo que `/api/perfil`: el token no puede viajar al
 * navegador.
 *
 * Esta llamada cuesta ~$0.003 —cien veces menos que un perfil— y es lo que
 * evita gastar $0.35 y dos minutos en la persona equivocada por un nombre mal
 * tecleado o ambiguo.
 */
export async function POST(request: NextRequest) {
  const token = process.env.PERFILBOT_TOKEN;

  if (!token) {
    return jsonError(
      "Falta configurar el acceso al generador de perfiles. Avisa al equipo técnico.",
      500
    );
  }

  const negado = await verificarAccesoQuienEsQuien();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

  if (!nombre) {
    return jsonError("Escribe el nombre de la persona", 400);
  }

  if (nombre.length > MAX_NOMBRE_LENGTH) {
    return jsonError(
      `El nombre no puede pasar de ${MAX_NOMBRE_LENGTH} caracteres`,
      400
    );
  }

  let upstream: Response;

  try {
    upstream = await fetch(NOMBRE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
      signal: request.signal,
    });
  } catch (error) {
    console.error("Error llamando al API de nombres:", error);
    return jsonError("No se pudo conectar con el buscador de nombres", 502);
  }

  const datos = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const mensaje =
      typeof datos?.error === "string" ? datos.error : "No se pudo verificar el nombre";
    console.error(`API de nombres respondió ${upstream.status}:`, mensaje);
    return jsonError(mensaje, upstream.status);
  }

  if (!datos) {
    return jsonError("El buscador de nombres respondió algo ilegible", 502);
  }

  return NextResponse.json(datos);
}
