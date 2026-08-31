"use client";

import { useCallback } from "react";
import { Lock } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { ORGANIZACION_HABILITADA, type ParaGenerar } from "./constants";
import { usePerfil } from "./hooks/usePerfil";
import { useVerificacionNombre } from "./hooks/useVerificacionNombre";
import { BuscadorNombre } from "./components/BuscadorNombre";
import { ConfirmacionNombre } from "./components/ConfirmacionNombre";
import { BitacoraPanel } from "./components/BitacoraPanel";
import { PerfilPanel } from "./components/PerfilPanel";
import { ErrorPanel } from "./components/ErrorPanel";

/**
 * Quién es quién: genera el perfil de una persona a partir de su nombre.
 *
 * La herramienta no tiene prompt ni selector de modelo: el agente vive en el
 * API externo y el costo lo paga su token, no las API keys de la organización.
 *
 * Son cuatro estados, uno a la vez: buscador, confirmación, espera y perfil.
 * La confirmación se paga con 3–10 segundos y ~$0,003, y evita el error que
 * más caro sale aquí —un perfil impecable de la persona equivocada— porque el
 * generador no vuelve a preguntar: recibe un nombre y lo cree.
 *
 * La espera ocupa toda la pantalla porque dura entre uno y tres minutos y los
 * avances del agente son lo único que hay para mirar mientras tanto.
 */
export default function QuienEsQuienPage() {
  const { organization } = useAuth();
  const verificacion = useVerificacionNombre();
  const {
    estado,
    entradaEnCurso,
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

  /** Vuelve al buscador con el nombre tecleado, listo para editarlo */
  const corregir = useCallback(() => {
    verificacion.reiniciar();
    reiniciar();
  }, [reiniciar, verificacion]);

  const reintentar = useCallback(() => {
    if (entradaEnCurso) generar(entradaEnCurso);
  }, [entradaEnCurso, generar]);

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

  const enConfirmacion =
    estado === "inicial" &&
    verificacion.estado === "resuelto" &&
    verificacion.resultado !== null;

  return (
    <div className="h-full flex flex-col">
      {estado === "inicial" && !enConfirmacion && (
        <BuscadorNombre
          onBuscar={verificacion.verificar}
          valorInicial={verificacion.consulta}
          buscando={verificacion.verificando}
          errorBusqueda={verificacion.error}
        />
      )}

      {enConfirmacion && verificacion.resultado && (
        <ConfirmacionNombre
          resultado={verificacion.resultado}
          onConfirmar={(entrada: ParaGenerar) => generar(entrada)}
          onCorregir={corregir}
        />
      )}

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
        <PerfilPanel resultado={resultado} entradas={bitacora} />
      )}

      {estado === "error" && error && (
        <ErrorPanel
          error={error}
          nombre={nombreEnCurso}
          onReintentar={reintentar}
          onVolver={corregir}
        />
      )}
    </div>
  );
}
