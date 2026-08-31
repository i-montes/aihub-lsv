"use client";

import type React from "react";
import { useState } from "react";
import { Loader2, Search, UserSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_NOMBRE_LENGTH, perfilSchema } from "../constants";

interface BuscadorNombreProps {
  onBuscar: (nombre: string) => void;
  /** Lo que se escribió la vez anterior, para no volver a teclearlo al corregir */
  valorInicial?: string;
  /** La verificación contra el archivo está en curso */
  buscando?: boolean;
  /** Fallo del paso de verificación: se corrige aquí mismo */
  errorBusqueda?: string | null;
  disabled?: boolean;
}

/**
 * Punto de entrada de la herramienta: un solo campo.
 *
 * Lo que sale de aquí no va al generador sino a `/api/nombre`, que resuelve el
 * nombre contra el archivo. Da igual si viene sin tildes, en minúsculas o
 * incompleto: la búsqueda es semántica y la corrección se confirma después.
 *
 * La validación de longitud se hace aquí porque un nombre de más de 120
 * caracteres devuelve 400 y no tiene sentido gastar el viaje.
 */
export const BuscadorNombre: React.FC<BuscadorNombreProps> = ({
  onBuscar,
  valorInicial = "",
  buscando = false,
  errorBusqueda = null,
  disabled = false,
}) => {
  const [nombre, setNombre] = useState(valorInicial);
  const [error, setError] = useState<string | null>(null);

  const excedido = nombre.length > MAX_NOMBRE_LENGTH;
  const bloqueado = disabled || buscando;
  const mensajeError = error ?? errorBusqueda;

  const handleSubmit = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (bloqueado) return;

    const resultado = perfilSchema.safeParse({ nombre });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }

    setError(null);
    onBuscar(resultado.data.nombre);
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-8"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <UserSearch className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            ¿De quién quieres el perfil?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Primero buscamos a quién te refieres en el archivo de La Silla. Con
            la persona confirmada, el agente busca en la web y en los proyectos
            de ley del Congreso, y devuelve el perfil con las fuentes citadas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la persona</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(evento) => {
              setNombre(evento.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej.: Lina María Garrido"
            autoComplete="off"
            autoFocus
            disabled={bloqueado}
            aria-invalid={!!mensajeError || excedido}
          />

          <div className="flex items-start justify-between gap-3 min-h-[20px]">
            <p className="text-sm text-red-600">{mensajeError}</p>
            <span
              className={`text-xs flex-shrink-0 ${
                excedido ? "text-red-600 font-medium" : "text-gray-400"
              }`}
            >
              {nombre.length}/{MAX_NOMBRE_LENGTH}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={bloqueado || !nombre.trim() || excedido}
          className="w-full text-white mt-2"
        >
          {buscando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Buscando en el archivo…
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar persona
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Escríbelo como te salga: sin tildes, en minúsculas o incompleto. Te
          mostramos a quién encontramos antes de generar nada.
        </p>
      </form>
    </div>
  );
};
