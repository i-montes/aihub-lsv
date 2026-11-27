import { NextRequest } from "next/server";

import { AnalyticsEnVivoService } from "@/lib/analytics";
import { verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { jsonError, respuestaPorPasos } from "@/lib/en-vivo/flujo";
import { contextoModelo, SinProveedorError, totalUso } from "@/lib/en-vivo/modelo";
import { generar } from "@/lib/en-vivo/pieza";
import { ProveedorNoConfiguradoError } from "@/lib/proveedores/configuracion";

/** Leer la nota, mirar la foto y armar la pieza toma de 15 a 40 segundos; Vercel admite 300. */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { negado, organizationId, userId } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  if (typeof body?.url !== "string" || !body.url.trim()) return jsonError("Falta el link de la nota.", 400);

  let ctx;
  try {
    ctx = await contextoModelo(organizationId, body.proveedor);
  } catch (error) {
    const conocido = error instanceof SinProveedorError || error instanceof ProveedorNoConfiguradoError;
    return jsonError(conocido ? (error as Error).message : "No se pudo obtener la configuración del proveedor", 400);
  }

  return respuestaPorPasos(async (enviar) => {
    const inicio = Date.now();
    const pieza = await generar(
      {
        url: body.url,
        foto: body.foto?.datos ? { datos: String(body.foto.datos), nombre: String(body.foto.nombre ?? "foto") } : null,
        texto: typeof body.texto === "string" ? body.texto : null,
      },
      organizationId,
      ctx,
      (paso) => enviar({ tipo: "progreso", paso }),
      (nota, texto) => enviar({ tipo: "nota", titular: nota.titular, texto }),
    );

    const uso = totalUso(ctx);
    const analytics = new AnalyticsEnVivoService({
      session_id: crypto.randomUUID(),
      user_id: userId,
      organization_id: organizationId,
      url_nota: pieza.url,
      titular: pieza.titularNota,
      personas: pieza.etiquetas.map((e) => e.persona),
      motor: pieza.motor,
      autofills_canva: pieza.motor === "canva" ? 1 : 0,
      cambios_pedidos: 0,
      publicada: false,
      descargada: false,
      modelo_utilizado: `${ctx.configuracion.proveedor}:${uso.modelo}`,
      input_tokens: uso.inputTokens,
      output_tokens: uso.outputTokens,
      total_tokens: uso.inputTokens + uso.outputTokens,
      reasoning_tokens: uso.reasoningTokens,
      cached_input_tokens: uso.cachedInputTokens,
      cache_write_tokens: uso.cacheWriteTokens,
      costo: uso.costo,
      tiempo_procesamiento: Date.now() - inicio,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await analytics.save();
    analytics.avisarSiNoGuardo("en vivo generada");

    enviar({ tipo: "resultado", pieza, analyticsId: analytics.guardadoOk ? analytics.schema.id : null, costo: uso.costo });
  });
}
