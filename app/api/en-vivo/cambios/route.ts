import { NextRequest } from "next/server";

import { AnalyticsEnVivoService } from "@/lib/analytics";
import { verificarAccesoEnVivo } from "@/lib/en-vivo/acceso";
import { aplicarCambios } from "@/lib/en-vivo/cambios";
import { jsonError, respuestaPorPasos } from "@/lib/en-vivo/flujo";
import { contextoModelo, SinProveedorError, totalUso } from "@/lib/en-vivo/modelo";
import { armar } from "@/lib/en-vivo/pieza";
import type { Pieza } from "@/lib/en-vivo/tipos";
import { ProveedorNoConfiguradoError } from "@/lib/proveedores/configuracion";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Lo mínimo para no armar sobre basura: la pieza la manda el navegador. */
function esPieza(p: unknown): p is Pieza {
  const x = p as Pieza | null;
  return !!x && typeof x.url === "string" && typeof x.titular === "string" && typeof x.texto === "string" && Array.isArray(x.cabezas) && Array.isArray(x.etiquetas) && !!x.ajustes;
}

export async function POST(request: NextRequest) {
  const { negado, organizationId } = await verificarAccesoEnVivo();
  if (negado) return jsonError(negado.mensaje, negado.status);

  const body = await request.json().catch(() => null);
  if (!esPieza(body?.pieza)) return jsonError("Falta la pieza.", 400);
  const instrucciones = typeof body.instrucciones === "string" ? body.instrucciones.trim() : "";
  if (!instrucciones) return jsonError("Escribe qué quieres cambiar.", 400);

  let ctx;
  try {
    ctx = await contextoModelo(organizationId, body.proveedor);
  } catch (error) {
    const conocido = error instanceof SinProveedorError || error instanceof ProveedorNoConfiguradoError;
    return jsonError(conocido ? (error as Error).message : "No se pudo obtener la configuración del proveedor", 400);
  }

  return respuestaPorPasos(async (enviar) => {
    const anterior: Pieza = body.pieza;
    enviar({ tipo: "progreso", paso: "Entendiendo el cambio" });
    const { pieza: pedida, nota } = await aplicarCambios(anterior, instrucciones, ctx);

    // Si sólo cambió el texto, la imagen queda igual: ni Canva ni etiquetas.
    const igualImagen =
      pedida.titular === anterior.titular &&
      JSON.stringify([pedida.etiquetas, pedida.ajustes]) === JSON.stringify([anterior.etiquetas, anterior.ajustes]);
    const pieza = igualImagen ? pedida : await armar(pedida, organizationId, (paso) => enviar({ tipo: "progreso", paso }));
    const usoCanva = pieza.base?.huella !== anterior.base?.huella && pieza.motor === "canva";

    const uso = totalUso(ctx);
    if (body.analyticsId != null) {
      const a = new AnalyticsEnVivoService({}, body.analyticsId);
      await a.ensureLoaded();
      const previo = a.schema;
      await a.updateSchema({
        cambios_pedidos: (previo.cambios_pedidos ?? 0) + 1,
        autofills_canva: (previo.autofills_canva ?? 0) + (usoCanva ? 1 : 0),
        titular: pieza.titularNota,
        personas: pieza.etiquetas.map((e) => e.persona),
        input_tokens: (previo.input_tokens ?? 0) + uso.inputTokens,
        output_tokens: (previo.output_tokens ?? 0) + uso.outputTokens,
        total_tokens: (previo.total_tokens ?? 0) + uso.inputTokens + uso.outputTokens,
        costo: uso.costo == null || previo.costo == null ? null : Number(previo.costo) + uso.costo,
        updated_at: new Date(),
      });
    }

    enviar({ tipo: "resultado", pieza, nota, costo: uso.costo });
  });
}
