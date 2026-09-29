import type { Proveedor } from "@/lib/proveedores/tipos";
import { NOMBRE_PROVEEDOR } from "@/lib/proveedores/tipos";

/**
 * La lista real de modelos de cada proveedor, consultada con la clave que se
 * está configurando. Si la lista llega, la clave funciona: es también la
 * validación de la clave. Los filtros son los que tenía la ruta de
 * verificación de Integraciones antes de borrarla.
 */

export class ErrorProveedor extends Error {
  constructor(mensaje: string, public status: number) {
    super(mensaje);
    this.name = "ErrorProveedor";
  }
}

export function filtrarModelosOpenAI(ids: string[]): string[] {
  return ids
    .filter(
      (id) =>
        id.includes("gpt-") && !id.includes("instruct") && !id.includes("0301") && !id.includes("0314")
    )
    .sort();
}

export function filtrarModelosAnthropic(ids: string[]): string[] {
  return ids.filter((id) => id.includes("claude")).sort();
}

export function filtrarModelosGoogle(nombres: string[]): string[] {
  return nombres
    .filter((nombre) => nombre.includes("gemini"))
    .map((nombre) => nombre.replace(/^models\//, ""))
    .sort();
}

/** Mensaje de error del proveedor, o uno genérico si no lo manda */
async function mensajeDeError(respuesta: Response, proveedor: Proveedor): Promise<string> {
  const generico =
    respuesta.status === 401 || respuesta.status === 403
      ? `${NOMBRE_PROVEEDOR[proveedor]} rechazó la clave`
      : `${NOMBRE_PROVEEDOR[proveedor]} respondió ${respuesta.status}`;
  try {
    const cuerpo = await respuesta.json();
    const mensaje = cuerpo?.error?.message;
    return typeof mensaje === "string" && mensaje ? mensaje : generico;
  } catch {
    return generico;
  }
}

export async function listarModelos(proveedor: Proveedor, apiKey: string): Promise<string[]> {
  let respuesta: Response;
  try {
    switch (proveedor) {
      case "OPENAI":
        respuesta = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        break;
      case "ANTHROPIC":
        respuesta = await fetch("https://api.anthropic.com/v1/models?limit=1000", {
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        });
        break;
      case "GOOGLE":
        respuesta = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(apiKey)}`
        );
        break;
    }
  } catch (error) {
    throw new ErrorProveedor(
      `No se pudo conectar con ${NOMBRE_PROVEEDOR[proveedor]}: ${error instanceof Error ? error.message : "error de red"}`,
      502
    );
  }

  if (!respuesta.ok) {
    const mensaje = await mensajeDeError(respuesta, proveedor);
    // Una clave rechazada es un error del que configura (400), no del servidor.
    throw new ErrorProveedor(mensaje, respuesta.status === 401 || respuesta.status === 403 ? 400 : 502);
  }

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    throw new ErrorProveedor(
      `${NOMBRE_PROVEEDOR[proveedor]} devolvió una respuesta que no se pudo leer`,
      502
    );
  }

  switch (proveedor) {
    case "OPENAI":
      return filtrarModelosOpenAI((datos?.data ?? []).map((m: { id: string }) => m.id));
    case "ANTHROPIC":
      return filtrarModelosAnthropic((datos?.data ?? []).map((m: { id: string }) => m.id));
    case "GOOGLE":
      return filtrarModelosGoogle((datos?.models ?? []).map((m: { name: string }) => m.name));
  }
}
