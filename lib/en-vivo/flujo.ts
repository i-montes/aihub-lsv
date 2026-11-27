/**
 * Respuesta por streaming en NDJSON (un evento JSON por línea), como envivo-web: el navegador ve
 * cada paso mientras pasa y la conexión no se corta en las esperas largas, gracias a un latido cada
 * 15 segundos.
 */

export type Evento =
  | { tipo: "progreso"; paso: string }
  | { tipo: "nota"; titular: string; texto: string }
  | { tipo: "resultado"; [k: string]: unknown }
  | { tipo: "error"; mensaje: string }
  | { tipo: "latido" };

export function respuestaPorPasos(trabajo: (enviar: (e: Evento) => void) => Promise<void>): Response {
  const codificador = new TextEncoder();
  const cuerpo = new ReadableStream<Uint8Array>({
    async start(controlador) {
      let abierto = true;
      const enviar = (e: Evento) => {
        if (abierto) controlador.enqueue(codificador.encode(`${JSON.stringify(e)}\n`));
      };
      const latido = setInterval(() => enviar({ tipo: "latido" }), 15_000);
      try {
        await trabajo(enviar);
      } catch (error) {
        console.error("[en-vivo] ❌", error);
        enviar({ tipo: "error", mensaje: error instanceof Error ? error.message : "Algo salió mal." });
      } finally {
        clearInterval(latido);
        abierto = false;
        controlador.close();
      }
    },
  });
  return new Response(cuerpo, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function jsonError(mensaje: string, status: number): Response {
  return Response.json({ error: mensaje }, { status });
}
