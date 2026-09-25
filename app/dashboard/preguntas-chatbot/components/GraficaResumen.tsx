"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { FilaResumenPreguntas } from "@/lib/preguntas-chatbot/tipos";

const COLORES = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

/**
 * Fuera del componente a propósito, no por estilo.
 *
 * Recharts 3 registra cada eje en su store con un `useLayoutEffect` cuyas
 * dependencias incluyen las props del eje. Un objeto literal escrito en el
 * JSX es una referencia nueva en cada render, así que el efecto vuelve a
 * despachar, el store cambia, se renderiza otra vez y se cierra el ciclo:
 * "Maximum update depth exceeded". Con referencias estables no hay ciclo.
 */
const TICK = { fontSize: 16 } as const;
const MARGEN = { top: 8, right: 16, left: 0, bottom: 8 } as const;

/** Mismo motivo: en el JSX sería un elemento nuevo en cada render. */
const CONTENIDO_TOOLTIP = <ChartTooltipContent />;

/**
 * Descarta las filas que todavía no están completas.
 *
 * El resultado se pinta mientras llega: la página renderiza `part.input` en
 * cuanto existe, y el AI SDK va parseando ese JSON de a pedazos. Por ahí pasan
 * filas a medias —`{fecha}` sin `tema`, o sin `cantidad`— que el tipo promete
 * completas pero en ese instante no lo son. Con `tema` vacío, la clave de la
 * barra queda indefinida y React reclama que falta `key`.
 */
function filaCompleta(fila: FilaResumenPreguntas): boolean {
  return (
    typeof fila?.fecha === "string" &&
    fila.fecha.length > 0 &&
    typeof fila?.tema === "string" &&
    fila.tema.length > 0 &&
    typeof fila?.cantidad === "number" &&
    Number.isFinite(fila.cantidad)
  );
}

/**
 * `resumen` viene en formato largo (una fila por fecha+tema). Recharts
 * necesita formato ancho para comparar varios temas en el mismo eje X —
 * una columna por tema, una fila por fecha.
 */
function aFormatoAncho(resumenCrudo: FilaResumenPreguntas[]) {
  const resumen = (resumenCrudo ?? []).filter(filaCompleta);
  const temas = Array.from(new Set(resumen.map((f) => f.tema)));
  const porFecha = new Map<string, Record<string, string | number>>();

  for (const fila of resumen) {
    const existente = porFecha.get(fila.fecha) ?? { fecha: fila.fecha };
    existente[fila.tema] = fila.cantidad;
    porFecha.set(fila.fecha, existente);
  }

  return { temas, filas: Array.from(porFecha.values()) };
}

const MES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * "2026-09-09" se vuelve "9 sep": las etiquetas ISO completas no caben en el
 * eje X en pantallas angostas y la última queda cortada. Cualquier otro
 * formato (una semana, un mes, un rótulo libre) se deja como viene.
 */
function etiquetaFecha(valor: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return valor;
  const mes = MES_CORTO[Number(m[2]) - 1];
  return mes ? `${Number(m[3])} ${mes}` : valor;
}

export function GraficaResumen({ resumen }: { resumen: FilaResumenPreguntas[] }) {
  // Por lo mismo que TICK y MARGEN: `filas` y `config` alimentan props de
  // recharts, y recalcularlos en cada render los vuelve referencias nuevas.
  const { temas, filas } = useMemo(() => aFormatoAncho(resumen), [resumen]);
  const config: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        temas.map((tema, i) => [tema, { label: tema, color: COLORES[i % COLORES.length] }])
      ),
    [temas]
  );

  // Después de los hooks, no antes: salir temprano cambiaría cuántos hooks
  // ejecuta el componente cuando el resumen se queda sin filas. Se mira
  // `filas` y no `resumen` porque mientras llega el streaming puede haber
  // filas a medias que no dan para pintar nada.
  if (filas.length === 0) return null;

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[260px] w-full min-w-0 sm:h-[300px]"
    >
      <BarChart data={filas} margin={MARGEN}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="fecha"
          tick={TICK}
          tickFormatter={etiquetaFecha}
          minTickGap={8}
        />
        <YAxis tick={TICK} allowDecimals={false} width={44} />
        <ChartTooltip content={CONTENIDO_TOOLTIP} />
        {temas.length > 1 && <Legend />}
        {temas.map((tema, i) => (
          <Bar key={tema} dataKey={tema} fill={COLORES[i % COLORES.length]} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
