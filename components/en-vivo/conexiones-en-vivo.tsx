"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type EstadoConexiones = {
  canva: { configurada: true; plantillaId: string } | { configurada: false };
  facebook: { conectada: boolean; pagina?: string; conectadoEn?: string | null };
  instagram: { conectada: boolean; usuario?: string };
  facebookLoginDisponible: boolean;
  esAdmin: boolean;
  /** El titular se está dibujando con Anton porque falta el archivo de MARTIN. */
  fuenteRespaldo: boolean;
};

export function useEstadoConexiones() {
  const [estado, setEstado] = useState<EstadoConexiones | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recargar = useCallback(async () => {
    try {
      const r = await fetch("/api/en-vivo/estado", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "No se pudo leer el estado de las conexiones.");
      setEstado(j);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el estado de las conexiones.");
    }
  }, []);
  useEffect(() => {
    void recargar();
  }, [recargar]);
  return { estado, error, recargar };
}

/**
 * Conexiones de En Vivo en Ajustes > Herramientas: la service app de Canva y la página de
 * Facebook. Los secretos nunca vuelven al navegador; sólo el estado.
 */
export function ConexionesEnVivo() {
  const { estado, error, recargar } = useEstadoConexiones();
  const [canva, setCanva] = useState({ clientId: "", clientSecret: "", plantillaId: "", campoTitular: "titular", campoFoto: "foto" });
  const [mensajeCanva, setMensajeCanva] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const guardarCanva = async () => {
    setOcupado(true);
    setMensajeCanva(null);
    try {
      const r = await fetch("/api/en-vivo/canva", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(canva) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setMensajeCanva("Guardado.");
      setCanva((c) => ({ ...c, clientSecret: "" }));
      await recargar();
    } catch (e) {
      setMensajeCanva(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  };

  const probarCanva = async () => {
    setOcupado(true);
    setMensajeCanva(null);
    try {
      const r = await fetch("/api/en-vivo/canva", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const campos = Object.keys(j.campos ?? {}).join(", ") || "ninguno";
      setMensajeCanva(j.faltan?.length ? `La plantilla no tiene los campos ${j.faltan.join(", ")}. Tiene: ${campos}.` : `Funciona. Campos de la plantilla: ${campos}.`);
    } catch (e) {
      setMensajeCanva(e instanceof Error ? e.message : "No se pudo probar.");
    } finally {
      setOcupado(false);
    }
  };

  if (error) return <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>;
  if (!estado) return <p className="mt-4 text-sm text-gray-500">Cargando conexiones…</p>;

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-md font-medium text-gray-700">Conexiones</h3>

      <section className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Canva</span>
          <span className={`text-xs ${estado.canva.configurada ? "text-green-700" : "text-amber-700"}`}>
            {estado.canva.configurada ? `Configurada (plantilla ${estado.canva.plantillaId})` : "Opcional: sin Canva, la pieza se arma con la plantilla de la casa"}
          </span>
        </div>
        {estado.esAdmin ? (
          <>
            <p className="text-xs text-gray-500">
              Service app de la API REST de Canva (Developer Portal &gt; Your apps &gt; &quot;No Canva sign-in required&quot;). La plantilla es la de marca En Vivo con los campos de datos del titular y la foto.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Client ID" value={canva.clientId} onChange={(e) => setCanva({ ...canva, clientId: e.target.value })} />
              <Input placeholder={estado.canva.configurada ? "Client secret (vacío = conservar)" : "Client secret"} type="password" value={canva.clientSecret} onChange={(e) => setCanva({ ...canva, clientSecret: e.target.value })} />
              <Input placeholder="ID de la plantilla de marca" value={canva.plantillaId} onChange={(e) => setCanva({ ...canva, plantillaId: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Campo titular" value={canva.campoTitular} onChange={(e) => setCanva({ ...canva, campoTitular: e.target.value })} />
                <Input placeholder="Campo foto" value={canva.campoFoto} onChange={(e) => setCanva({ ...canva, campoFoto: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={guardarCanva} disabled={ocupado}>Guardar Canva</Button>
              <Button size="sm" variant="ghost" onClick={probarCanva} disabled={ocupado || !estado.canva.configurada}>Probar</Button>
            </div>
            {mensajeCanva && <p className="text-xs text-gray-600">{mensajeCanva}</p>}
          </>
        ) : (
          <p className="text-xs text-gray-500">Sólo un administrador puede configurar Canva.</p>
        )}
      </section>

      <section className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Facebook e Instagram</span>
          <span className={`text-xs ${estado.facebook.conectada ? "text-green-700" : "text-amber-700"}`}>
            {estado.facebook.conectada ? `Página: ${estado.facebook.pagina}` : estado.facebook.pagina ? `Desconectada (${estado.facebook.pagina})` : "Sin conectar"}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Instagram: {estado.instagram?.conectada ? estado.instagram.usuario : "sin conectar"}. Sale del mismo login: la cuenta profesional
          vinculada a la página. Si la conectaste antes de que existiera Instagram aquí, reconecta para aceptar sus permisos.
        </p>
        {/* Cualquier miembro con acceso a Post redes puede conectar, no sólo los administradores. */}
        {estado.facebookLoginDisponible ? (
          <a href="/api/en-vivo/facebook/login">
            <Button size="sm" variant="outline">{estado.facebook.conectada ? "Reconectar con Facebook" : "Conectar con Facebook"}</Button>
          </a>
        ) : (
          <p className="text-xs text-amber-700">Faltan META_APP_ID y META_APP_SECRET en el servidor para conectar con Facebook.</p>
        )}
      </section>
    </div>
  );
}
