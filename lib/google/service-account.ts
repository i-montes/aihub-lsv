import { createSign } from "node:crypto";

/**
 * Autenticación con la service account de Google.
 *
 * Se firma el JWT a mano con `node:crypto` en vez de instalar `googleapis`:
 * el flujo que necesitamos es una sola llamada a Drive y el paquete oficial
 * pesa decenas de MB en el bundle de la función.
 *
 * La credencial viaja en `GOOGLE_SERVICE_ACCOUNT_JSON` como el JSON de la
 * service account codificado en base64, porque el `private_key` trae saltos de
 * línea que las variables de entorno de Vercel no conservan bien en crudo.
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id?: string;
}

/** Alcances mínimos: crear el documento en la unidad compartida. */
const SCOPE = "https://www.googleapis.com/auth/drive";

/**
 * Los tokens de Google duran una hora. Con Fluid Compute la instancia se
 * reutiliza entre requests, así que cachearlo evita una llamada a
 * oauth2.googleapis.com por cada análisis.
 */
let tokenCache: { token: string; expiraEn: number } | null = null;

function leerServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error(
      "Falta GOOGLE_SERVICE_ACCOUNT_JSON: sin ella no se puede crear el documento de revisión"
    );
  }

  // Se acepta el JSON en base64 (lo recomendado) o pegado en crudo, para no
  // obligar a recodificarlo si alguien lo configura a mano.
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");

  let cuenta: ServiceAccount;
  try {
    cuenta = JSON.parse(json);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON válido");
  }

  if (!cuenta.client_email || !cuenta.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON no tiene client_email o private_key"
    );
  }

  return cuenta;
}

const base64url = (valor: object): string =>
  Buffer.from(JSON.stringify(valor)).toString("base64url");

/**
 * Devuelve un access token válido para Drive, reusando el cacheado si le queda
 * más de un minuto de vida.
 */
export async function obtenerAccessToken(): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000);

  if (tokenCache && tokenCache.expiraEn > ahora + 60) {
    return tokenCache.token;
  }

  const cuenta = leerServiceAccount();

  const cabecera = base64url({ alg: "RS256", typ: "JWT" });
  const cuerpo = base64url({
    iss: cuenta.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: ahora,
    exp: ahora + 3600,
  });

  const sinFirmar = `${cabecera}.${cuerpo}`;
  const firma = createSign("RSA-SHA256")
    .update(sinFirmar)
    .sign(cuenta.private_key, "base64url");

  const respuesta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${sinFirmar}.${firma}`,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(
      `Google rechazó la service account (${respuesta.status}): ${detalle.slice(0, 300)}`
    );
  }

  const datos = (await respuesta.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: datos.access_token,
    expiraEn: ahora + datos.expires_in,
  };

  return datos.access_token;
}
