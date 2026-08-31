"use client";

import type React from "react";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  SearchX,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DURACION_ESTIMADA_SEGUNDOS,
  type NombreResultado,
  type OpcionNombre,
  type ParaGenerar,
} from "../constants";

interface ConfirmacionNombreProps {
  resultado: NombreResultado;
  onConfirmar: (entrada: ParaGenerar) => void;
  onCorregir: () => void;
}

/** Etiqueta de la confianza. `alta` no se muestra: es el caso normal. */
const ETIQUETA_CONFIANZA: Record<OpcionNombre["confianza"], string | null> = {
  alta: null,
  media: "Coincidencia probable",
  baja: "Coincidencia dudosa",
};

/**
 * Aviso de que esa persona ya tiene perfil en el sitio. Va antes del botón a
 * propósito: reescribir uno que ya existe cuesta lo mismo que escribirlo.
 */
const PerfilExistente: React.FC<{ opcion: OpcionNombre }> = ({ opcion }) => {
  if (!opcion.perfil_publicado) return null;

  return (
    <a
      href={opcion.perfil_publicado.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:underline mt-2"
    >
      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      Ya tiene perfil publicado: {opcion.perfil_publicado.titulo}
    </a>
  );
};

/** Nombre, cargo y perfil publicado de una de las personas propuestas */
const DatosOpcion: React.FC<{ opcion: OpcionNombre }> = ({ opcion }) => {
  const confianza = ETIQUETA_CONFIANZA[opcion.confianza];

  return (
    <div className="text-left">
      <p className="text-sm font-semibold text-gray-900">{opcion.nombre}</p>
      <p className="text-sm text-gray-600 mt-0.5">{opcion.descripcion}</p>
      {confianza && (
        <p className="text-xs text-amber-600 mt-1">{confianza}</p>
      )}
      <PerfilExistente opcion={opcion} />
    </div>
  );
};

/**
 * Segundo paso de la herramienta: qué encontró el archivo con lo que se
 * escribió, y a quién se va a perfilar.
 *
 * El API nunca decide, sólo propone —aun cuando hay una sola opción—, y esta
 * pantalla existe justamente para que la decisión sea humana. El nombre que se
 * manda al generador es el del archivo (`para_generar`), no el que se tecleó:
 * pisarlo con la consulta original desharía toda la verificación.
 */
export const ConfirmacionNombre: React.FC<ConfirmacionNombreProps> = ({
  resultado,
  onConfirmar,
  onCorregir,
}) => {
  const { estado, mensaje, opciones, consulta } = resultado;
  const unica = opciones[0];

  const encabezado =
    estado === "sin_resultados"
      ? { Icono: SearchX, fondo: "bg-gray-100", color: "text-gray-400" }
      : estado === "elegir"
        ? { Icono: Users, fondo: "bg-primary-50", color: "text-primary-600" }
        : { Icono: UserCheck, fondo: "bg-primary-50", color: "text-primary-600" };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className={`w-14 h-14 rounded-full ${encabezado.fondo} flex items-center justify-center mb-4`}
          >
            <encabezado.Icono className={`w-7 h-7 ${encabezado.color}`} />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            {estado === "sin_resultados"
              ? "No encontramos a esa persona"
              : estado === "elegir"
                ? "¿A cuál de todas?"
                : "¿Es esta persona?"}
          </h2>

          {/* El API manda el mensaje en español, listo para mostrarse */}
          <p className="text-sm text-gray-500 mt-1">{mensaje}</p>

          <p className="text-xs text-gray-400 mt-2">
            Buscaste «{consulta}»
          </p>
        </div>

        {estado === "confirmar" && unica && (
          <div className="rounded-2xl border border-gray-200 p-4">
            <DatosOpcion opcion={unica} />
          </div>
        )}

        {estado === "elegir" && (
          <ul className="space-y-2">
            {opciones.map((opcion, indice) => (
              <li key={`${opcion.nombre}-${indice}`}>
                <div className="rounded-2xl border border-gray-200 p-4 flex items-start justify-between gap-4 transition-colors hover:border-primary-300">
                  <DatosOpcion opcion={opcion} />
                  <Button
                    className="text-white flex-shrink-0"
                    onClick={() => onConfirmar(opcion.para_generar)}
                  >
                    Perfilar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onCorregir}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {estado === "sin_resultados" ? "Corregir el nombre" : "No, corregir"}
          </Button>

          {estado === "confirmar" && unica && (
            <Button
              className="text-white"
              onClick={() => onConfirmar(unica.para_generar)}
            >
              Sí, generar perfil
            </Button>
          )}
        </div>

        {estado !== "sin_resultados" && (
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-4">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            Generar el perfil tarda entre{" "}
            {Math.round(DURACION_ESTIMADA_SEGUNDOS.min / 60)} y{" "}
            {Math.ceil(DURACION_ESTIMADA_SEGUNDOS.max / 60)} minutos. No cierres
            la pestaña mientras trabaja.
          </p>
        )}
      </div>
    </div>
  );
};
