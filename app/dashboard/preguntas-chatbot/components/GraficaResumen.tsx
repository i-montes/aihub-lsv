"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { FilaResumenPreguntas } from "@/lib/preguntas-chatbot/tipos";

const COLORES = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

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

export function GraficaResumen({ resumen }: { resumen: FilaResumenPreguntas[] }) {
  if (resumen.length === 0) return null;

  const { temas, filas } = aFormatoAncho(resumen);
  const config: ChartConfig = Object.fromEntries(
    temas.map((tema, i) => [tema, { label: tema, color: COLORES[i % COLORES.length] }])
  );

  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {temas.length > 1 && <Legend />}
          {temas.map((tema, i) => (
            <Bar key={tema} dataKey={tema} fill={COLORES[i % COLORES.length]} radius={4} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
