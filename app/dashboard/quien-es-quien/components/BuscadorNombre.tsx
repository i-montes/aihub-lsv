"use client";

import type React from "react";
import { useState } from "react";
import { Clock, Search, UserSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DURACION_ESTIMADA_SEGUNDOS,
  MAX_NOMBRE_LENGTH,
  perfilSchema,
} from "../constants";

interface BuscadorNombreProps {
  onGenerar: (nombre: string) => void;
  disabled?: boolean;
}

/**
 * Punto de entrada de la herramienta: un solo campo.
 *
 * La validación de longitud se hace aquí porque un nombre de más de 120
 * caracteres devuelve 400 y no tiene sentido gastar el viaje.
 */
export const BuscadorNombre: React.FC<BuscadorNombreProps> = ({
  onGenerar,
  disabled = false,
}) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  const excedido = nombre.length > MAX_NOMBRE_LENGTH;

  const handleSubmit = (evento: React.FormEvent) => {
    evento.preventDefault();

    const resultado = perfilSchema.safeParse({ nombre });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }

    setError(null);
    onGenerar(resultado.data.nombre);
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
            El agente busca en la web y en los proyectos de ley del Congreso, y
            devuelve el perfil con las fuentes citadas.
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
            disabled={disabled}
            aria-invalid={!!error || excedido}
          />

          <div className="flex items-start justify-between gap-3 min-h-[20px]">
            <p className="text-sm text-red-600">{error}</p>
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
          disabled={disabled || !nombre.trim() || excedido}
          className="w-full text-white mt-2"
        >
          <Search className="w-4 h-4 mr-2" />
          Generar perfil
        </Button>

        <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-4">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          Tarda entre {Math.round(DURACION_ESTIMADA_SEGUNDOS.min / 60)} y{" "}
          {Math.ceil(DURACION_ESTIMADA_SEGUNDOS.max / 60)} minutos. No cierres la
          pestaña mientras trabaja.
        </p>
      </form>
    </div>
  );
};
