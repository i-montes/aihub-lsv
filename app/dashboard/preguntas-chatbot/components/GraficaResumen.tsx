"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { FilaResumenPreguntas } from "@/lib/preguntas-chatbot/tipos";

const COLORES = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

/**
 * Color fijo por tema, calculado sobre la lista completa de temas.
 *
 * Se calcula arriba y se pasa hacia abajo a propósito: si la gráfica se
 * asignara los colores por su cuenta, apagar un tema en los chips le
 * cambiaría el color a todos los demás.
 */
export function coloresPorTema(temas: string[]): Record<string, string> {
  return Object.fromEntries(
    temas.map((tema, i) => [tema, COLORES[i % COLORES.length]])
  );
}

/**
 * `resumen` viene en formato largo (una fila por fecha+tema). Recharts
 * necesita formato ancho para comparar varios temas en el mismo eje X —
 * una columna por tema, una fila por fecha.
 */
function aFormatoAncho(resumen: FilaResumenPreguntas[]) {
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

/**
 * La leyenda de Recharts no se dibuja: los temas se prenden y apagan con los
 * chips de ResultadoAgente, que hacen de leyenda y de filtro a la vez para
 * las dos vistas (gráfica y tabla).
 */
export function GraficaResumen({
  resumen,
  colores,
}: {
  resumen: FilaResumenPreguntas[];
  colores?: Record<string, string>;
}) {
  if (resumen.length === 0) return null;

  const { temas, filas } = aFormatoAncho(resumen);
  const paleta = colores ?? coloresPorTema(temas);
  const colorDe = (tema: string, i: number) =>
    paleta[tema] ?? COLORES[i % COLORES.length];

  const config: ChartConfig = Object.fromEntries(
    temas.map((tema, i) => [tema, { label: tema, color: colorDe(tema, i) }])
  );

  return (
    <ChartContainer config={config} className="h-[260px] w-full min-w-0 sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 16 }}
            tickFormatter={etiquetaFecha}
            minTickGap={8}
          />
          <YAxis tick={{ fontSize: 16 }} allowDecimals={false} width={44} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {temas.map((tema, i) => (
            <Bar key={tema} dataKey={tema} fill={colorDe(tema, i)} radius={4} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
