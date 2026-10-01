import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import {
  enmascararClave,
  NOMBRE_HERRAMIENTA,
  NOMBRE_PROVEEDOR,
  normalizarProveedor,
  PROVEEDORES,
  esHerramientaConProveedores,
  type Proveedor,
  type ProveedorActivo,
  type ProveedorConfigurado,
  type ProveedorParaGuardar,
} from "@/lib/proveedores/tipos";

/**
 * Lectura y escritura de `herramienta_proveedores`. Todo con rol de servicio:
 * quien llama ya comprobó la sesión (ver sesion.ts). Ninguna función de aquí
 * devuelve la clave completa salvo `obtenerProveedorDeHerramienta`, que es la
 * que usan las herramientas al correr y nunca llega al navegador.
 */

export class ProveedorNoConfiguradoError extends Error {
  constructor(
    public herramienta: string,
    public proveedor: string
  ) {
    const nombreHerramienta = esHerramientaConProveedores(herramienta)
      ? NOMBRE_HERRAMIENTA[herramienta]
      : herramienta;
    const nombreProveedor = normalizarProveedor(proveedor)
      ? NOMBRE_PROVEEDOR[normalizarProveedor(proveedor)!]
      : proveedor;
    super(`${nombreHerramienta} no tiene configurado ${nombreProveedor}. Configúralo en Ajustes > Herramientas.`);
    this.name = "ProveedorNoConfiguradoError";
  }
}

export interface ProveedorEnUso {
  proveedor: Proveedor;
  modelo: string;
  apiKey: string;
  /** `null`: por defecto del modelo, no se envía */
  reasoningEffort: string | null;
  verbosity: string | null;
}

type Fila = {
  herramienta: string;
  proveedor: string;
  api_key: string;
  modelo: string;
  reasoning_effort: string | null;
  verbosity: string | null;
  posicion: number;
};

async function filasDe(organizationId: string, herramienta?: string): Promise<Fila[]> {
  const supabase = getSupabaseAdmin();
  let consulta = supabase
    .from("herramienta_proveedores")
    .select("herramienta, proveedor, api_key, modelo, reasoning_effort, verbosity, posicion")
    .eq("organization_id", organizationId)
    .order("posicion", { ascending: true });
  if (herramienta) consulta = consulta.eq("herramienta", herramienta);
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo leer la configuración de proveedores: ${error.message}`);
  return (data ?? []) as Fila[];
}

function activoDe(fila: Fila): ProveedorActivo {
  return { proveedor: fila.proveedor as Proveedor, modelo: fila.modelo };
}

/** Clave y ajustes de un proveedor para correr la herramienta */
export async function obtenerProveedorDeHerramienta(
  organizationId: string,
  herramienta: string,
  proveedor: string
): Promise<ProveedorEnUso> {
  const normalizado = normalizarProveedor(proveedor);
  if (!normalizado) throw new ProveedorNoConfiguradoError(herramienta, proveedor);

  const fila = (await filasDe(organizationId, herramienta)).find((f) => f.proveedor === normalizado);
  if (!fila || !fila.api_key.trim()) throw new ProveedorNoConfiguradoError(herramienta, normalizado);

  return {
    proveedor: normalizado,
    modelo: fila.modelo,
    apiKey: fila.api_key.trim(),
    reasoningEffort: fila.reasoning_effort,
    verbosity: fila.verbosity,
  };
}

/** Proveedor y modelo en orden, sin claves. Vacío si no hay ninguno. */
export async function listarProveedoresActivos(
  organizationId: string,
  herramienta: string
): Promise<ProveedorActivo[]> {
  return (await filasDe(organizationId, herramienta)).map(activoDe);
}

/** Lo mismo para todas las herramientas de la organización, para las tarjetas */
export async function listarProveedoresActivosDeTodas(
  organizationId: string
): Promise<Record<string, ProveedorActivo[]>> {
  const resultado: Record<string, ProveedorActivo[]> = {};
  for (const fila of await filasDe(organizationId)) {
    (resultado[fila.herramienta] ??= []).push(activoDe(fila));
  }
  return resultado;
}

/** Lo que ve el diálogo: configuración enmascarada y modelos en uso por las demás */
export async function listarConfiguracionHerramienta(
  organizationId: string,
  herramienta: string
): Promise<{ proveedores: ProveedorConfigurado[]; sugerencias: Record<Proveedor, string[]> }> {
  const todas = await filasDe(organizationId);

  const proveedores = todas
    .filter((f) => f.herramienta === herramienta)
    .map((f) => ({
      proveedor: f.proveedor as Proveedor,
      modelo: f.modelo,
      reasoningEffort: f.reasoning_effort,
      verbosity: f.verbosity,
      claveEnmascarada: enmascararClave(f.api_key),
    }));

  const sugerencias = Object.fromEntries(PROVEEDORES.map((p) => [p, [] as string[]])) as Record<Proveedor, string[]>;
  for (const f of todas) {
    if (f.herramienta === herramienta) continue;
    const lista = sugerencias[f.proveedor as Proveedor];
    if (lista && !lista.includes(f.modelo)) lista.push(f.modelo);
  }

  return { proveedores, sugerencias };
}

/** Una fila para el RPC `guardar_herramienta_proveedores` */
export interface FilaParaGuardar {
  proveedor: Proveedor;
  /** `null`: conservar la clave de la fila existente */
  api_key: string | null;
  modelo: string;
  reasoning_effort: string | null;
  verbosity: string | null;
  posicion: number;
}

/** Las filas del RPC en el orden recibido: la posición es el índice (0 corre por defecto). */
export function conPosiciones(proveedores: ProveedorParaGuardar[]): FilaParaGuardar[] {
  return proveedores.map((p, posicion) => ({
    proveedor: p.proveedor,
    api_key: p.apiKey ?? null,
    modelo: p.modelo,
    reasoning_effort: p.reasoningEffort,
    verbosity: p.verbosity,
    posicion,
  }));
}

/**
 * Guarda la lista completa: los que vienen se insertan o actualizan en ese
 * orden, los que no vienen se borran. Antes comprueba que ninguna clave nueva
 * esté en otra herramienta; el índice único respalda la comprobación si dos
 * guardados compiten.
 *
 * Una lista vacía apaga la herramienta: no hay claves que comprobar y el RPC
 * recibe `[]`. En la función SQL, `jsonb_array_elements('[]')` no devuelve
 * filas, así que `proveedor not in (subconsulta vacía)` es verdadero para
 * todas y se borran todas las filas de la herramienta.
 */
export async function guardarConfiguracionHerramienta(
  organizationId: string,
  herramienta: string,
  proveedores: ProveedorParaGuardar[]
): Promise<{ ok: true } | { ok: false; error: string; proveedor?: Proveedor }> {
  const supabase = getSupabaseAdmin();

  const clavesNuevas = proveedores.filter((p) => p.apiKey).map((p) => p.apiKey!);
  // Con lista vacía no hay claves nuevas: se salta la comprobación de repetidas.
  if (clavesNuevas.length > 0) {
    const { data: repetidas, error } = await supabase
      .from("herramienta_proveedores")
      .select("herramienta, api_key")
      .eq("organization_id", organizationId)
      .neq("herramienta", herramienta)
      .in("api_key", clavesNuevas);
    if (error) return { ok: false, error: `No se pudo comprobar las claves: ${error.message}` };

    const repetida = repetidas?.[0];
    if (repetida) {
      const duena = proveedores.find((p) => p.apiKey === repetida.api_key)!;
      const nombre = esHerramientaConProveedores(repetida.herramienta)
        ? NOMBRE_HERRAMIENTA[repetida.herramienta]
        : repetida.herramienta;
      return {
        ok: false,
        error: `Esa clave de ${NOMBRE_PROVEEDOR[duena.proveedor]} ya está en ${nombre}. Cada herramienta lleva una clave distinta.`,
        proveedor: duena.proveedor,
      };
    }
  }

  const { error } = await supabase.rpc("guardar_herramienta_proveedores", {
    p_organization_id: organizationId,
    p_herramienta: herramienta,
    p_proveedores: conPosiciones(proveedores) as unknown as Json,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Una de las claves ya está en otra herramienta. Cada herramienta lleva una clave distinta." };
    }
    return { ok: false, error: `No se pudo guardar: ${error.message}` };
  }
  return { ok: true };
}
