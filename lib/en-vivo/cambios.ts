import sharp from "sharp";
import { generateObject } from "ai";
import { z } from "zod";

import { leerArchivo } from "@/lib/en-vivo/almacen";
import { enLienzo } from "@/lib/en-vivo/geometria";
import type { ContextoModelo } from "@/lib/en-vivo/modelo";
import { PESTANA_CAMBIOS, pestanaPrompt } from "@/lib/en-vivo/prompt-base";
import type { Pieza } from "@/lib/en-vivo/tipos";
import { MAX_OUTPUT_TOKENS } from "@/lib/proveedores/opciones-modelo";

// En envivo-web, "Pedir cambios" mandaba a Claude a editar el diseño en Canva. Aquí el modelo
// sólo decide los parámetros nuevos de la pieza (titular, texto, etiquetas, corrimientos) y la
// pieza se vuelve a armar con el mismo flujo determinista de pieza.ts.

const Cambios = z.object({
  titular: z.string(),
  texto: z.string(),
  etiquetas: z.array(z.object({ indice: z.number(), persona: z.string(), cargo: z.string() })),
  ajustes: z.object({
    foto: z.object({ dx: z.number(), dy: z.number() }),
    etiquetas: z.array(z.object({ indice: z.number(), dx: z.number(), dy: z.number() })),
  }),
  nota: z.string(),
});

/** La pieza como la ve el modelo: lo editable, más dónde quedó cada cosa en el lienzo. */
function describir(p: Pieza) {
  const cabezas = p.encuadre ? p.cabezas.map((c) => enLienzo(c, p.encuadre!)) : [];
  return {
    titular: p.titular,
    texto: p.texto,
    link_de_la_nota: p.url,
    cabezas_en_el_lienzo: cabezas.map((c, indice) => ({ indice, ...c })),
    etiquetas: p.etiquetas.map((e) => {
      const ubicada = p.ubicadas.find((u) => u.persona === e.persona);
      return { ...e, recuadro: ubicada?.recuadro ?? null, ubicacion: ubicada?.modo ?? "sin espacio" };
    }),
    ajustes: p.ajustes,
    avisos: [...p.avisos, ...p.avisosGeometria],
  };
}

export async function aplicarCambios(pieza: Pieza, pedido: string, ctx: ContextoModelo): Promise<{ pieza: Pieza; nota: string }> {
  const imagen = pieza.imagen ? await leerArchivo(pieza.imagen) : null;
  const vista = imagen ? await sharp(imagen).resize({ width: 540 }).jpeg({ quality: 80 }).toBuffer() : null;

  const instrucciones = pestanaPrompt(ctx.pestanas, PESTANA_CAMBIOS);
  const { object, usage } = await generateObject({
    model: ctx.model,
    schema: Cambios,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: ctx.providerOptions,
    messages: [
      {
        role: "user",
        content: [
          ...(vista ? [{ type: "image" as const, image: vista, mediaType: "image/jpeg" }] : []),
          {
            type: "text",
            text: `${instrucciones}

${vista ? "La imagen adjunta es la pieza actual, reducida a la mitad (las coordenadas de abajo son del lienzo completo de 1080x1350)." : "No hay imagen de la pieza actual."}

<pieza>
${JSON.stringify(describir(pieza), null, 2)}
</pieza>

<pedido>
${pedido}
</pedido>`,
          },
        ],
      },
    ],
  });
  ctx.registrar(usage);

  const etiquetas = object.etiquetas
    .filter((e) => e.persona.trim() && pieza.cabezas[e.indice])
    .slice(0, 2)
    .map((e) => ({ indice: e.indice, persona: e.persona.trim(), cargo: e.cargo.trim().slice(0, 30) }));
  const texto = object.texto.trim() || pieza.texto;

  return {
    pieza: {
      ...pieza,
      titular: object.titular.trim() || pieza.titular,
      // El link de la nota va siempre al final, aunque el modelo lo quite.
      texto: texto.includes(pieza.url) ? texto : `${texto}\n\n${pieza.url}`,
      etiquetas,
      ajustes: {
        foto: { dx: Math.round(object.ajustes.foto.dx), dy: Math.round(object.ajustes.foto.dy) },
        etiquetas: object.ajustes.etiquetas
          .filter((a) => pieza.cabezas[a.indice])
          .map((a) => ({ indice: a.indice, dx: Math.round(a.dx), dy: Math.round(a.dy) })),
      },
    },
    nota: object.nota,
  };
}
