"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarkdownView } from "@/components/shared/markdown-view";
import type { ResultadoAgentePreguntas } from "@/lib/preguntas-chatbot/tipos";

import { AlertaError } from "./components/AlertaError";
import { Mensaje } from "./components/Mensaje";
import { CajaEntrada } from "./components/CajaEntrada";
import { IndicadorEscribiendo } from "./components/IndicadorEscribiendo";
import { PasoConsulta } from "./components/PasoConsulta";
import { ResultadoAgente } from "./components/ResultadoAgente";

const EJEMPLOS = [
  "¿Cuántas preguntas sobre la reforma pensional hubo esta semana?",
  "Compara preguntas sobre Petro vs. De la Espriella por día en el último mes",
  "¿Cuáles fueron los diez temas más preguntados ayer?",
];

/**
 * "Preguntas al chatbot": un agente conversacional que consulta (sólo
 * lectura, SQL que el propio modelo redacta) qué le han preguntado los
 * lectores al chatbot de La Silla Vacía, y resume la respuesta en una tabla
 * y una gráfica.
 *
 * El proveedor y el modelo los fija el servidor (ver
 * lib/preguntas-chatbot/agente.ts): la cabecera ya no trae selector.
 */
export default function PreguntasChatbotPage() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const [errorOculto, setErrorOculto] = useState(false);

  // Hora de cada mensaje: useChat no la trae, se anota al verlos por primera vez.
  const horas = useRef(new Map<string, Date>());
  const finDelHilo = useRef<HTMLDivElement>(null);

  // Ref para que el transporte lea siempre la sesión vigente sin tener que
  // recrearse (recrearlo reiniciaría useChat).
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/preguntas-chatbot",
        // Sin proveedor ni modelo: los pone el servidor. La herramienta corre
        // con uno solo mientras el turno no sea estable en los tres.
        body: () => ({ sessionId: sessionIdRef.current }),
      })
  );

  const { messages, sendMessage, setMessages, status, error, stop, regenerate, clearError } =
    useChat({ transport });

  const ocupado = status === "submitted" || status === "streaming";

  useEffect(() => {
    for (const m of messages) {
      if (!horas.current.has(m.id)) horas.current.set(m.id, new Date());
    }
  }, [messages]);

  // Auto-scroll al final cuando llegan mensajes o tokens nuevos.
  useEffect(() => {
    finDelHilo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status, error]);

  useEffect(() => {
    if (error) setErrorOculto(false);
  }, [error]);

  const enviar = useCallback(() => {
    const texto = input.trim();
    if (!texto || ocupado) return;
    sendMessage({ text: texto });
    setInput("");
  }, [input, ocupado, sendMessage]);

  /**
   * Un sessionId nuevo, no sólo vaciar `messages`: así el agente no arrastra
   * contexto de la conversación anterior, y las filas de analytics del
   * próximo turno quedan agrupadas aparte en session_id.
   */
  const limpiarHistorial = () => {
    setMessages([]);
    horas.current.clear();
    clearError();
    setSessionId(crypto.randomUUID());
  };

  const ultimoEsDelAgente = messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="flex h-full flex-col">
      {/* Cabecera */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Preguntas al chatbot</h1>
          <p className="text-gray-500">
            Pregunta en lenguaje natural qué le han preguntado los lectores al chatbot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={limpiarHistorial}
              disabled={ocupado}
              className="h-10 gap-2 rounded-full px-4 text-base text-gray-600"
            >
              <Trash2 className="h-4 w-4" />
              Nueva conversación
            </Button>
          )}
        </div>
      </div>

      {/* Hilo */}
      <div className="flex-1 overflow-y-auto px-1 pb-3">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && (
            <PantallaVacia
              onElegir={(texto) => setInput(texto)}
            />
          )}

          {messages.map((message) => {
            const esUsuario = message.role === "user";
            // Las preguntas individuales salen de aquí y no de la respuesta del
            // agente: ya venían en las filas, no hace falta que las reescriba.
            const filasConsultadas = message.parts.flatMap((part: any) =>
              part.type === "tool-consultarPreguntasChatbot" &&
              Array.isArray(part.output?.filas)
                ? (part.output.filas as Record<string, unknown>[])
                : []
            );
            return (
              <Mensaje
                key={message.id}
                autor={esUsuario ? "usuario" : "agente"}
                hora={horas.current.get(message.id)}
              >
                {message.parts.map((part: any, i: number) => {
                  if (part.type === "text") {
                    if (!part.text) return null;
                    // El usuario escribe texto plano; el markdown compacto es
                    // para las respuestas del agente sobre fondo claro.
                    return esUsuario ? (
                      <p key={i} className="whitespace-pre-wrap leading-relaxed">
                        {part.text}
                      </p>
                    ) : (
                      <MarkdownView key={i} content={part.text} compacto />
                    );
                  }

                  if (part.type === "tool-consultarPreguntasChatbot") {
                    return (
                      <PasoConsulta
                        key={i}
                        input={part.input}
                        state={part.state}
                        output={part.output}
                      />
                    );
                  }

                  if (part.type === "tool-reportarResultado" && part.input) {
                    const resultado = part.input as ResultadoAgentePreguntas;
                    return (
                      <div key={i}>
                        {resultado.comentario && (
                          <MarkdownView content={resultado.comentario} compacto />
                        )}
                        <ResultadoAgente
                          resultado={resultado}
                          filasConsultadas={filasConsultadas}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </Mensaje>
            );
          })}

          {/* Mientras el agente no ha empezado a escribir, se muestra el indicador */}
          {ocupado && !ultimoEsDelAgente && (
            <IndicadorEscribiendo texto={status === "submitted" ? "Pensando…" : undefined} />
          )}

          {error && !errorOculto && (
            <AlertaError
              error={error}
              reintentando={ocupado}
              onReintentar={() => {
                setErrorOculto(true);
                regenerate();
              }}
              onCerrar={() => setErrorOculto(true)}
            />
          )}

          <div ref={finDelHilo} />
        </div>
      </div>

      {/* Entrada */}
      <div className="mx-auto w-full max-w-3xl">
        <CajaEntrada
          valor={input}
          onChange={setInput}
          onEnviar={enviar}
          onDetener={stop}
          ocupado={ocupado}
          placeholder="Escribe tu pregunta…"
        />
      </div>
    </div>
  );
}

function PantallaVacia({
  onElegir,
  deshabilitado,
}: {
  onElegir: (texto: string) => void;
  deshabilitado?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <MessageSquare className="h-6 w-6" />
      </div>
      <p className="text-lg font-semibold text-gray-800">¿Qué quieres saber?</p>
      <p className="mt-1 max-w-md text-base text-gray-500">
        Puedes preguntar por tema, por fecha o comparar varios a la vez. Algunos ejemplos:
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EJEMPLOS.map((ejemplo) => (
          <button
            key={ejemplo}
            type="button"
            disabled={deshabilitado}
            onClick={() => onElegir(ejemplo)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-left text-base text-gray-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ejemplo}
          </button>
        ))}
      </div>
    </div>
  );
}
