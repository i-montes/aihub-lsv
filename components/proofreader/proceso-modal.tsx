"use client";

import { useState } from "react";
import { Activity, Check, TriangleAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PasoDeFrase } from "@/lib/proofreader/correccion-por-frase";

type Props = {
  traza: PasoDeFrase[];
  detalle: Record<string, any> | null;
  /** El cuerpo de la primera petición al tamiz, tal como se envió. */
  peticion?: unknown;
  /** Una fila por petición del tamiz. */
  peticiones?: Array<{ n: number; frases: number; preguntas: number; tokens: number; ms: number }>;
  /** Lo que se le manda al corrector: instrucciones, manual y una frase. */
  promptCorrector?: { modelo: string; system: string; prompt: string } | null;
};

/**
 * Qué pasó con cada frase, en orden.
 *
 * El corrector ya no es una llamada que devuelve correcciones: parte el texto,
 * descarta frases con un modelo y corrige con otro. Cuando una sugerencia
 * esperada no aparece, lo único que hace falta saber es en qué escalón se cayó
 * —si el tamiz nunca la marcó, o si la marcó y el corrector no vio nada— y eso
 * es justo lo que esta vista muestra.
 */
export function ProcesoModal({
  traza,
  detalle,
  peticion,
  peticiones = [],
  promptCorrector,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [soloMarcadas, setSoloMarcadas] = useState(false);
  const [verPeticion, setVerPeticion] = useState(false);
  const [verPrompt, setVerPrompt] = useState(false);

  const marcadas = traza.filter((p) => p.marcada);
  const conError = traza.filter((p) => p.error);
  const visibles = soloMarcadas ? marcadas : traza;

  const umbral = typeof detalle?.umbral === "number" ? detalle.umbral : 0.7;

  // Dónde se fue el tiempo. El tamiz son una o dos peticiones cortas; el
  // corrector son decenas de llamadas a un LLM. Cuando el análisis se siente
  // lento casi siempre es la segunda etapa, y conviene que se vea separado en
  // vez de tener que deducirlo de un total.
  const finDelTamiz = Math.max(0, ...traza.map((p) => p.msTamiz));
  const msTotal = typeof detalle?.msTotal === "number" ? detalle.msTotal : 0;
  const msCorreccion = Math.max(0, msTotal - finDelTamiz);
  const seg = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Activity className="h-4 w-4" />
          Ver proceso
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cómo se analizó el texto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Dato titulo="Frases" valor={traza.length} />
          <Dato titulo="Marcadas" valor={marcadas.length} />
          <Dato
            titulo="Correcciones"
            valor={traza.reduce((n, p) => n + (p.correcciones?.length ?? 0), 0)}
          />
          <Dato titulo="Duración" valor={msTotal ? seg(msTotal) : "—"} />
        </div>

        {/* El modelo del tamiz lo reporta la propia API de TypeSafe, no lo
            escribe este código: es la prueba de que Jev contestó de verdad. */}
        <div className="space-y-1 rounded-lg border p-3 text-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              <strong>Tamiz</strong> · {detalle?.modeloTamiz ?? "—"} ·{" "}
              {detalle?.peticionesTamiz ?? 0} petición(es) ·{" "}
              {detalle?.tokensTamiz ?? 0} tokens · umbral {umbral}
            </span>
            <span className="font-mono">{seg(finDelTamiz)}</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              <strong>Corrector</strong> · {detalle?.modeloCorrector ?? "—"} ·{" "}
              {marcadas.length} llamada(s) en paralelo
            </span>
            <span className="font-mono">{seg(msCorreccion)}</span>
          </div>
          {conError.length > 0 && (
            <div className="text-amber-700">
              {conError.length} frase(s) con error. Si son todas del corrector, suele
              ser que el modelo no existe o que falta su clave.
            </div>
          )}
        </div>

        {/* La petición de verdad, no una maqueta: es el cuerpo que salió hacia
            api.typesafe.ai. Colapsada porque lleva el catálogo entero dentro. */}
        {peticion != null && (
          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setVerPeticion((v) => !v)}
              className="flex w-full items-center justify-between p-3 text-left text-xs hover:bg-muted/50"
            >
              <span>
                <strong>La petición que se envió</strong> ·{" "}
                {peticiones.length || 1} a POST api.typesafe.ai/v1/systemone
              </span>
              <span className="font-mono">{verPeticion ? "▾" : "▸"}</span>
            </button>

            {verPeticion && (
              <div className="space-y-2 border-t p-3">
                {peticiones.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {peticiones.map((p) => (
                      <div key={p.n} className="flex justify-between gap-3 font-mono">
                        <span>
                          #{p.n} · {p.frases} frases · {p.preguntas} preguntas
                        </span>
                        <span>
                          {p.tokens} tok · {p.ms} ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Cuerpo de la primera (las demás son idénticas salvo las frases):
                </p>
                <pre className="max-h-72 overflow-auto rounded bg-muted p-2 text-[11px] leading-relaxed">
                  {JSON.stringify(peticion, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* La otra mitad: el tamiz pregunta con datos tipados, pero el que
            escribe la corrección es un LLM normal y lo que recibe es prosa. */}
        {promptCorrector && (
          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setVerPrompt((v) => !v)}
              className="flex w-full items-center justify-between p-3 text-left text-xs hover:bg-muted/50"
            >
              <span>
                <strong>Lo que recibe el corrector</strong> · {promptCorrector.modelo} ·
                una llamada por frase marcada
              </span>
              <span className="font-mono">{verPrompt ? "▾" : "▸"}</span>
            </button>

            {verPrompt && (
              <div className="space-y-2 border-t p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>system</strong> — instrucciones y manual completo. Es idéntico
                  en todas las frases, que es lo que permite cachearlo.
                </p>
                <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px] leading-relaxed whitespace-pre-wrap">
                  {promptCorrector.system}
                </pre>
                <p className="text-xs text-muted-foreground">
                  <strong>user</strong> — una frase con sus reglas sospechosas. Cambia en
                  cada llamada; esta es la de la primera frase marcada.
                </p>
                <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px] leading-relaxed whitespace-pre-wrap">
                  {promptCorrector.prompt}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={soloMarcadas ? "outline" : "secondary"}
            size="sm"
            onClick={() => setSoloMarcadas(false)}
          >
            Todas ({traza.length})
          </Button>
          <Button
            variant={soloMarcadas ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSoloMarcadas(true)}
          >
            Sólo marcadas ({marcadas.length})
          </Button>
        </div>

        <ScrollArea className="h-[52vh] pr-3">
          <div className="space-y-2">
            {visibles.map((paso) => (
              <Paso key={paso.indice} paso={paso} umbral={umbral} />
            ))}
            {visibles.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay frases que mostrar.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{titulo}</div>
      <div className="text-xl font-semibold">{valor}</div>
    </div>
  );
}

function Paso({ paso, umbral }: { paso: PasoDeFrase; umbral: number }) {
  const estado = paso.error
    ? { icono: <TriangleAlert className="h-4 w-4 text-amber-600" />, borde: "border-amber-300" }
    : paso.marcada
      ? { icono: <Check className="h-4 w-4 text-emerald-600" />, borde: "border-emerald-300" }
      : { icono: <X className="h-4 w-4 text-muted-foreground" />, borde: "" };

  return (
    <div className={`rounded-lg border p-3 ${estado.borde}`}>
      <div className="flex items-start gap-2">
        {estado.icono}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">F{String(paso.indice).padStart(3, "0")}</span>
            <span>·</span>
            {/* El número que decide todo: por debajo del umbral la frase no se
                corrige, por más que el choice haya señalado una regla. */}
            <span>
              ¿algo roto?{" "}
              <strong className={paso.rompe >= umbral ? "text-emerald-700" : ""}>
                {paso.rompe.toFixed(2)}
              </strong>{" "}
              de {umbral}
            </span>
            <span>·</span>
            <span>tamiz {paso.msTamiz} ms</span>
            {paso.msCorreccion !== undefined && (
              <>
                <span>·</span>
                <span>corrector {paso.msCorreccion} ms</span>
              </>
            )}
            {paso.error && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                falló el {paso.error === "tamiz" ? "tamiz" : "corrector"}
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm">{paso.texto}</p>

          {paso.candidatas.length > 0 && (
            /* El reparto completo del choice, no sólo lo que pasó el corte.
               Con 53 reglas compitiendo, la que acierta puede quedarse en 0,08,
               así que ver dónde cae la línea es lo que permite ajustarla. */
            <div className="mt-2 space-y-0.5">
              {paso.candidatas.map((c, i) => {
                const enviada = c.enviada !== false;
                const corte =
                  i > 0 && paso.candidatas[i - 1].enviada !== false && !enviada;
                return (
                  <div key={c.id}>
                    {corte && (
                      <div className="my-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        corte — de aquí abajo no se le mandan al corrector
                        <span className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-2 text-xs ${enviada ? "" : "opacity-50"}`}
                      title={c.regla}
                    >
                      <span className="w-10 shrink-0 text-right font-mono">
                        {c.probabilidad.toFixed(3)}
                      </span>
                      {/* La barra hace visible de un vistazo si el reparto está
                          concentrado en una regla o desparramado en muchas. */}
                      <span className="h-2 w-24 shrink-0 overflow-hidden rounded bg-muted">
                        <span
                          className={`block h-full ${enviada ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
                          style={{ width: `${Math.min(100, c.probabilidad * 100)}%` }}
                        />
                      </span>
                      <span className="truncate">
                        <strong>{c.categoria}</strong> · {c.regla}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {paso.marcada &&
            paso.correcciones?.length === 0 && (
            // El tamiz se equivoca a propósito hacia marcar de más; que el
            // corrector no encuentre nada es un resultado válido, no un fallo.
            <p className="mt-2 text-xs text-muted-foreground">
              El corrector la revisó y no encontró nada que cambiar.
            </p>
          )}

          {paso.correcciones?.map((c, i) => (
            <div
              key={i}
              className={`mt-2 rounded border p-2 text-sm ${
                c.descartada ? "border-dashed opacity-60" : "bg-muted/40"
              }`}
            >
              <span className="line-through opacity-60">{c.original}</span>
              {" → "}
              <strong>{c.suggestion}</strong>
              <p className="mt-1 text-xs text-muted-foreground">{c.explanation}</p>
              {/* El corrector la propuso y el código la tiró: sin esto, la
                  sugerencia simplemente desaparecía sin explicación. */}
              {c.descartada && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Descartada: {c.descartada}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
