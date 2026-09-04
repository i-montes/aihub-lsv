import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"

/**
 * Token de organización: cadena base64url firmada con HMAC-SHA256 que transporta
 * el id de la organización.
 *
 * Formato (estilo JWT, sin cabecera): `<payload>.<firma>`
 *   - payload: base64url del JSON { organizationId, iat, exp, jti }
 *   - firma:   base64url del HMAC-SHA256 del payload con ORG_TOKEN_SECRET
 *
 * El payload es legible (base64 no es cifrado), pero no se puede fabricar ni
 * modificar sin el secreto del servidor. Un token que solo fuera base64 del id
 * de la organización lo podría generar cualquiera y dejaría las API keys de
 * todas las organizaciones al alcance de un `echo -n <uuid> | base64`.
 */

const DEFAULT_TTL_SECONDS = 5 * 60
const MIN_SECRET_LENGTH = 32
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface OrgTokenPayload {
  organizationId: string
  /** Emitido en (segundos epoch) */
  iat: number
  /** Expira en (segundos epoch) */
  exp: number
  /** Identificador único del token, útil para trazas */
  jti: string
}

export type OrgTokenError =
  | "MISSING_TOKEN"
  | "MALFORMED_TOKEN"
  | "INVALID_SIGNATURE"
  | "EXPIRED_TOKEN"

export type VerifyResult =
  | { valid: true; payload: OrgTokenPayload }
  | { valid: false; error: OrgTokenError }

function getSecret(): string {
  const secret = process.env.ORG_TOKEN_SECRET
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ORG_TOKEN_SECRET no está configurado o es demasiado corto (mínimo ${MIN_SECRET_LENGTH} caracteres)`,
    )
  }
  return secret
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input as any).toString("base64url")
}

function sign(payloadSegment: string): string {
  return createHmac("sha256", getSecret()).update(payloadSegment).digest("base64url")
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Crea un token firmado para una organización.
 * @param ttlSeconds vida del token en segundos (por defecto 5 minutos)
 */
export function createOrgToken(organizationId: string, ttlSeconds: number = DEFAULT_TTL_SECONDS): string {
  if (!UUID_REGEX.test(organizationId)) {
    throw new Error("organizationId debe ser un UUID válido")
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: OrgTokenPayload = {
    organizationId,
    iat: now,
    exp: now + Math.max(1, Math.floor(ttlSeconds)),
    jti: randomUUID(),
  }

  const payloadSegment = toBase64Url(JSON.stringify(payload))
  return `${payloadSegment}.${sign(payloadSegment)}`
}

/**
 * Verifica firma y vigencia de un token. Nunca lanza por un token inválido:
 * devuelve el motivo para que quien llama decida el código de respuesta.
 */
export function verifyOrgToken(token: string | null | undefined): VerifyResult {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "MISSING_TOKEN" }
  }

  const segments = token.trim().split(".")
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    return { valid: false, error: "MALFORMED_TOKEN" }
  }

  const [payloadSegment, signatureSegment] = segments

  if (!safeEquals(signatureSegment, sign(payloadSegment))) {
    return { valid: false, error: "INVALID_SIGNATURE" }
  }

  let payload: OrgTokenPayload
  try {
    payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8"))
  } catch {
    return { valid: false, error: "MALFORMED_TOKEN" }
  }

  if (!payload || typeof payload.organizationId !== "string" || !UUID_REGEX.test(payload.organizationId)) {
    return { valid: false, error: "MALFORMED_TOKEN" }
  }

  if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
    return { valid: false, error: "EXPIRED_TOKEN" }
  }

  return { valid: true, payload }
}

/**
 * Extrae el token de la cabecera `Authorization: Bearer <token>`.
 */
export function getTokenFromAuthorizationHeader(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}
