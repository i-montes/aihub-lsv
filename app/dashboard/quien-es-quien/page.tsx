"use client";

import { Lock } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { ORGANIZACION_HABILITADA } from "./constants";
import { usePerfil } from "./hooks/usePerfil";
import { FormHeader } from "./components/FormHeader";
import { BuscadorNombre } from "./components/BuscadorNombre";
import { BitacoraPanel } from "./components/BitacoraPanel";
import { PerfilPanel } from "./components/PerfilPanel";
import { ErrorPanel } from "./components/ErrorPanel";

/**
 * Quién es quién: genera el perfil de una persona a partir de su nombre.
 *
 * La herramienta no tiene prompt ni selector de modelo: el agente vive en el
 * API externo y el costo lo paga su token, no las API keys de la organización.
 *
 * La pantalla tiene tres estados —buscador, espera y perfil—, uno a la vez.
 * La espera ocupa toda la pantalla porque dura entre uno y tres minutos y los
 * avances del agente son lo único que hay para mirar mientras tanto.
 */
export default function QuienEsQuienPage() {
  const { organization } = useAuth();
  const {
    estado,
    nombreEnCurso,
    paso,
    bitacora,
    resultado,
    error,
    segundos,
    generar,
    cancelar,
    reiniciar,
  } = usePerfil();

  // El sidebar ya la esconde; esto cubre a quien llegue por la URL directa.
  if (organization && organization.name !== ORGANIZACION_HABILITADA) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Herramienta no disponible
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tu organización no tiene habilitado Quién es quién.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <FormHeader />

      {estado === "inicial" && <BuscadorNombre onGenerar={generar} />}

      {estado === "generando" && (
        <BitacoraPanel
          nombre={nombreEnCurso}
          paso={paso}
          segundos={segundos}
          entradas={bitacora}
          onCancelar={cancelar}
        />
      )}

      {estado === "listo" && resultado && (
        <PerfilPanel
          resultado={resultado}
          entradas={bitacora}
          onNuevoPerfil={reiniciar}
        />
      )}

      {estado === "error" && error && (
        <ErrorPanel
          error={error}
          nombre={nombreEnCurso}
          onReintentar={() => generar(nombreEnCurso)}
          onVolver={reiniciar}
        />
      )}
    </div>
  );
}
