# API interna de API keys de LLM

Endpoint máquina a máquina que entrega las **API keys de LLM de una organización**
(OpenAI, Google, Perplexity, Anthropic) a partir de un token base64 firmado que
transporta el id de esa organización.

- Emisión del token: `POST /api/internal/llm-keys/token`
- Consumo: `POST /api/internal/llm-keys`
- Firma y verificación: [`lib/services/org-token.ts`](lib/services/org-token.ts)

---

## Índice

- [El token](#el-token)
- [Configuración](#configuración)
- [POST /api/internal/llm-keys/token](#post-apiinternalllm-keystoken)
- [POST /api/internal/llm-keys](#post-apiinternalllm-keys)
- [Ejemplos completos](#ejemplos-completos)
- [Errores](#errores)
- [Notas de seguridad](#notas-de-seguridad)

---

## El token

El token es una cadena base64url **firmada con HMAC-SHA256**, con el mismo formato
que un JWT pero sin cabecera:

```
<payload>.<firma>
```

- **payload** — base64url del JSON con los datos del token.
- **firma** — base64url del HMAC-SHA256 del payload usando `ORG_TOKEN_SECRET`.

Ejemplo:

```
eyJvcmdhbml6YXRpb25JZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTc4ODUyMTU0NCwiZXhwIjoxNzg4NTIxNjA0LCJqdGkiOiI4NzBjMjNjOC1iZjdlLTQ5ZjYtYjE4ZS1hNzJiMjk5MDU1MzkifQ.taX4TPDIprAxNDNXAYs3UKOUNYexyASOVBvInbV2bH8
```

Al decodificar el primer segmento se ve el contenido:

```bash
echo '<payload>' | base64 -d
```

```json
{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "iat": 1788521544,
  "exp": 1788521604,
  "jti": "870c23c8-bf7e-49f6-b18e-a72b29905539"
}
```

| Campo | Descripción |
|---|---|
| `organizationId` | UUID de la organización cuyas claves se van a entregar |
| `iat` | Momento de emisión (segundos epoch) |
| `exp` | Momento de expiración (segundos epoch) |
| `jti` | Identificador único del token; aparece en los logs del servidor |

> **El payload es legible, pero no falsificable.** base64 es codificación, no
> cifrado: cualquiera puede leer el id de la organización. Lo que impide el abuso
> es la firma — sin `ORG_TOKEN_SECRET` no se puede generar ni modificar un token
> válido. Por eso el endpoint **no** acepta un base64 pelado del UUID.

### Vigencia

- Por defecto: **5 minutos**.
- Máximo permitido al emitir: **1 año**.
- Mínimo: 60 segundos.

Los tokens son de un solo uso lógico pero no se invalidan al usarse: sirven hasta
que expiran. Pide uno nuevo por cada operación en lugar de guardarlo.

---

## Configuración

Variable de entorno obligatoria:

```env
# Secreto para firmar los tokens de organización (mínimo 32 caracteres)
ORG_TOKEN_SECRET=<64 caracteres hexadecimales>
```

Generar un secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Publicarlo en Vercel:

```bash
vercel env add ORG_TOKEN_SECRET production
vercel env add ORG_TOKEN_SECRET preview
```

Si la variable falta o tiene menos de 32 caracteres, ambos endpoints responden
`500`. Al rotar el secreto **todos los tokens vigentes dejan de funcionar** de
inmediato — es el mecanismo de revocación de emergencia.

Los endpoints también usan `NEXT_PUBLIC_SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY`, que ya están configuradas en el proyecto.

---

## POST /api/internal/llm-keys/token

Emite un token firmado para la organización del usuario autenticado.

**Autenticación:** sesión de Supabase (cookie) con rol `OWNER` o `ADMIN`.

El `organizationId` **no se acepta del cliente**: se lee del perfil autenticado,
para que nadie pueda pedir un token de una organización ajena.

### Cuerpo (opcional)

```json
{ "ttlSeconds": 300 }
```

| Campo | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `ttlSeconds` | number | `300` | Vigencia del token. Se limita al rango 60–31536000 (1 minuto a 1 año) |

### Respuesta `200`

```json
{
  "token": "eyJvcmc...ZDAwMCJ9.taX4TP...",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "expiresAt": "2026-09-04T15:30:00.000Z"
}
```

### Ejemplo

```bash
curl -X POST https://www.elkit.ai/api/internal/llm-keys/token \
  -H "Content-Type: application/json" \
  -b "sb-<proyecto>-auth-token=<cookie de sesión>" \
  -d '{"ttlSeconds": 600}'
```

---

## POST /api/internal/llm-keys

Devuelve las API keys **completas** de la organización codificada en el token.

**Autenticación:** el token firmado. No requiere sesión ni cookies.

Es `POST` y no `GET` a propósito: así el token no queda en la URL, ni por tanto en
logs de acceso, historial del navegador o cabeceras `Referer`.

### Cómo enviar el token

Preferido, en la cabecera:

```
Authorization: Bearer <token>
```

Alternativa, en el cuerpo:

```json
{ "token": "<token>" }
```

Si vienen los dos, gana la cabecera.

### Cuerpo (opcional)

```json
{
  "provider": "OPENAI",
  "includeInactive": false
}
```

| Campo | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `token` | string | — | Token, si no se manda en la cabecera `Authorization` |
| `provider` | string | — | Filtra por proveedor: `OPENAI`, `GOOGLE`, `PERPLEXITY`, `ANTHROPIC` (se normaliza a mayúsculas) |
| `includeInactive` | boolean | `false` | Con `true` también devuelve las claves en estado `INACTIVE` |

### Respuesta `200`

```json
{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "organizationName": "La Silla Vacía",
  "apiKeys": [
    {
      "id": "9f1c...",
      "provider": "OPENAI",
      "key": "sk-proj-...",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "id_channel": null,
      "status": "ACTIVE",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-20T09:12:00.000Z"
    }
  ]
}
```

Las claves van **en claro**, sin enmascarar — ese es el propósito del endpoint, a
diferencia de `GET /api/integrations`, que las trunca para la interfaz. La
respuesta lleva `Cache-Control: no-store` para que ningún proxy ni navegador las
guarde.

Si la organización no tiene claves, `apiKeys` es un arreglo vacío y el estado
sigue siendo `200`.

---

## Ejemplos completos

### cURL

```bash
# 1) Emitir el token (requiere sesión de OWNER/ADMIN)
TOKEN=$(curl -sX POST https://www.elkit.ai/api/internal/llm-keys/token \
  -H "Content-Type: application/json" \
  -b "sb-<proyecto>-auth-token=<cookie de sesión>" \
  -d '{"ttlSeconds": 300}' | jq -r .token)

# 2) Canjearlo por las claves
curl -sX POST https://www.elkit.ai/api/internal/llm-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider": "OPENAI"}' | jq
```

### Consumo desde otro servicio (TypeScript)

```ts
async function getLlmKeys(token: string, provider?: string) {
  const res = await fetch("https://www.elkit.ai/api/internal/llm-keys", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider }),
    cache: "no-store",
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`No se pudieron obtener las claves: ${error}`)
  }

  return res.json()
}
```

### Emitir un token desde el propio servidor

Dentro del proyecto, para un job o un cron que ya sabe de qué organización se
trata, no hace falta pasar por el endpoint de emisión:

```ts
import { createOrgToken } from "@/lib/services/org-token"

const token = createOrgToken(organizationId, 120) // 2 minutos
```

### Verificar un token en otro endpoint

```ts
import { verifyOrgToken, getTokenFromAuthorizationHeader } from "@/lib/services/org-token"

const token = getTokenFromAuthorizationHeader(request.headers.get("authorization"))
const result = verifyOrgToken(token)

if (!result.valid) {
  // result.error: MISSING_TOKEN | MALFORMED_TOKEN | INVALID_SIGNATURE | EXPIRED_TOKEN
  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}

const { organizationId } = result.payload
```

---

## Errores

### `POST /api/internal/llm-keys`

| Código | Cuerpo | Causa |
|---|---|---|
| `400` | `{ "error": "Proveedor no válido..." }` | `provider` fuera de la lista permitida |
| `401` | `{ "error": "Token inválido o expirado" }` | Token ausente, mal formado, firma inválida o vencido |
| `404` | `{ "error": "Organización no encontrada" }` | El token es válido pero la organización ya no existe |
| `500` | `{ "error": "Error interno del servidor" }` | Fallo de base de datos o `ORG_TOKEN_SECRET` mal configurado |

El `401` es **deliberadamente genérico**: el motivo exacto (`MALFORMED_TOKEN`,
`INVALID_SIGNATURE`, `EXPIRED_TOKEN`…) solo se escribe en los logs del servidor,
para no darle pistas a quien esté probando tokens.

```
[internal/llm-keys] Token rechazado: INVALID_SIGNATURE
```

Una entrega correcta queda registrada sin material sensible:

```
[internal/llm-keys] 3 clave(s) entregadas a la organización 123e4567-... (jti 870c23c8-...)
```

### `POST /api/internal/llm-keys/token`

| Código | Cuerpo | Causa |
|---|---|---|
| `401` | `{ "error": "No autorizado" }` | Sin sesión válida |
| `400` | `{ "error": "Usuario sin organización" }` | El perfil no tiene `organizationId` |
| `403` | `{ "error": "Permisos insuficientes" }` | El rol no es `OWNER` ni `ADMIN` |
| `500` | `{ "error": "Error interno del servidor" }` | `ORG_TOKEN_SECRET` ausente o demasiado corto |

---

## Notas de seguridad

**Lo que ya está cubierto**

- Firma HMAC-SHA256: un token no se puede fabricar ni alterar sin el secreto.
- Comparación de firma en tiempo constante (`timingSafeEqual`).
- Expiración obligatoria y corta (5 minutos por defecto).
- El id de la organización al emitir sale del perfil autenticado, nunca del cliente.
- Solo `OWNER`/`ADMIN` pueden emitir tokens.
- `POST` en vez de `GET`, para que el token no viaje en la URL.
- `Cache-Control: no-store` en las respuestas con claves.
- Errores genéricos hacia afuera, detalle solo en logs; los logs nunca incluyen
  material de clave.

**Lo que falta y conviene evaluar**

- **Rate limiting.** El endpoint no lo tiene. Si se expone fuera de la red
  interna, agrega una regla de Vercel Firewall sobre `/api/internal/*`.
- **Cifrado en reposo.** Las claves siguen guardadas en texto plano en
  `api_key_table`. Cifrarlas y descifrarlas en este endpoint sería el siguiente paso.
- **Revocación individual.** Hoy solo se revoca rotando `ORG_TOKEN_SECRET`, lo que
  invalida todos los tokens a la vez. Si hace falta granularidad, guarda los `jti`
  usados en una tabla y recházalos en la verificación.
- **Trata el token como una credencial:** no lo publiques en URLs, no lo registres
  en logs de cliente ni lo guardes más allá de su vigencia.
