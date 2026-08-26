"use client";

import type React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PerfilError } from "../constants";
import { esReintentable } from "../utils";

interface ErrorPanelProps {
  error: PerfilError;
  nombre: string;
  onReintentar: () => void;
  onVolver: () => void;
}

/**
 * Pantalla de error.
 *
 * El reintento sólo se ofrece en el 502 —el agente arrancó pero no terminó—,
 * y siempre detrás de una confirmación: repetir gasta otra generación completa.
 * Los demás errores no se arreglan repitiendo la llamada.
 */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  error,
  nombre,
  onReintentar,
  onVolver,
}) => {
  const puedeReintentar = esReintentable(error.status);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          No se pudo generar el perfil
        </h2>

        {/* El API devuelve los mensajes en español, listos para mostrarse */}
        <p className="text-sm text-gray-600 mt-2">{error.error}</p>

        {typeof error.segundos === "number" && (
          <p className="text-xs text-gray-400 mt-2">
            El agente alcanzó a trabajar {Math.round(error.segundos)} segundos
            antes de detenerse.
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" onClick={onVolver}>
            Volver
          </Button>

          {puedeReintentar && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reintentar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Volver a perfilar a {nombre}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    El perfil se escribe otra vez desde cero: son otros dos
                    minutos de espera y otra generación completa de la cuenta
                    (unos USD 0,20). No hay forma de retomar el intento anterior.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onReintentar}>
                    Sí, reintentar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};
