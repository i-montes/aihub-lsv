"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultadoAgente } from "./components/ResultadoAgente";
import { PasoConsulta } from "./components/PasoConsulta";
import type { ResultadoAgentePreguntas } from "@/lib/preguntas-chatbot/tipos";

/**
 * "Preguntas al chatbot": un agente conversacional que consulta (sólo
 * lectura, SQL que el propio modelo redacta) qué le han preguntado los
 * lectores al chatbot de La Silla Vacía, y resume la respuesta en una tabla
 * y una gráfica.
 *
 * No hay selector de modelo ni de proveedor: usa siempre el Anthropic de la
 * organización (ver lib/preguntas-chatbot/agente.ts) — agregar selector es
 * trabajo futuro si hace falta.
 */
export default function PreguntasChatbotPage() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/preguntas-chatbot",
      body: () => ({ sessionId }),
    }),
  });

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  /**
   * Un sessionId nuevo, no sólo vaciar `messages`: así el agente no arrastra
   * contexto de la conversación anterior, y las filas de analytics del
   * próximo turno quedan agrupadas aparte en session_id.
   */
  const limpiarHistorial = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Preguntas al chatbot</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pregunta en lenguaje natural qué le han preguntado los lectores al chatbot —
            por tema, por fecha, o comparando varios a la vez.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={limpiarHistorial}
            disabled={status !== "ready"}
            className="flex items-center gap-1 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar historial
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm">
            Por ejemplo: "¿cuántas preguntas sobre la reforma pensional hubo esta
            semana?" o "compara preguntas sobre Petro vs. de la Espriella por día
            en el último mes".
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "text-right" : ""}>
            <div
              className={
                message.role === "user"
                  ? "inline-block max-w-[80%] rounded-lg bg-blue-600 text-white px-4 py-2 text-sm text-left"
                  : "max-w-[90%]"
              }
            >
              {message.parts.map((part: any, i: number) => {
                if (part.type === "text") {
                  return (
                    <p key={i} className="whitespace-pre-wrap text-sm">
                      {part.text}
                    </p>
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
                        <p className="text-sm">{resultado.comentario}</p>
                      )}
                      <ResultadoAgente resultado={resultado} />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}

        {(status === "submitted" || status === "streaming") && (
          <p className="text-sm text-gray-400">Pensando…</p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            Algo falló: {error.message || "intenta de nuevo en un momento"}
          </p>
        )}
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t pt-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          disabled={status !== "ready"}
          className="min-h-[44px] max-h-32 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar(e as any);
            }
          }}
        />
        <Button type="submit" disabled={status !== "ready" || !input.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
