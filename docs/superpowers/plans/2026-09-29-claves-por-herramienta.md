# Claves de API por herramienta: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada herramienta del kit tiene sus propias claves de API por proveedor, configuradas en Ajustes > Herramientas con un acordeón por proveedor; Integraciones desaparece.

**Architecture:** Una tabla nueva `herramienta_proveedores`, sólo accesible con rol de servicio, guarda por organización, herramienta y proveedor la clave, el modelo, el esfuerzo, la verbosidad y la posición. Cuatro rutas de API bajo `/api/herramientas` la leen y escriben (las de configuración exigen OWNER o ADMIN; la de proveedores activos, cualquier miembro). Un helper de servidor entrega clave y ajustes a cada herramienta al correr, y un helper compartido instancia el modelo del proveedor con sus opciones de razonamiento.

**Tech Stack:** Next.js 15 (App Router, route handlers con `params` como Promise), Supabase (cliente con rol de servicio en servidor), Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`), React con shadcn/ui (Accordion, Select, Input, Badge), Vitest para lógica pura.

**Spec:** `docs/superpowers/specs/2026-09-29-claves-por-herramienta-design.md`

## Global Constraints

- Los proveedores se guardan en mayúsculas: `OPENAI`, `ANTHROPIC`, `GOOGLE`. Las herramientas comparan en minúsculas; el helper acepta ambas.
- Identidades de herramienta: `proofreader`, `threads_generator`, `resume`, `detector`, `quien-es-quien`, `preguntas-chatbot`.
- Esfuerzo por proveedor: OpenAI `low|medium|high|xhigh`; Anthropic `low|medium|high`; Google `minimal|low|medium|high`. Verbosidad sólo OpenAI: `low|medium|high`.
- Ninguna ruta devuelve una clave completa; sólo los últimos cuatro caracteres.
- Una clave no se repite entre herramientas de la misma organización.
- Al desplegar, todas las herramientas empiezan sin claves. No se migran las de Integraciones.
- Todo el texto visible y los comentarios van en español, con tildes.
- Verificación de cada tarea: `pnpm test` (Vitest) donde haya pruebas, y `npx tsc --noEmit 2>&1 | wc -l` contra la línea base de 109 líneas (ninguna nueva en archivos tocados). ESLint: `ESLINT_USE_FLAT_CONFIG=false npx eslint -c .eslintrc.json <archivos>` sin problemas nuevos.
- Los commits terminan con `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

- Clave pegada con espacios o salto de línea al final: se guarda recortada y la comparación de repetidas se hace con la clave recortada. Prueba en la Tarea 1.
- Proveedor en minúsculas (`openai`) desde una página vieja o desde el cuerpo de una herramienta: el helper lo acepta y lo normaliza. Prueba en la Tarea 1.
- Clave válida cuyo proveedor devuelve una lista sin modelos tras filtrar: el filtro devuelve lista vacía sin lanzar y la interfaz cae al campo de texto. Prueba en la Tarea 3.
- Guardado con `conservarClave` para un proveedor que ya no tiene fila (se apagó desde otra pestaña): la validación lo rechaza con mensaje. Prueba en la Tarea 1.
- Esfuerzo `xhigh` enviado para Anthropic o Google: la validación lo rechaza y las opciones del modelo nunca lo reciben. Pruebas en las Tareas 1 y 5.

---

## Estructura de archivos

**Nuevos**

- `vitest.config.ts`: alias `@` a la raíz, entorno node.
- `lib/proveedores/tipos.ts`: proveedores, esfuerzos, verbosidades, nombres, identidades de herramienta, tipos compartidos y funciones puras (`normalizarProveedor`, `enmascararClave`, `validarCuerpoGuardado`).
- `lib/proveedores/__tests__/tipos.test.ts`
- `lib/proveedores/listar-modelos.ts`: filtros puros por proveedor y `listarModelos(proveedor, apiKey)` contra la API real.
- `lib/proveedores/__tests__/listar-modelos.test.ts`
- `lib/proveedores/opciones-modelo.ts`: `opcionesDeProveedor` (puro) y `crearModeloConfigurado`.
- `lib/proveedores/__tests__/opciones-modelo.test.ts`
- `lib/proveedores/configuracion.ts`: lectura y escritura de `herramienta_proveedores` con rol de servicio.
- `lib/proveedores/sesion.ts`: `sesionDeOrganizacion` y `sesionDeAdministrador`.
- `lib/supabase/admin.ts`: `getSupabaseAdmin()`.
- `supabase/migrations/create_herramienta_proveedores.sql`
- `supabase/migrations/drop_api_key_table_y_columnas_models.sql` (se aplica una semana después)
- `app/api/herramientas/[identidad]/proveedores/route.ts` (GET, PUT)
- `app/api/herramientas/[identidad]/proveedores-activos/route.ts` (GET)
- `app/api/herramientas/proveedores-activos/route.ts` (GET, todas las herramientas de la organización)
- `app/api/herramientas/modelos/route.ts` (POST)
- `hooks/use-proveedores-activos.ts`
- `components/tools/proveedor-acordeon.tsx`

**Modificados**

- `lib/supabase/database.types.ts`: tabla y función nuevas.
- `types/tool.ts`, `components/tools/tool-config.tsx` (reescrito), `components/tools/edit-tool-dialog.tsx`, `components/tools/tool-card.tsx`, `components/tools/tool-list-item.tsx`, `app/dashboard/configuracion/herramientas/page.tsx`.
- `components/proofreader/api-key-required-modal.tsx`.
- `app/dashboard/corrector/page.tsx`, `actions/analyze-text.ts`, `lib/proofreader/correccion-por-frase.ts`.
- `app/dashboard/generador-hilos/page.tsx`, `actions/generate-threads/index.ts`.
- `app/dashboard/generador-resumen/page.tsx`, `app/api/tools/generate-resume/route.ts`.
- `app/dashboard/detector-de-mentiras/page.tsx`, `app/dashboard/detector-de-mentiras/components/ModelSelectionSection.tsx`, `app/api/detector/route.ts`.
- `app/api/preguntas-chatbot/route.ts`, `lib/preguntas-chatbot/agente.ts`, `lib/organizaciones/prompt-herramienta.ts`.
- `app/api/internal/llm-keys/route.ts`.
- `app/api/organization/create/route.ts`, `app/dashboard/admin/organizaciones/page.tsx`, `app/dashboard/configuracion/layout.tsx`.
- `package.json`.

**Eliminados**

- `app/dashboard/configuracion/integraciones/`, `app/dashboard/configuracion/documentacion/configuraciones/integraciones/`, `app/api/integrations/`, `lib/services/api-key-service.ts`, `components/modals/add-api-key-modal.tsx`, `components/modals/toggle-api-key-status-modal.tsx`, `app/dashboard/detector-de-mentiras/hooks/useApiKeyStatus.ts`.

---

### Task 1: Vitest y los tipos y funciones puras de proveedores

**Files:**
- Create: `vitest.config.ts`, `lib/proveedores/tipos.ts`, `lib/proveedores/__tests__/tipos.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `Proveedor`, `PROVEEDORES`, `NOMBRE_PROVEEDOR`, `ESFUERZOS`, `VERBOSIDADES`, `ESFUERZO_POR_DEFECTO`, `HERRAMIENTAS_CON_PROVEEDORES`, `NOMBRE_HERRAMIENTA`, `esHerramientaConProveedores`, `ProveedorActivo`, `ProveedorConfigurado`, `ProveedorParaGuardar`, `normalizarProveedor`, `enmascararClave`, `validarCuerpoGuardado`.

- [ ] **Step 1: Instalar Vitest y agregar el script**

```bash
pnpm add -D vitest
```

En `package.json`, dentro de `"scripts"`, agregar después de `"lint"`:

```json
    "test": "vitest run"
```

Crear `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Escribir las pruebas que fallan**

`lib/proveedores/__tests__/tipos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  enmascararClave,
  normalizarProveedor,
  validarCuerpoGuardado,
} from "@/lib/proveedores/tipos";

describe("normalizarProveedor", () => {
  it("acepta mayúsculas y minúsculas", () => {
    expect(normalizarProveedor("openai")).toBe("OPENAI");
    expect(normalizarProveedor("ANTHROPIC")).toBe("ANTHROPIC");
    expect(normalizarProveedor(" google ")).toBe("GOOGLE");
  });

  it("devuelve null para lo que no es un proveedor", () => {
    expect(normalizarProveedor("perplexity")).toBeNull();
    expect(normalizarProveedor(42)).toBeNull();
    expect(normalizarProveedor(undefined)).toBeNull();
  });
});

describe("enmascararClave", () => {
  it("deja sólo los últimos cuatro caracteres", () => {
    expect(enmascararClave("sk-abcdefgh1234")).toBe("••••1234");
  });

  it("no revela nada de una clave de cuatro caracteres o menos", () => {
    expect(enmascararClave("abcd")).toBe("••••");
    expect(enmascararClave("")).toBe("••••");
  });
});

describe("validarCuerpoGuardado", () => {
  const base = { proveedor: "OPENAI", modelo: "gpt-5.6-terra", apiKey: "sk-1" };

  it("acepta una lista válida y la devuelve normalizada", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ ...base, reasoningEffort: "high", verbosity: "low" }] },
      []
    );
    expect(r).toEqual({
      ok: true,
      proveedores: [
        {
          proveedor: "OPENAI",
          modelo: "gpt-5.6-terra",
          apiKey: "sk-1",
          conservarClave: false,
          reasoningEffort: "high",
          verbosity: "low",
        },
      ],
    });
  });

  it("recorta espacios en la clave y el modelo", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "openai", modelo: "  gpt-5.6-terra ", apiKey: " sk-1\n" }] },
      []
    );
    expect(r.ok && r.proveedores[0]).toMatchObject({ modelo: "gpt-5.6-terra", apiKey: "sk-1" });
  });

  it("rechaza una lista vacía", () => {
    expect(validarCuerpoGuardado({ proveedores: [] }, [])).toEqual({
      ok: false,
      error: "Configura al menos un proveedor con clave y modelo",
    });
  });

  it("rechaza un proveedor desconocido y uno repetido", () => {
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "perplexity" }] }, []).ok).toBe(false);
    const r = validarCuerpoGuardado({ proveedores: [base, base] }, []);
    expect(r).toEqual({ ok: false, error: "OpenAI aparece dos veces", proveedor: "OPENAI" });
  });

  it("rechaza modelo vacío", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, modelo: "  " }] }, []);
    expect(r).toEqual({ ok: false, error: "Escribe o elige el modelo de OpenAI", proveedor: "OPENAI" });
  });

  it("exige clave nueva o conservarClave con fila existente", () => {
    const sinClave = validarCuerpoGuardado({ proveedores: [{ proveedor: "OPENAI", modelo: "m" }] }, []);
    expect(sinClave).toEqual({ ok: false, error: "Falta la clave de OpenAI", proveedor: "OPENAI" });

    const conservarSinFila = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "OPENAI", modelo: "m", conservarClave: true }] },
      ["ANTHROPIC"]
    );
    expect(conservarSinFila).toEqual({
      ok: false,
      error: "OpenAI ya no tiene clave guardada; escribe una nueva",
      proveedor: "OPENAI",
    });

    const conservarConFila = validarCuerpoGuardado(
      { proveedores: [{ proveedor: "OPENAI", modelo: "m", conservarClave: true }] },
      ["OPENAI"]
    );
    expect(conservarConFila.ok).toBe(true);
    expect(conservarConFila.ok && conservarConFila.proveedores[0].apiKey).toBeUndefined();
  });

  it("valida el esfuerzo según el proveedor", () => {
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "ANTHROPIC", reasoningEffort: "xhigh" }] }, [])).toEqual({
      ok: false,
      error: "Anthropic no admite el esfuerzo xhigh",
      proveedor: "ANTHROPIC",
    });
    expect(validarCuerpoGuardado({ proveedores: [{ ...base, proveedor: "GOOGLE", reasoningEffort: "minimal" }] }, []).ok).toBe(true);
  });

  it("aplica el esfuerzo por defecto y descarta la verbosidad fuera de OpenAI", () => {
    const r = validarCuerpoGuardado(
      { proveedores: [{ ...base, proveedor: "GOOGLE", verbosity: "high" }] },
      []
    );
    expect(r.ok && r.proveedores[0]).toMatchObject({ reasoningEffort: "medium", verbosity: null });
  });

  it("rechaza una verbosidad inválida en OpenAI", () => {
    const r = validarCuerpoGuardado({ proveedores: [{ ...base, verbosity: "max" }] }, []);
    expect(r).toEqual({ ok: false, error: "OpenAI no admite la verbosidad max", proveedor: "OPENAI" });
  });
});
```

- [ ] **Step 3: Correr las pruebas y ver que fallan**

Run: `pnpm test`
Expected: FAIL, el módulo `@/lib/proveedores/tipos` no existe.

- [ ] **Step 4: Escribir `lib/proveedores/tipos.ts`**

```ts
/**
 * Proveedores de IA que cada herramienta puede encender desde Ajustes >
 * Herramientas, y lo que se guarda de cada uno. Este archivo no toca la
 * base ni la red: lo importan el navegador y el servidor.
 */

export const PROVEEDORES = ["OPENAI", "ANTHROPIC", "GOOGLE"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export const NOMBRE_PROVEEDOR: Record<Proveedor, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
};

/** Niveles de esfuerzo de razonamiento que admite cada proveedor */
export const ESFUERZOS: Record<Proveedor, readonly string[]> = {
  OPENAI: ["low", "medium", "high", "xhigh"],
  ANTHROPIC: ["low", "medium", "high"],
  GOOGLE: ["minimal", "low", "medium", "high"],
};

/** Verbosidad: sólo OpenAI la tiene */
export const VERBOSIDADES = ["low", "medium", "high"] as const;

export const ESFUERZO_POR_DEFECTO = "medium";
export const VERBOSIDAD_POR_DEFECTO = "medium";

/** Herramientas que llevan proveedores, por su identidad en `tools` */
export const HERRAMIENTAS_CON_PROVEEDORES = [
  "proofreader",
  "threads_generator",
  "resume",
  "detector",
  "quien-es-quien",
  "preguntas-chatbot",
] as const;
export type HerramientaConProveedores = (typeof HERRAMIENTAS_CON_PROVEEDORES)[number];

export const NOMBRE_HERRAMIENTA: Record<HerramientaConProveedores, string> = {
  proofreader: "Corrector",
  threads_generator: "Hilos",
  resume: "Resúmenes",
  detector: "Detector",
  "quien-es-quien": "Quién es quién",
  "preguntas-chatbot": "Preguntas a SillaIA",
};

export function esHerramientaConProveedores(valor: unknown): valor is HerramientaConProveedores {
  return typeof valor === "string" && (HERRAMIENTAS_CON_PROVEEDORES as readonly string[]).includes(valor);
}

/** Lo que ve cualquier miembro: proveedor y modelo, en orden */
export interface ProveedorActivo {
  proveedor: Proveedor;
  modelo: string;
}

/** Lo que ve un administrador en el diálogo: todo menos la clave completa */
export interface ProveedorConfigurado extends ProveedorActivo {
  reasoningEffort: string;
  verbosity: string | null;
  claveEnmascarada: string;
}

/** Lo que manda el diálogo al guardar, ya validado */
export interface ProveedorParaGuardar {
  proveedor: Proveedor;
  modelo: string;
  /** Clave nueva. Ausente si `conservarClave` es verdadero. */
  apiKey?: string;
  conservarClave: boolean;
  reasoningEffort: string;
  verbosity: string | null;
}

export function normalizarProveedor(valor: unknown): Proveedor | null {
  if (typeof valor !== "string") return null;
  const mayusculas = valor.trim().toUpperCase();
  return (PROVEEDORES as readonly string[]).includes(mayusculas) ? (mayusculas as Proveedor) : null;
}

/** Sólo los últimos cuatro caracteres; con cuatro o menos, nada. */
export function enmascararClave(clave: string): string {
  return clave.length > 4 ? `••••${clave.slice(-4)}` : "••••";
}

export type ResultadoValidacion =
  | { ok: true; proveedores: ProveedorParaGuardar[] }
  | { ok: false; error: string; proveedor?: Proveedor };

/**
 * Valida el cuerpo del PUT de configuración. `proveedoresGuardados` son los
 * que ya tienen fila: `conservarClave` sólo vale para ellos.
 */
export function validarCuerpoGuardado(
  cuerpo: unknown,
  proveedoresGuardados: readonly Proveedor[]
): ResultadoValidacion {
  const lista = (cuerpo as { proveedores?: unknown } | null)?.proveedores;
  if (!Array.isArray(lista) || lista.length === 0) {
    return { ok: false, error: "Configura al menos un proveedor con clave y modelo" };
  }

  const resultado: ProveedorParaGuardar[] = [];
  const vistos = new Set<Proveedor>();

  for (const item of lista) {
    const fila = item as Record<string, unknown> | null;
    const proveedor = normalizarProveedor(fila?.proveedor);
    if (!proveedor) return { ok: false, error: "Proveedor desconocido" };
    const nombre = NOMBRE_PROVEEDOR[proveedor];

    if (vistos.has(proveedor)) return { ok: false, error: `${nombre} aparece dos veces`, proveedor };
    vistos.add(proveedor);

    const modelo = typeof fila?.modelo === "string" ? fila.modelo.trim() : "";
    if (!modelo) return { ok: false, error: `Escribe o elige el modelo de ${nombre}`, proveedor };

    const conservarClave = fila?.conservarClave === true;
    const apiKey = typeof fila?.apiKey === "string" ? fila.apiKey.trim() : "";
    if (conservarClave && !proveedoresGuardados.includes(proveedor)) {
      return { ok: false, error: `${nombre} ya no tiene clave guardada; escribe una nueva`, proveedor };
    }
    if (!conservarClave && !apiKey) {
      return { ok: false, error: `Falta la clave de ${nombre}`, proveedor };
    }

    const reasoningEffort =
      typeof fila?.reasoningEffort === "string" && fila.reasoningEffort !== ""
        ? fila.reasoningEffort
        : ESFUERZO_POR_DEFECTO;
    if (!ESFUERZOS[proveedor].includes(reasoningEffort)) {
      return { ok: false, error: `${nombre} no admite el esfuerzo ${reasoningEffort}`, proveedor };
    }

    let verbosity: string | null = null;
    if (proveedor === "OPENAI") {
      verbosity =
        typeof fila?.verbosity === "string" && fila.verbosity !== "" ? fila.verbosity : VERBOSIDAD_POR_DEFECTO;
      if (!(VERBOSIDADES as readonly string[]).includes(verbosity)) {
        return { ok: false, error: `${nombre} no admite la verbosidad ${verbosity}`, proveedor };
      }
    }

    resultado.push({
      proveedor,
      modelo,
      ...(conservarClave ? {} : { apiKey }),
      conservarClave,
      reasoningEffort,
      verbosity,
    });
  }

  return { ok: true, proveedores: resultado };
}
```

- [ ] **Step 5: Correr las pruebas y ver que pasan**

Run: `pnpm test`
Expected: PASS, 12 pruebas.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml lib/proveedores/tipos.ts lib/proveedores/__tests__/tipos.test.ts
git commit -m "feat(proveedores): tipos, validación y Vitest para las claves por herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Migración, tipos de la base y cliente de servicio

**Files:**
- Create: `supabase/migrations/create_herramienta_proveedores.sql`, `lib/supabase/admin.ts`
- Modify: `lib/supabase/database.types.ts`

**Interfaces:**
- Produces: tabla `herramienta_proveedores`, función SQL `guardar_herramienta_proveedores`, `getSupabaseAdmin()`, tipos `Database["public"]["Tables"]["herramienta_proveedores"]` y `Database["public"]["Functions"]["guardar_herramienta_proveedores"]`.

- [ ] **Step 1: Escribir la migración**

`supabase/migrations/create_herramienta_proveedores.sql`:

```sql
-- Claves de API por herramienta y proveedor.
--
-- Reemplaza a api_key_table (una clave por organización y proveedor): ahora
-- cada herramienta tiene las suyas. Sólo la lee y escribe el rol de servicio;
-- el navegador nunca ve esta tabla. Ver
-- docs/superpowers/specs/2026-09-29-claves-por-herramienta-design.md.

create table if not exists public.herramienta_proveedores (
  organization_id uuid not null references public.organization (id) on delete cascade,
  herramienta text not null,
  proveedor text not null check (proveedor in ('OPENAI', 'ANTHROPIC', 'GOOGLE')),
  api_key text not null check (length(api_key) > 0),
  modelo text not null check (length(modelo) > 0),
  reasoning_effort text,
  verbosity text,
  posicion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, herramienta, proveedor)
);

-- Una clave no se repite entre herramientas de la misma organización.
create unique index if not exists herramienta_proveedores_clave_unica
  on public.herramienta_proveedores (organization_id, api_key);

alter table public.herramienta_proveedores enable row level security;

drop policy if exists "service_role_todo" on public.herramienta_proveedores;
create policy "service_role_todo"
  on public.herramienta_proveedores
  for all
  to service_role
  using (true)
  with check (true);

-- Guarda la configuración completa de una herramienta en una transacción:
-- inserta o actualiza los proveedores que vienen y borra los que no.
--
-- `p_proveedores` es un arreglo JSON de objetos
--   { "proveedor", "api_key" (opcional: conservar la actual), "modelo",
--     "reasoning_effort", "verbosity", "posicion" }.
-- Si `api_key` viene nulo, se conserva la de la fila existente; si no hay
-- fila, falla con un mensaje claro.
create or replace function public.guardar_herramienta_proveedores(
  p_organization_id uuid,
  p_herramienta text,
  p_proveedores jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fila jsonb;
  clave text;
begin
  delete from public.herramienta_proveedores
  where organization_id = p_organization_id
    and herramienta = p_herramienta
    and proveedor not in (
      select value ->> 'proveedor' from jsonb_array_elements(p_proveedores)
    );

  for fila in select value from jsonb_array_elements(p_proveedores) loop
    clave := fila ->> 'api_key';
    if clave is null then
      select api_key into clave
      from public.herramienta_proveedores
      where organization_id = p_organization_id
        and herramienta = p_herramienta
        and proveedor = fila ->> 'proveedor';
      if clave is null then
        raise exception 'El proveedor % no tiene clave guardada', fila ->> 'proveedor'
          using errcode = '22023';
      end if;
    end if;

    insert into public.herramienta_proveedores (
      organization_id, herramienta, proveedor, api_key, modelo,
      reasoning_effort, verbosity, posicion, updated_at
    ) values (
      p_organization_id,
      p_herramienta,
      fila ->> 'proveedor',
      clave,
      fila ->> 'modelo',
      fila ->> 'reasoning_effort',
      fila ->> 'verbosity',
      coalesce((fila ->> 'posicion')::integer, 0),
      now()
    )
    on conflict (organization_id, herramienta, proveedor) do update set
      api_key = excluded.api_key,
      modelo = excluded.modelo,
      reasoning_effort = excluded.reasoning_effort,
      verbosity = excluded.verbosity,
      posicion = excluded.posicion,
      updated_at = now();
  end loop;
end;
$$;

revoke all on function public.guardar_herramienta_proveedores(uuid, text, jsonb) from public;
grant execute on function public.guardar_herramienta_proveedores(uuid, text, jsonb) to service_role;
```

- [ ] **Step 2: Agregar los tipos a `lib/supabase/database.types.ts`**

Dentro de `Database["public"]["Tables"]`, antes de `tools: {` (línea 655), agregar:

```ts
      herramienta_proveedores: {
        Row: {
          organization_id: string
          herramienta: string
          proveedor: string
          api_key: string
          modelo: string
          reasoning_effort: string | null
          verbosity: string | null
          posicion: number
          created_at: string
          updated_at: string
        }
        Insert: {
          organization_id: string
          herramienta: string
          proveedor: string
          api_key: string
          modelo: string
          reasoning_effort?: string | null
          verbosity?: string | null
          posicion?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          herramienta?: string
          proveedor?: string
          api_key?: string
          modelo?: string
          reasoning_effort?: string | null
          verbosity?: string | null
          posicion?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
```

Dentro de `Database["public"]["Functions"]` (buscar `Functions: {` en la sección `public`; si su contenido es `[_ in never]: never`, reemplazarlo), agregar:

```ts
      guardar_herramienta_proveedores: {
        Args: {
          p_organization_id: string
          p_herramienta: string
          p_proveedores: Json
        }
        Returns: undefined
      }
```

- [ ] **Step 3: Crear `lib/supabase/admin.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente con rol de servicio, sin cookies ni sesión: salta las políticas de
 * acceso. Sólo para código de servidor que ya comprobó quién pide y qué puede
 * ver, como las rutas de /api/herramientas. Nunca importarlo desde un
 * componente de cliente.
 */
export function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | wc -l`
Expected: 109 (línea base), sin errores en `lib/supabase/admin.ts` ni en `database.types.ts`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/create_herramienta_proveedores.sql lib/supabase/admin.ts lib/supabase/database.types.ts
git commit -m "feat(proveedores): tabla herramienta_proveedores y cliente con rol de servicio

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Listar modelos de cada proveedor

**Files:**
- Create: `lib/proveedores/listar-modelos.ts`, `lib/proveedores/__tests__/listar-modelos.test.ts`

**Interfaces:**
- Consumes: `Proveedor` de la Tarea 1.
- Produces: `filtrarModelosOpenAI(ids: string[]): string[]`, `filtrarModelosAnthropic(ids: string[]): string[]`, `filtrarModelosGoogle(nombres: string[]): string[]`, `class ErrorProveedor extends Error { status: number }`, `listarModelos(proveedor: Proveedor, apiKey: string): Promise<string[]>`.

- [ ] **Step 1: Escribir las pruebas que fallan**

`lib/proveedores/__tests__/listar-modelos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  filtrarModelosAnthropic,
  filtrarModelosGoogle,
  filtrarModelosOpenAI,
} from "@/lib/proveedores/listar-modelos";

describe("filtrarModelosOpenAI", () => {
  it("deja los gpt sin instruct ni versiones viejas, ordenados", () => {
    const ids = ["whisper-1", "gpt-4-0314", "gpt-5.6-terra", "gpt-3.5-turbo-instruct", "gpt-4o", "gpt-4-0301"];
    expect(filtrarModelosOpenAI(ids)).toEqual(["gpt-4o", "gpt-5.6-terra"]);
  });

  it("devuelve lista vacía si no hay gpt, sin lanzar", () => {
    expect(filtrarModelosOpenAI(["whisper-1", "dall-e-3"])).toEqual([]);
  });
});

describe("filtrarModelosAnthropic", () => {
  it("deja sólo los claude, ordenados", () => {
    expect(filtrarModelosAnthropic(["claude-sonnet-5", "otro", "claude-opus-4-8"])).toEqual([
      "claude-opus-4-8",
      "claude-sonnet-5",
    ]);
  });
});

describe("filtrarModelosGoogle", () => {
  it("quita el prefijo models/ y deja sólo gemini", () => {
    expect(filtrarModelosGoogle(["models/gemini-3.1-pro-preview", "models/embedding-001", "models/gemini-3-flash-preview"])).toEqual([
      "gemini-3-flash-preview",
      "gemini-3.1-pro-preview",
    ]);
  });
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `pnpm test`
Expected: FAIL, el módulo `listar-modelos` no existe.

- [ ] **Step 3: Escribir `lib/proveedores/listar-modelos.ts`**

```ts
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

  const datos = await respuesta.json();
  switch (proveedor) {
    case "OPENAI":
      return filtrarModelosOpenAI((datos?.data ?? []).map((m: { id: string }) => m.id));
    case "ANTHROPIC":
      return filtrarModelosAnthropic((datos?.data ?? []).map((m: { id: string }) => m.id));
    case "GOOGLE":
      return filtrarModelosGoogle((datos?.models ?? []).map((m: { name: string }) => m.name));
  }
}
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/proveedores/listar-modelos.ts lib/proveedores/__tests__/listar-modelos.test.ts
git commit -m "feat(proveedores): listar modelos reales de OpenAI, Anthropic y Google

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Sesión y configuración en el servidor

**Files:**
- Create: `lib/proveedores/sesion.ts`, `lib/proveedores/configuracion.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin` (Tarea 2), `getSupabaseRouteHandler`, tipos de la Tarea 1.
- Produces:
  - `sesionDeOrganizacion(): Promise<Sesion>` y `sesionDeAdministrador(): Promise<Sesion>` con `type Sesion = { ok: true; userId: string; organizationId: string; role: string } | { ok: false; status: number; error: string }`.
  - `class ProveedorNoConfiguradoError extends Error { herramienta; proveedor }`.
  - `interface ProveedorEnUso { proveedor: Proveedor; modelo: string; apiKey: string; reasoningEffort: string; verbosity: string | null }`.
  - `obtenerProveedorDeHerramienta(organizationId, herramienta, proveedor: string): Promise<ProveedorEnUso>`.
  - `listarProveedoresActivos(organizationId, herramienta): Promise<ProveedorActivo[]>`.
  - `listarProveedoresActivosDeTodas(organizationId): Promise<Record<string, ProveedorActivo[]>>`.
  - `listarConfiguracionHerramienta(organizationId, herramienta): Promise<{ proveedores: ProveedorConfigurado[]; sugerencias: Record<Proveedor, string[]> }>`.
  - `guardarConfiguracionHerramienta(organizationId, herramienta, proveedores: ProveedorParaGuardar[]): Promise<{ ok: true } | { ok: false; error: string; proveedor?: Proveedor }>`.

- [ ] **Step 1: Escribir `lib/proveedores/sesion.ts`**

```ts
import { getSupabaseRouteHandler } from "@/lib/supabase/server";

export type Sesion =
  | { ok: true; userId: string; organizationId: string; role: string }
  | { ok: false; status: number; error: string };

/** Quién pide y de qué organización. Sin sesión, 401; sin organización, 403. */
export async function sesionDeOrganizacion(): Promise<Sesion> {
  const supabase = await getSupabaseRouteHandler();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "No hay usuario autenticado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", user.id)
    .single();
  if (!perfil?.organizationId) {
    return { ok: false, status: 403, error: "El usuario no pertenece a una organización" };
  }
  return { ok: true, userId: user.id, organizationId: perfil.organizationId, role: perfil.role ?? "USER" };
}

/** Igual, pero sólo para OWNER o ADMIN: son quienes tocan claves. */
export async function sesionDeAdministrador(): Promise<Sesion> {
  const sesion = await sesionDeOrganizacion();
  if (!sesion.ok) return sesion;
  if (sesion.role !== "OWNER" && sesion.role !== "ADMIN") {
    return { ok: false, status: 403, error: "Sólo un administrador puede configurar los proveedores" };
  }
  return sesion;
}
```

- [ ] **Step 2: Escribir `lib/proveedores/configuracion.ts`**

```ts
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  enmascararClave,
  ESFUERZO_POR_DEFECTO,
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
  reasoningEffort: string;
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
    reasoningEffort: fila.reasoning_effort ?? ESFUERZO_POR_DEFECTO,
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
      reasoningEffort: f.reasoning_effort ?? ESFUERZO_POR_DEFECTO,
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

/**
 * Guarda la lista completa: los que vienen se insertan o actualizan en ese
 * orden, los que no vienen se borran. Antes comprueba que ninguna clave nueva
 * esté en otra herramienta; el índice único respalda la comprobación si dos
 * guardados compiten.
 */
export async function guardarConfiguracionHerramienta(
  organizationId: string,
  herramienta: string,
  proveedores: ProveedorParaGuardar[]
): Promise<{ ok: true } | { ok: false; error: string; proveedor?: Proveedor }> {
  const supabase = getSupabaseAdmin();

  const clavesNuevas = proveedores.filter((p) => p.apiKey).map((p) => p.apiKey!);
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
    p_proveedores: proveedores.map((p, posicion) => ({
      proveedor: p.proveedor,
      api_key: p.apiKey ?? null,
      modelo: p.modelo,
      reasoning_effort: p.reasoningEffort,
      verbosity: p.verbosity,
      posicion,
    })),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Una de las claves ya está en otra herramienta. Cada herramienta lleva una clave distinta." };
    }
    return { ok: false, error: `No se pudo guardar: ${error.message}` };
  }
  return { ok: true };
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | grep "lib/proveedores"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add lib/proveedores/sesion.ts lib/proveedores/configuracion.ts
git commit -m "feat(proveedores): sesión y lectura/escritura de herramienta_proveedores

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Modelo configurado con sus opciones de razonamiento

**Files:**
- Create: `lib/proveedores/opciones-modelo.ts`, `lib/proveedores/__tests__/opciones-modelo.test.ts`

**Interfaces:**
- Consumes: `ProveedorEnUso` (Tarea 4), `Proveedor` (Tarea 1).
- Produces: `opcionesDeProveedor(proveedor: Proveedor, reasoningEffort: string, verbosity: string | null, extraOpenAI?: Record<string, unknown>): Record<string, Record<string, unknown>>` y `crearModeloConfigurado(config: ProveedorEnUso, extraOpenAI?): { model: LanguageModel; providerOptions: Record<string, Record<string, unknown>> }`.

- [ ] **Step 1: Escribir las pruebas que fallan**

`lib/proveedores/__tests__/opciones-modelo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { opcionesDeProveedor } from "@/lib/proveedores/opciones-modelo";

describe("opcionesDeProveedor", () => {
  it("OpenAI: esfuerzo, verbosidad y sin almacenar", () => {
    expect(opcionesDeProveedor("OPENAI", "high", "low")).toEqual({
      openai: { reasoningEffort: "high", textVerbosity: "low", store: false },
    });
  });

  it("OpenAI: sin verbosidad usa medium y mezcla opciones extra", () => {
    expect(opcionesDeProveedor("OPENAI", "medium", null, { promptCacheKey: "x" })).toEqual({
      openai: { reasoningEffort: "medium", textVerbosity: "medium", store: false, promptCacheKey: "x" },
    });
  });

  it("Anthropic: sólo effort, y xhigh se recorta a high", () => {
    expect(opcionesDeProveedor("ANTHROPIC", "low", null)).toEqual({ anthropic: { effort: "low" } });
    expect(opcionesDeProveedor("ANTHROPIC", "xhigh", "high")).toEqual({ anthropic: { effort: "high" } });
  });

  it("Google: thinkingLevel, y xhigh se recorta a high", () => {
    expect(opcionesDeProveedor("GOOGLE", "minimal", null)).toEqual({
      google: { thinkingConfig: { thinkingLevel: "minimal" } },
    });
    expect(opcionesDeProveedor("GOOGLE", "xhigh", null)).toEqual({
      google: { thinkingConfig: { thinkingLevel: "high" } },
    });
  });
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `pnpm test`
Expected: FAIL, el módulo no existe.

- [ ] **Step 3: Escribir `lib/proveedores/opciones-modelo.ts`**

```ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { ProveedorEnUso } from "@/lib/proveedores/configuracion";
import { VERBOSIDAD_POR_DEFECTO, type Proveedor } from "@/lib/proveedores/tipos";

/**
 * Cómo se traduce el esfuerzo configurado en Ajustes a cada proveedor:
 * `reasoningEffort` y `textVerbosity` en OpenAI, `effort` en Anthropic,
 * `thinkingLevel` en Google. Antes sólo el Detector lo aplicaba; ahora todas
 * las herramientas pasan por aquí.
 *
 * `xhigh` sólo existe en OpenAI: si llegara para otro proveedor (no debería,
 * la validación lo impide) se recorta a `high` en vez de fallar.
 */
export function opcionesDeProveedor(
  proveedor: Proveedor,
  reasoningEffort: string,
  verbosity: string | null,
  extraOpenAI: Record<string, unknown> = {}
): Record<string, Record<string, unknown>> {
  const sinXhigh = reasoningEffort === "xhigh" ? "high" : reasoningEffort;
  switch (proveedor) {
    case "OPENAI":
      return {
        openai: {
          reasoningEffort,
          textVerbosity: verbosity ?? VERBOSIDAD_POR_DEFECTO,
          store: false,
          ...extraOpenAI,
        },
      };
    case "ANTHROPIC":
      return { anthropic: { effort: sinXhigh } };
    case "GOOGLE":
      return { google: { thinkingConfig: { thinkingLevel: sinXhigh } } };
  }
}

/** El modelo instanciado con la clave de la herramienta, más sus opciones */
export function crearModeloConfigurado(
  config: ProveedorEnUso,
  extraOpenAI: Record<string, unknown> = {}
): { model: LanguageModel; providerOptions: Record<string, Record<string, unknown>> } {
  const providerOptions = opcionesDeProveedor(config.proveedor, config.reasoningEffort, config.verbosity, extraOpenAI);
  switch (config.proveedor) {
    case "OPENAI":
      return { model: createOpenAI({ apiKey: config.apiKey })(config.modelo), providerOptions };
    case "ANTHROPIC":
      return { model: createAnthropic({ apiKey: config.apiKey })(config.modelo), providerOptions };
    case "GOOGLE":
      return { model: createGoogleGenerativeAI({ apiKey: config.apiKey })(config.modelo), providerOptions };
  }
}
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/proveedores/opciones-modelo.ts lib/proveedores/__tests__/opciones-modelo.test.ts
git commit -m "feat(proveedores): modelo configurado con esfuerzo por proveedor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Rutas de API de herramientas

**Files:**
- Create: `app/api/herramientas/[identidad]/proveedores/route.ts`, `app/api/herramientas/[identidad]/proveedores-activos/route.ts`, `app/api/herramientas/proveedores-activos/route.ts`, `app/api/herramientas/modelos/route.ts`

**Interfaces:**
- Consumes: Tareas 1, 3 y 4.
- Produces:
  - `GET /api/herramientas/[identidad]/proveedores` → `{ proveedores: ProveedorConfigurado[]; sugerencias: Record<Proveedor, string[]> }`.
  - `PUT /api/herramientas/[identidad]/proveedores` con `{ proveedores: ProveedorParaGuardar[] }` → `{ ok: true }` o `{ error, proveedor? }` con 400.
  - `GET /api/herramientas/[identidad]/proveedores-activos` → `{ proveedores: ProveedorActivo[] }`.
  - `GET /api/herramientas/proveedores-activos` → `{ porHerramienta: Record<string, ProveedorActivo[]> }`.
  - `POST /api/herramientas/modelos` con `{ proveedor, apiKey?: string, herramienta?: string }` → `{ modelos: string[] }` o `{ error }` con el status del error.

- [ ] **Step 1: Escribir `app/api/herramientas/[identidad]/proveedores/route.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

import {
  guardarConfiguracionHerramienta,
  listarConfiguracionHerramienta,
} from "@/lib/proveedores/configuracion";
import { sesionDeAdministrador } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores, validarCuerpoGuardado } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

type Contexto = { params: Promise<{ identidad: string }> };

/** Configuración de una herramienta, con las claves enmascaradas. Sólo OWNER o ADMIN. */
export async function GET(_request: NextRequest, { params }: Contexto) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const configuracion = await listarConfiguracionHerramienta(sesion.organizationId, identidad);
  return NextResponse.json(configuracion, { headers: NO_STORE });
}

/** Guarda la lista completa de proveedores de la herramienta. Sólo OWNER o ADMIN. */
export async function PUT(request: NextRequest, { params }: Contexto) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const cuerpo = await request.json().catch(() => null);
  const guardados = (await listarConfiguracionHerramienta(sesion.organizationId, identidad)).proveedores.map(
    (p) => p.proveedor
  );
  const validacion = validarCuerpoGuardado(cuerpo, guardados);
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error, proveedor: validacion.proveedor }, { status: 400 });
  }

  const resultado = await guardarConfiguracionHerramienta(sesion.organizationId, identidad, validacion.proveedores);
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error, proveedor: resultado.proveedor }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
```

- [ ] **Step 2: Escribir `app/api/herramientas/[identidad]/proveedores-activos/route.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

import { listarProveedoresActivos } from "@/lib/proveedores/configuracion";
import { sesionDeOrganizacion } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

/**
 * Proveedores encendidos de una herramienta, en orden, sin claves ni
 * ajustes. Para cualquier miembro: es lo que arma el selector de la página
 * de uso y decide el proveedor por defecto.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ identidad: string }> }) {
  const { identidad } = await params;
  if (!esHerramientaConProveedores(identidad)) {
    return NextResponse.json({ error: "Herramienta desconocida" }, { status: 404 });
  }
  const sesion = await sesionDeOrganizacion();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const proveedores = await listarProveedoresActivos(sesion.organizationId, identidad);
  return NextResponse.json({ proveedores }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 3: Escribir `app/api/herramientas/proveedores-activos/route.ts`**

```ts
import { NextResponse } from "next/server";

import { listarProveedoresActivosDeTodas } from "@/lib/proveedores/configuracion";
import { sesionDeOrganizacion } from "@/lib/proveedores/sesion";

export const dynamic = "force-dynamic";

/** Proveedores encendidos de todas las herramientas, para las tarjetas de Ajustes */
export async function GET() {
  const sesion = await sesionDeOrganizacion();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const porHerramienta = await listarProveedoresActivosDeTodas(sesion.organizationId);
  return NextResponse.json({ porHerramienta }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 4: Escribir `app/api/herramientas/modelos/route.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

import { obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError } from "@/lib/proveedores/configuracion";
import { ErrorProveedor, listarModelos } from "@/lib/proveedores/listar-modelos";
import { sesionDeAdministrador } from "@/lib/proveedores/sesion";
import { esHerramientaConProveedores, normalizarProveedor } from "@/lib/proveedores/tipos";

export const dynamic = "force-dynamic";

/**
 * Lista de modelos de un proveedor, con una clave nueva o con la que ya
 * tiene guardada una herramienta. Si la lista llega, la clave funciona.
 *
 * Cuerpo: { proveedor, apiKey } o { proveedor, herramienta }.
 */
export async function POST(request: NextRequest) {
  const sesion = await sesionDeAdministrador();
  if (!sesion.ok) return NextResponse.json({ error: sesion.error }, { status: sesion.status });

  const cuerpo = await request.json().catch(() => null);
  const proveedor = normalizarProveedor(cuerpo?.proveedor);
  if (!proveedor) return NextResponse.json({ error: "Proveedor desconocido" }, { status: 400 });

  let apiKey = typeof cuerpo?.apiKey === "string" ? cuerpo.apiKey.trim() : "";
  if (!apiKey) {
    const herramienta = cuerpo?.herramienta;
    if (!esHerramientaConProveedores(herramienta)) {
      return NextResponse.json({ error: "Falta la clave" }, { status: 400 });
    }
    try {
      apiKey = (await obtenerProveedorDeHerramienta(sesion.organizationId, herramienta, proveedor)).apiKey;
    } catch (error) {
      if (error instanceof ProveedorNoConfiguradoError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  }

  try {
    const modelos = await listarModelos(proveedor, apiKey);
    return NextResponse.json({ modelos }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ErrorProveedor) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[herramientas/modelos] Error listando modelos:", error);
    return NextResponse.json({ error: "No se pudo consultar la lista de modelos" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Verificar tipos y lint**

Run: `npx tsc --noEmit 2>&1 | grep "api/herramientas"` → sin salida.
Run: `ESLINT_USE_FLAT_CONFIG=false npx eslint -c .eslintrc.json "app/api/herramientas/**/*.ts"` → sin problemas.

- [ ] **Step 6: Commit**

```bash
git add app/api/herramientas
git commit -m "feat(proveedores): rutas de configuración, proveedores activos y lista de modelos

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Hook de proveedores activos y aviso de configuración faltante

**Files:**
- Create: `hooks/use-proveedores-activos.ts`
- Modify: `components/proofreader/api-key-required-modal.tsx`

**Interfaces:**
- Produces: `useProveedoresActivos(herramienta: string): { proveedores: ProveedorActivo[]; cargando: boolean; error: string | null; recargar: () => void }`.
- `ApiKeyRequiredModal` conserva sus props `{ isOpen, isAdmin, isLoading? }` y gana `herramienta?: string` (nombre visible).

- [ ] **Step 1: Escribir `hooks/use-proveedores-activos.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProveedorActivo } from "@/lib/proveedores/tipos";

/**
 * Proveedores encendidos de una herramienta, en el orden guardado en
 * Ajustes. Reemplaza las lecturas de api_key_table que las páginas hacían
 * desde el navegador: el cliente sólo ve proveedor y modelo.
 */
export function useProveedoresActivos(herramienta: string) {
  const [proveedores, setProveedores] = useState<ProveedorActivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/herramientas/${herramienta}/proveedores-activos`, {
        cache: "no-store",
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setError(datos?.error ?? "No se pudieron cargar los proveedores");
        setProveedores([]);
        return;
      }
      setProveedores(Array.isArray(datos?.proveedores) ? datos.proveedores : []);
    } catch {
      setError("No se pudieron cargar los proveedores");
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  }, [herramienta]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { proveedores, cargando, error, recargar };
}
```

- [ ] **Step 2: Reescribir `components/proofreader/api-key-required-modal.tsx`**

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyRequiredModalProps {
  isOpen: boolean
  isAdmin: boolean
  isLoading?: boolean
  /** Nombre visible de la herramienta, ej. "el Corrector" */
  herramienta?: string
}

/**
 * Se muestra cuando la herramienta no tiene ningún proveedor encendido en
 * Ajustes > Herramientas. Antes mandaba a Integraciones; esa sección ya no
 * existe.
 */
export function ApiKeyRequiredModal({ isOpen, isAdmin, isLoading, herramienta = "esta herramienta" }: ApiKeyRequiredModalProps) {
  const router = useRouter()

  if (isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Falta configurar un proveedor
          </DialogTitle>
          <DialogDescription>
            Para usar {herramienta} hace falta al menos un proveedor de IA con su clave.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">{herramienta} no tiene ningún proveedor configurado.</p>
            <p className="mt-2">
              {isAdmin
                ? "Como administrador, puedes configurarlo en Ajustes > Herramientas: abre la herramienta, enciende un proveedor con su clave y elige el modelo."
                : "Pide al administrador de tu organización que configure un proveedor en Ajustes > Herramientas."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={() => router.push("/dashboard/configuracion/herramientas")} className="bg-blue-600 hover:bg-blue-700">
                Ir a Herramientas
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | grep -E "use-proveedores-activos|api-key-required-modal"` → sin salida.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-proveedores-activos.ts components/proofreader/api-key-required-modal.tsx
git commit -m "feat(proveedores): hook de proveedores activos y aviso que manda a Herramientas

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Diálogo de Herramientas con acordeones por proveedor

**Files:**
- Create: `components/tools/proveedor-acordeon.tsx`
- Modify: `types/tool.ts`, `components/tools/tool-config.tsx` (reescrito), `components/tools/edit-tool-dialog.tsx`, `components/tools/tool-card.tsx`, `components/tools/tool-list-item.tsx`, `app/dashboard/configuracion/herramientas/page.tsx`

**Interfaces:**
- Consumes: rutas de la Tarea 6, tipos de la Tarea 1.
- Produces: `interface ProveedorEnEdicion` (en `tool-config.tsx`, exportada), `Tool.proveedores?: ProveedorActivo[]`, `EditToolDialog.onSave: (tool: Tool) => Promise<boolean>`.

- [ ] **Step 1: Ajustar `types/tool.ts`**

Reemplazar el archivo completo:

```ts
import type { ProveedorActivo } from "@/lib/proveedores/tipos"

export interface Tool {
  id: number | string
  title: string
  description: string
  tags: string[]
  favorite: boolean
  usageCount: number
  lastUsed: string
  isDefault?: boolean
  identity?: string
  schema?: any
  prompts?: any
  temperature?: number
  topP?: number
  /** Proveedores encendidos en orden, para las tarjetas. Se cargan aparte de `tools`. */
  proveedores?: ProveedorActivo[]
}
```

Los valores `REASONING_EFFORTS`, `VERBOSITY_LEVELS`, `DEFAULT_REASONING_EFFORT` y `DEFAULT_VERBOSITY` desaparecen: ahora viven en `lib/proveedores/tipos.ts` como `ESFUERZOS`, `VERBOSIDADES`, `ESFUERZO_POR_DEFECTO` y `VERBOSIDAD_POR_DEFECTO`. Buscar sus importaciones con `grep -rn "REASONING_EFFORTS\|VERBOSITY_LEVELS\|DEFAULT_REASONING_EFFORT\|DEFAULT_VERBOSITY" --include=*.ts --include=*.tsx app components lib` y quitarlas donde queden (el Detector define sus propias constantes locales, ver Tarea 12).

- [ ] **Step 2: Escribir `components/tools/proveedor-acordeon.tsx`**

```tsx
"use client";

import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESFUERZOS, NOMBRE_PROVEEDOR, VERBOSIDADES } from "@/lib/proveedores/tipos";
import type { ProveedorEnEdicion } from "@/components/tools/tool-config";

interface Props {
  estado: ProveedorEnEdicion;
  esPrimero: boolean;
  esUltimo: boolean;
  esPorDefecto: boolean;
  sugerencias: string[];
  error: string | null;
  onCambiar: (cambios: Partial<ProveedorEnEdicion>) => void;
  onSubir: () => void;
  onBajar: () => void;
  onCambiarClave: () => void;
  onApagar: () => void;
}

/** Un proveedor dentro del diálogo: clave, modelo, esfuerzo y verbosidad */
export function ProveedorAcordeon({
  estado,
  esPrimero,
  esUltimo,
  esPorDefecto,
  sugerencias,
  error,
  onCambiar,
  onSubir,
  onBajar,
  onCambiarClave,
  onApagar,
}: Props) {
  const nombre = NOMBRE_PROVEEDOR[estado.proveedor];
  const tieneClave = estado.claveNueva.trim() !== "" || estado.claveEnmascarada !== null;
  const mostrarSelector = estado.modelosDisponibles !== null && estado.modelosDisponibles.length > 0;

  return (
    <AccordionItem value={estado.proveedor} className="rounded-md border px-3">
      <div className="flex items-center gap-2">
        <AccordionTrigger className="flex-1 py-3 hover:no-underline">
          <div className="flex items-center gap-2 text-left">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${estado.encendido ? "bg-green-500" : "bg-gray-300"}`}
              aria-label={estado.encendido ? "Encendido" : "Apagado"}
            />
            <span className="font-medium">{nombre}</span>
            {estado.encendido && estado.modelo && (
              <span className="text-xs text-gray-500">{estado.modelo}</span>
            )}
            {esPorDefecto && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Por defecto</span>
            )}
          </div>
        </AccordionTrigger>
        <div className="flex flex-col">
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={esPrimero} onClick={onSubir} title="Subir">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={esUltimo} onClick={onBajar} title="Bajar">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AccordionContent className="space-y-3 pb-4">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <div>
          <Label className="mb-1 block text-xs text-gray-600">Clave de API</Label>
          {estado.claveEnmascarada !== null && estado.claveNueva === "" && !estado.reemplazandoClave ? (
            <div className="flex items-center gap-2">
              <Input value={estado.claveEnmascarada} readOnly className="h-8 font-mono text-xs" />
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={onCambiarClave}>
                Cambiar
              </Button>
            </div>
          ) : (
            <Input
              type="password"
              autoComplete="off"
              placeholder={`Pega la clave de ${nombre}`}
              value={estado.claveNueva}
              onChange={(e) => onCambiar({ claveNueva: e.target.value })}
              className="h-8 font-mono text-xs"
            />
          )}
          <p className="mt-1 text-xs text-gray-400">La clave enciende el proveedor. Cada herramienta lleva una clave distinta.</p>
        </div>

        {tieneClave && (
          <>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Label className="text-xs text-gray-600">Modelo</Label>
                {estado.cargandoModelos && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
              </div>

              {sugerencias.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {sugerencias.map((modelo) => (
                    <button
                      key={modelo}
                      type="button"
                      onClick={() => onCambiar({ modelo })}
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        estado.modelo === modelo ? "border-blue-300 bg-blue-50 text-blue-800" : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      title="Modelo usado en otra herramienta"
                    >
                      {modelo}
                    </button>
                  ))}
                </div>
              )}

              {mostrarSelector ? (
                <Select value={estado.modelo} onValueChange={(modelo) => onCambiar({ modelo })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Elige un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set([estado.modelo, ...estado.modelosDisponibles!].filter(Boolean))].map((modelo) => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Escribe el nombre del modelo"
                  value={estado.modelo}
                  onChange={(e) => onCambiar({ modelo: e.target.value })}
                  className="h-8 text-xs"
                />
              )}
              {estado.errorModelos && (
                <p className="mt-1 text-xs text-amber-700">
                  No se pudo consultar la lista: {estado.errorModelos}. Escribe el modelo a mano.
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 block text-xs text-gray-600">Esfuerzo de razonamiento</Label>
              <Select value={estado.reasoningEffort} onValueChange={(reasoningEffort) => onCambiar({ reasoningEffort })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESFUERZOS[estado.proveedor].map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {estado.proveedor === "OPENAI" && (
              <div>
                <Label className="mb-1 block text-xs text-gray-600">Verbosidad</Label>
                <Select value={estado.verbosity} onValueChange={(verbosity) => onCambiar({ verbosity })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERBOSIDADES.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-0.5 text-xs text-gray-400">Longitud y detalle de la respuesta.</p>
              </div>
            )}

            {estado.encendido && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={onApagar}>
                  Apagar {nombre}
                </Button>
              </div>
            )}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
```

- [ ] **Step 3: Reescribir `components/tools/tool-config.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { Accordion } from "@/components/ui/accordion";
import { ProveedorAcordeon } from "@/components/tools/proveedor-acordeon";
import {
  ESFUERZO_POR_DEFECTO,
  NOMBRE_PROVEEDOR,
  PROVEEDORES,
  VERBOSIDAD_POR_DEFECTO,
  type Proveedor,
  type ProveedorConfigurado,
} from "@/lib/proveedores/tipos";

/** Un proveedor mientras se edita en el diálogo */
export interface ProveedorEnEdicion {
  proveedor: Proveedor;
  /** Tiene clave guardada o una nueva escrita */
  encendido: boolean;
  /** Clave guardada, enmascarada. `null` si no hay. */
  claveEnmascarada: string | null;
  /** Clave escrita ahora. Vacía si se conserva la guardada. */
  claveNueva: string;
  /** El usuario pulsó "Cambiar" y quiere escribir otra clave */
  reemplazandoClave: boolean;
  modelo: string;
  reasoningEffort: string;
  verbosity: string;
  /** Lista del proveedor. `null` mientras no se ha consultado o si falló. */
  modelosDisponibles: string[] | null;
  cargandoModelos: boolean;
  errorModelos: string | null;
}

interface ToolConfigProps {
  herramienta: string;
  proveedores: ProveedorEnEdicion[];
  onProveedoresChange: (proveedores: ProveedorEnEdicion[]) => void;
  sugerencias: Record<Proveedor, string[]>;
  /** Error del guardado, para mostrarlo en el acordeón del proveedor */
  errorGuardado: { mensaje: string; proveedor?: Proveedor } | null;
}

export function proveedorVacio(proveedor: Proveedor): ProveedorEnEdicion {
  return {
    proveedor,
    encendido: false,
    claveEnmascarada: null,
    claveNueva: "",
    reemplazandoClave: false,
    modelo: "",
    reasoningEffort: ESFUERZO_POR_DEFECTO,
    verbosity: VERBOSIDAD_POR_DEFECTO,
    modelosDisponibles: null,
    cargandoModelos: false,
    errorModelos: null,
  };
}

/** Los guardados en su orden, y después los que faltan, apagados */
export function proveedoresDesdeConfiguracion(configurados: ProveedorConfigurado[]): ProveedorEnEdicion[] {
  const guardados = configurados.map((c) => ({
    ...proveedorVacio(c.proveedor),
    encendido: true,
    claveEnmascarada: c.claveEnmascarada,
    modelo: c.modelo,
    reasoningEffort: c.reasoningEffort,
    verbosity: c.verbosity ?? VERBOSIDAD_POR_DEFECTO,
  }));
  const faltantes = PROVEEDORES.filter((p) => !configurados.some((c) => c.proveedor === p)).map(proveedorVacio);
  return [...guardados, ...faltantes];
}

/**
 * Los proveedores de la herramienta: un acordeón por cada uno, en el orden
 * que se guarda. La clave enciende el proveedor; al escribirla se consulta
 * la lista de modelos con un retardo corto.
 */
export function ToolConfig({ herramienta, proveedores, onProveedoresChange, sugerencias, errorGuardado }: ToolConfigProps) {
  const [abierto, setAbierto] = useState<string | undefined>(undefined);
  const temporizadores = useRef<Partial<Record<Proveedor, ReturnType<typeof setTimeout>>>>({});

  const actualizar = (proveedor: Proveedor, cambios: Partial<ProveedorEnEdicion>) => {
    onProveedoresChange(proveedores.map((p) => (p.proveedor === proveedor ? { ...p, ...cambios } : p)));
  };

  const consultarModelos = async (proveedor: Proveedor, claveNueva: string) => {
    actualizar(proveedor, { cargandoModelos: true, errorModelos: null });
    try {
      const respuesta = await fetch("/api/herramientas/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claveNueva ? { proveedor, apiKey: claveNueva } : { proveedor, herramienta }),
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: null, errorModelos: datos?.error ?? "sin respuesta" });
        return;
      }
      actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: datos?.modelos ?? [], errorModelos: null });
    } catch {
      actualizar(proveedor, { cargandoModelos: false, modelosDisponibles: null, errorModelos: "sin conexión" });
    }
  };

  // Al abrir un proveedor con clave guardada, consultar su lista una vez.
  useEffect(() => {
    if (!abierto) return;
    const estado = proveedores.find((p) => p.proveedor === abierto);
    if (estado && estado.claveEnmascarada && !estado.claveNueva && estado.modelosDisponibles === null && !estado.cargandoModelos && !estado.errorModelos) {
      consultarModelos(estado.proveedor, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const cambiarClave = (proveedor: Proveedor, claveNueva: string) => {
    actualizar(proveedor, { claveNueva, encendido: claveNueva.trim() !== "" || proveedores.find((p) => p.proveedor === proveedor)!.claveEnmascarada !== null, modelosDisponibles: null, errorModelos: null });
    const anterior = temporizadores.current[proveedor];
    if (anterior) clearTimeout(anterior);
    if (claveNueva.trim().length < 8) return;
    temporizadores.current[proveedor] = setTimeout(() => consultarModelos(proveedor, claveNueva.trim()), 600);
  };

  const mover = (indice: number, direccion: -1 | 1) => {
    const destino = indice + direccion;
    if (destino < 0 || destino >= proveedores.length) return;
    const copia = [...proveedores];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    onProveedoresChange(copia);
  };

  const apagar = (proveedor: Proveedor) => {
    if (!window.confirm(`¿Apagar ${NOMBRE_PROVEEDOR[proveedor]} en esta herramienta? Se borrará su clave al guardar.`)) return;
    onProveedoresChange(proveedores.map((p) => (p.proveedor === proveedor ? proveedorVacio(proveedor) : p)));
  };

  const primeroEncendido = proveedores.find((p) => p.encendido)?.proveedor;
  const hayEncendidos = primeroEncendido !== undefined;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Proveedores</label>
        <p className="text-xs text-gray-500">
          El primero encendido es el que corre por defecto. Usa las flechas para ordenarlos.
        </p>
      </div>

      {!hayEncendidos && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Enciende al menos un proveedor con su clave y un modelo.
        </p>
      )}
      {errorGuardado && !errorGuardado.proveedor && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorGuardado.mensaje}</p>
      )}

      <Accordion type="single" collapsible value={abierto} onValueChange={setAbierto} className="space-y-2">
        {proveedores.map((estado, indice) => (
          <ProveedorAcordeon
            key={estado.proveedor}
            estado={estado}
            esPrimero={indice === 0}
            esUltimo={indice === proveedores.length - 1}
            esPorDefecto={estado.proveedor === primeroEncendido}
            sugerencias={sugerencias[estado.proveedor] ?? []}
            error={errorGuardado?.proveedor === estado.proveedor ? errorGuardado.mensaje : null}
            onCambiar={(cambios) => {
              if (cambios.claveNueva !== undefined) cambiarClave(estado.proveedor, cambios.claveNueva);
              else actualizar(estado.proveedor, cambios);
            }}
            onSubir={() => mover(indice, -1)}
            onBajar={() => mover(indice, 1)}
            onCambiarClave={() => actualizar(estado.proveedor, { reemplazandoClave: true, modelosDisponibles: null, errorModelos: null })}
            onApagar={() => apagar(estado.proveedor)}
          />
        ))}
      </Accordion>
    </div>
  );
}
```

- [ ] **Step 4: Ajustar `components/tools/edit-tool-dialog.tsx`**

Cambios concretos:

1. Importaciones: quitar `DEFAULT_REASONING_EFFORT`, `DEFAULT_VERBOSITY`, `getSupabaseClient` y `ApiKeyRequiredModal`; importar `ToolConfig, proveedoresDesdeConfiguracion, proveedorVacio, type ProveedorEnEdicion` desde `@/components/tools/tool-config` y `PROVEEDORES, type Proveedor` desde `@/lib/proveedores/tipos`.

2. `onSave` en `EditToolDialogProps` pasa a `onSave: (tool: Tool) => Promise<boolean>`.

3. Reemplazar los estados `toolModels`, `toolReasoningEffort` y `toolVerbosity` por:

```tsx
  const [proveedores, setProveedores] = useState<ProveedorEnEdicion[]>(PROVEEDORES.map(proveedorVacio));
  const [sugerencias, setSugerencias] = useState<Record<Proveedor, string[]>>({ OPENAI: [], ANTHROPIC: [], GOOGLE: [] });
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<{ mensaje: string; proveedor?: Proveedor } | null>(null);
  const [guardando, setGuardando] = useState(false);
```

4. En el `useEffect` que inicializa el formulario cuando cambia `tool`, quitar las líneas de `setToolReasoningEffort`, `setToolVerbosity`, el `console.log("Tool models"...)` y el bloque `if (tool.models ...)`. Agregar al final del efecto la carga de proveedores:

```tsx
      setErrorGuardado(null);
      if (tool.identity && isOpen) {
        setCargandoProveedores(true);
        fetch(`/api/herramientas/${tool.identity}/proveedores`, { cache: "no-store" })
          .then(async (r) => {
            const datos = await r.json().catch(() => null);
            if (!r.ok) throw new Error(datos?.error ?? "No se pudo cargar la configuración");
            setProveedores(proveedoresDesdeConfiguracion(datos.proveedores ?? []));
            setSugerencias(datos.sugerencias ?? { OPENAI: [], ANTHROPIC: [], GOOGLE: [] });
          })
          .catch((e: Error) => setErrorGuardado({ mensaje: e.message }))
          .finally(() => setCargandoProveedores(false));
      }
```

y agregar `isOpen` a las dependencias del efecto: `}, [tool, isOpen]);`.

5. En el efecto de "Track changes" quitar `toolTemperature`/`toolTopP` sólo si el linter lo pide; no tocar lo demás.

6. Reemplazar `handleSave` por:

```tsx
  const encendidos = proveedores.filter((p) => p.encendido);
  const puedeGuardar = !guardando && !cargandoProveedores && encendidos.length > 0 && encendidos.every((p) => p.modelo.trim() !== "");

  const handleSave = async () => {
    if (!tool || !puedeGuardar) return;
    setSaveError("");
    setErrorGuardado(null);
    setGuardando(true);
    try {
      // Primero el prompt y el formato en `tools`, como siempre; después los
      // proveedores en su tabla. Si lo segundo falla, lo primero queda guardado
      // y el diálogo lo dice.
      const promptGuardado = await onSave({
        ...tool,
        prompts,
        schema: toolSchema,
        temperature: toolTemperature as number,
        topP: toolTopP,
      });
      if (!promptGuardado) {
        setSaveError("No se pudo guardar el prompt. Los proveedores no se tocaron.");
        return;
      }

      const respuesta = await fetch(`/api/herramientas/${tool.identity}/proveedores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedores: encendidos.map((p) => ({
            proveedor: p.proveedor,
            modelo: p.modelo.trim(),
            reasoningEffort: p.reasoningEffort,
            verbosity: p.proveedor === "OPENAI" ? p.verbosity : null,
            ...(p.claveNueva.trim() ? { apiKey: p.claveNueva.trim() } : { conservarClave: true }),
          })),
        }),
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        setErrorGuardado({ mensaje: datos?.error ?? "No se pudieron guardar los proveedores", proveedor: datos?.proveedor });
        setSaveError("El prompt se guardó, pero los proveedores no. Revisa el error en el proveedor marcado.");
        return;
      }
      onOpenChange(false);
    } finally {
      setGuardando(false);
    }
  };
```

7. Reemplazar el uso de `<ToolConfig ... />` en la columna derecha por:

```tsx
              {cargandoProveedores ? (
                <p className="text-sm text-gray-500">Cargando proveedores…</p>
              ) : (
                <ToolConfig
                  herramienta={tool.identity ?? ""}
                  proveedores={proveedores}
                  onProveedoresChange={setProveedores}
                  sugerencias={sugerencias}
                  errorGuardado={errorGuardado}
                />
              )}
```

8. El botón de guardar pasa a `disabled={!puedeGuardar}` con la misma clase condicional, y su texto a `{guardando ? "Guardando…" : tool.isDefault ? "Crear copia personalizada" : "Guardar cambios"}`.

- [ ] **Step 5: Tarjetas con proveedores**

En `components/tools/tool-card.tsx`, reemplazar el bloque `<div className="flex flex-wrap gap-1 mb-3">…</div>` de las etiquetas por:

```tsx
        <div className="flex flex-wrap gap-1 mb-3">
          {(tool.proveedores ?? []).length === 0 ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Sin proveedor</span>
          ) : (
            tool.proveedores!.map((p, i) => (
              <span
                key={p.proveedor}
                className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                title={i === 0 ? "Por defecto" : undefined}
              >
                {NOMBRE_PROVEEDOR[p.proveedor]} · {p.modelo}
              </span>
            ))
          )}
        </div>
```

e importar `NOMBRE_PROVEEDOR` desde `@/lib/proveedores/tipos`. Quitar la prop `tagColors` de `ToolCardProps` y de la firma. Hacer lo mismo en `components/tools/tool-list-item.tsx` (el bloque de etiquetas de las líneas 46-60, mostrando sólo el primer proveedor y `+N` si hay más).

- [ ] **Step 6: Página de Herramientas**

En `app/dashboard/configuracion/herramientas/page.tsx`:

1. Quitar el objeto `tagColors` y las props `tagColors={tagColors}` de `ToolCard` y `ToolListItem`.
2. En los dos `processedTools.push({...})` y en las dos entradas sintéticas (Quién es quién y Preguntas a SillaIA) quitar los campos `reasoningEffort`, `verbosity` y `models`.
3. Después de `setTools(toolsFiltradas)` agregar la carga de proveedores para las tarjetas:

```tsx
      const respuesta = await fetch("/api/herramientas/proveedores-activos", { cache: "no-store" })
      const datos = await respuesta.json().catch(() => null)
      const porHerramienta: Record<string, ProveedorActivo[]> = respuesta.ok ? datos?.porHerramienta ?? {} : {}
      setTools(toolsFiltradas.map((t) => ({ ...t, proveedores: porHerramienta[t.identity ?? ""] ?? [] })))
```

(reemplaza al `setTools(toolsFiltradas)` anterior) e importar `type ProveedorActivo` desde `@/lib/proveedores/tipos`.

4. `handleSaveTool` pasa a devolver `Promise<boolean>`: en los dos `insert`/`update` quitar `reasoning_effort`, `verbosity` y `models`; al final del `try` devolver `true` en vez de cerrar el modal; en el `catch` devolver `false`. Quitar la línea `setIsEditModalOpen(false)` del final (el diálogo se cierra solo cuando todo se guardó). El `fetchTools()` de refresco se llama antes del `return true`.

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit 2>&1 | grep -E "components/tools|herramientas/page|types/tool"` → sin salida.
Run: `ESLINT_USE_FLAT_CONFIG=false npx eslint -c .eslintrc.json components/tools/*.tsx app/dashboard/configuracion/herramientas/page.tsx types/tool.ts` → sin problemas nuevos respecto a HEAD (comparar con `git stash` como en las tareas anteriores).

- [ ] **Step 8: Commit**

```bash
git add types/tool.ts components/tools app/dashboard/configuracion/herramientas/page.tsx
git commit -m "feat(herramientas): acordeón por proveedor con clave, modelo, esfuerzo y orden

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Corrector

**Files:**
- Modify: `app/dashboard/corrector/page.tsx`, `actions/analyze-text.ts`, `lib/proofreader/correccion-por-frase.ts`

**Interfaces:**
- Consumes: `useProveedoresActivos` (Tarea 7), `obtenerProveedorDeHerramienta`, `ProveedorNoConfiguradoError` (Tarea 4), `crearModeloConfigurado` (Tarea 5).
- `analyzeText(text, selectedModel: { model: string; provider: string })` conserva su firma; el modelo viene de la configuración, el cliente sólo decide el proveedor.

- [ ] **Step 1: Página del Corrector**

En `app/dashboard/corrector/page.tsx`:

1. Importar `useProveedoresActivos` desde `@/hooks/use-proveedores-activos`, `NOMBRE_PROVEEDOR` desde `@/lib/proveedores/tipos` y `useAuth` desde `@/hooks/use-auth` si no está. Quitar la importación de `MODELS` de `@/lib/utils` y la de `getSupabaseClient` si ya no se usa en otra parte del archivo (comprobar con grep).
2. Quitar los estados `availableModels`, `modelProviderMap` y `apiKeyStatus`, y la función `checkApiKeyExists` completa junto con el `useEffect` que la llama.
3. Agregar tras los `useState` restantes:

```tsx
  const { profile } = useAuth();
  const { proveedores, cargando: cargandoProveedores } = useProveedoresActivos("proofreader");
  const models = proveedores.map((p) => ({ model: p.modelo, provider: p.proveedor }));
  const esAdmin = profile?.role === "OWNER" || profile?.role === "ADMIN";

  useEffect(() => {
    if (models.length > 0 && !selectedModel.model) {
      setSelectedModel(models[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedores]);
```

Si la página tenía un estado `models` con `setModels`, quitarlo: ahora `models` es derivado.

4. El modal: `<ApiKeyRequiredModal isLoading={cargandoProveedores} isOpen={!cargandoProveedores && proveedores.length === 0} isAdmin={esAdmin} herramienta="el Corrector" />`.
5. En el `Select` de modelo: `disabled={models.length === 0 || cargandoProveedores}`, placeholder `cargandoProveedores ? "Cargando..." : "Seleccionar proveedor"`, y en cada `SelectItem` reemplazar `{MODELS[modelInfo.model as keyof typeof MODELS]}` por `{modelInfo.model}` y `{getProviderDisplayName(modelInfo.provider)}` por `{NOMBRE_PROVEEDOR[modelInfo.provider as keyof typeof NOMBRE_PROVEEDOR] ?? modelInfo.provider}`. Si `getProviderDisplayName` queda sin uso, borrarla.

- [ ] **Step 2: Acción `analyzeText`**

En `actions/analyze-text.ts`:

1. Importar `obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError` desde `@/lib/proveedores/configuracion` y `crearModeloConfigurado` desde `@/lib/proveedores/opciones-modelo`. Quitar las importaciones de `createOpenAI`, `createAnthropic` y `createGoogleGenerativeAI` si quedan sin uso al terminar.
2. Reemplazar el bloque "2. Obtener la API key para el proveedor seleccionado" (la consulta a `api_key_table` y sus dos comprobaciones de error, hasta donde se define `const apiKey = apiKeyData.key`) por:

```ts
    // 2. Clave, modelo y ajustes del proveedor elegido, desde Ajustes > Herramientas
    let configuracion;
    try {
      configuracion = await obtenerProveedorDeHerramienta(organizationId, "proofreader", selectedModel.provider);
    } catch (error) {
      const mensaje = error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor";
      await debugLogger.logApiKey("API key not found", "not_found", { provider: selectedModel.provider as any, status: "not_found", hasValue: false }, { message: mensaje, code: "API_KEY_NOT_FOUND" });
      await debugLogger.finalize("failed", { error: { message: mensaje, code: "API_KEY_NOT_FOUND" } });
      throw new Error(mensaje);
    }
    const apiKey = configuracion.apiKey;
    // El modelo lo decide la configuración, no el cliente.
    selectedModel = { provider: configuracion.proveedor, model: configuracion.modelo };
```

Para que `selectedModel` se pueda reasignar, en la firma cambiar el parámetro a `selectedModelElegido: { model: string; provider: string }` y agregar como primera línea del cuerpo `let selectedModel = selectedModelElegido;`.

3. Reemplazar el bloque que busca `claveCorrector` en `api_key_table` (desde `const { data: clavesActivas }` hasta el `console.error(...)` inclusive) por:

```ts
    // El paso por frase usa el modelo fijo de OpenAI si el Corrector tiene
    // OpenAI encendido; si no, el proveedor elegido.
    let corrector: { modelo: { provider: string; model: string }; apiKey: string };
    try {
      const openai = await obtenerProveedorDeHerramienta(organizationId, "proofreader", "OPENAI");
      corrector = { modelo: MODELO_CORRECTOR, apiKey: openai.apiKey };
    } catch {
      corrector = { modelo: selectedModel, apiKey };
      debugLogger.warn(`Sin OpenAI en el Corrector: las frases se corrigen con ${selectedModel.model}`);
    }
```

4. En el `switch (selectedModel.provider.toLowerCase())` de la llamada principal, reemplazar los tres `case` por una sola llamada:

```ts
  const { model, providerOptions } = crearModeloConfigurado(configuracion);
  result = await generateObject({
    model,
    schema: ProofreaderResponseSchema,
    prompt: combinedPrompt,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions,
  });
```

conservando el `default` sólo si el linter exige agotar el switch; si no, borrar el switch entero. `configuracion` tiene que estar en el ámbito de esa función: si la llamada está en una función auxiliar que recibe `apiKey`, pasarle `configuracion` en su lugar y ajustar la firma.

- [ ] **Step 3: Corrección por frase**

En `lib/proofreader/correccion-por-frase.ts`, `opcionesDeProveedor` (línea ~1031) pasa a recibir la configuración. Como aquí el modelo es fijo (`MODELO_CORRECTOR`, OpenAI) o el elegido, y el esfuerzo del Corrector por proveedor está en la tabla, cambiar la firma de `analizarPorFrase` para que `opciones` acepte además `reasoningEffort?: string; verbosity?: string | null`, y en `opcionesDeProveedor` usar:

```ts
function opcionesDeProveedor(provider: string, reasoningEffort = "medium", verbosity: string | null = "medium") {
  if (provider.toLowerCase() !== "openai") return undefined;

  return {
    openai: {
      reasoningEffort,
      textVerbosity: verbosity ?? "medium",
      store: false,
      ...cacheOpenAI("corrector"),
    },
  };
}
```

En `correccion-por-frase.ts`, en el lugar donde se llama `opcionesDeProveedor(modeloElegido.provider)` (buscar con `grep -n "opcionesDeProveedor(" lib/proofreader/correccion-por-frase.ts`), pasar `opcionesDeProveedor(opciones.modeloElegido.provider, opciones.reasoningEffort, opciones.verbosity)`.

En `analyze-text.ts`, al llamar `analizarPorFrase(text, { modeloElegido: corrector.modelo, apiKey: corrector.apiKey, ... })`, agregar `reasoningEffort: configuracion.reasoningEffort, verbosity: configuracion.verbosity` cuando `corrector.modelo === selectedModel`; cuando es `MODELO_CORRECTOR` dejar los valores por defecto (`medium`), porque ese modelo es rápido a propósito.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit 2>&1 | grep -E "corrector|analyze-text|correccion-por-frase"` → sin salida.
Run: `grep -n "api_key_table" actions/analyze-text.ts app/dashboard/corrector/page.tsx` → sin salida.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/corrector/page.tsx actions/analyze-text.ts lib/proofreader/correccion-por-frase.ts
git commit -m "feat(corrector): claves y modelo desde la configuración de la herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Hilos

**Files:**
- Modify: `app/dashboard/generador-hilos/page.tsx`, `actions/generate-threads/index.ts`

- [ ] **Step 1: Página de Hilos**

En `app/dashboard/generador-hilos/page.tsx`:

1. Importar `useProveedoresActivos` desde `@/hooks/use-proveedores-activos` y `NOMBRE_PROVEEDOR` desde `@/lib/proveedores/tipos`. Quitar la importación de `MODELS` de `@/lib/utils`, y la de `getSupabaseClient` si queda sin uso (comprobar con grep). La página ya tiene `profile` de `useAuth`.
2. Quitar los estados `availableModels`, `modelProviderMap`, `apiKeyStatus` y `models` (con su `setModels`), y la función `checkApiKeyExists` completa junto con el `useEffect` que la llama.
3. Agregar tras los `useState` restantes:

```tsx
  const { proveedores, cargando: cargandoProveedores } = useProveedoresActivos("threads_generator");
  const models = proveedores.map((p) => ({ model: p.modelo, provider: p.proveedor }));
  const esAdmin = profile?.role === "OWNER" || profile?.role === "ADMIN";

  useEffect(() => {
    if (models.length > 0 && !selectedModel.model) {
      setSelectedModel(models[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedores]);
```

4. El modal (línea ~312): `<ApiKeyRequiredModal isLoading={cargandoProveedores} isOpen={!cargandoProveedores && proveedores.length === 0} isAdmin={esAdmin} herramienta="Hilos" />`.
5. En el `Select` de modelo (líneas ~335-370): `disabled={models.length === 0 || cargandoProveedores}`, placeholder `cargandoProveedores ? "Cargando..." : "Seleccionar proveedor"`, y en cada `SelectItem` reemplazar `{MODELS[modelInfo.model as keyof typeof MODELS]}` por `{modelInfo.model}` y `{getProviderDisplayName(modelInfo.provider)}` por `{NOMBRE_PROVEEDOR[modelInfo.provider as keyof typeof NOMBRE_PROVEEDOR] ?? modelInfo.provider}`. Si `getProviderDisplayName` queda sin uso, borrarla.

- [ ] **Step 2: Acción `threadsGenerator`**

En `actions/generate-threads/index.ts`:

1. Importar `obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError` y `crearModeloConfigurado`.
2. Reemplazar el bloque "2. Obtener la API key para el proveedor seleccionado" (consulta a `api_key_table` y su `return { success: false, ... }`) por:

```ts
    // 2. Clave, modelo y ajustes del proveedor elegido, desde Ajustes > Herramientas
    let configuracion;
    try {
      configuracion = await obtenerProveedorDeHerramienta(organizationId, "threads_generator", selectedModel.provider);
    } catch (error) {
      const mensaje = error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor";
      await debugLogger.logApiKey("API key not found", "not_found", { provider: selectedModel.provider as any, status: "not_found", hasValue: false }, { message: mensaje, code: "API_KEY_NOT_FOUND" });
      await debugLogger.finalize("failed", { error: { message: mensaje, code: "API_KEY_NOT_FOUND" } });
      return { success: false, error: mensaje, threads: [], logs: debugLogger.getSerializableLogs() };
    }
    selectedModel = { provider: configuracion.proveedor, model: configuracion.modelo };
```

(convertir el parámetro `selectedModel` en `let` con el mismo truco de la Tarea 9: renombrar el parámetro y declarar `let selectedModel = ...` al inicio). Toda referencia posterior a `apiKey` pasa a `configuracion.apiKey`.

3. Reemplazar el `switch (selectedModel.provider.toLowerCase())` de las líneas 240-285 por:

```ts
    const { model, providerOptions } = crearModeloConfigurado(configuracion);
    result = await generateObject({
      model,
      prompt: combinedPrompt,
      schema: ThreadsSchema,
      providerOptions,
      ...(configuracion.proveedor === "GOOGLE" ? { temperature, topP: top_p } : {}),
    });
```

4. En analytics, `modelo_utilizado` sigue como `"provider:model"` con los valores de `selectedModel` ya reasignado.

- [ ] **Step 3: Verificar y commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "generador-hilos|generate-threads"` → sin salida.

```bash
git add app/dashboard/generador-hilos/page.tsx actions/generate-threads/index.ts
git commit -m "feat(hilos): claves y modelo desde la configuración de la herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Resúmenes

**Files:**
- Modify: `app/dashboard/generador-resumen/page.tsx`, `app/api/tools/generate-resume/route.ts`

- [ ] **Step 1: Página de Resúmenes**

En `app/dashboard/generador-resumen/page.tsx`:

1. Importar `useProveedoresActivos` desde `@/hooks/use-proveedores-activos`, `NOMBRE_PROVEEDOR` desde `@/lib/proveedores/tipos` y `useAuth` desde `@/hooks/use-auth` si no está. Quitar la importación de `MODELS` de `@/lib/utils`, y la de `getSupabaseClient` si queda sin uso (comprobar con grep).
2. Quitar los estados `availableModels`, `modelProviderMap`, `apiKeyStatus` y `models` (con su `setModels`), y la función `checkApiKeyExists` completa junto con el `useEffect` que la llama.
3. Agregar tras los `useState` restantes:

```tsx
  const { profile } = useAuth();
  const { proveedores, cargando: cargandoProveedores } = useProveedoresActivos("resume");
  const models = proveedores.map((p) => ({ model: p.modelo, provider: p.proveedor }));
  const esAdmin = profile?.role === "OWNER" || profile?.role === "ADMIN";

  useEffect(() => {
    if (models.length > 0 && !selectedModel.model) {
      setSelectedModel(models[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedores]);
```

4. El modal (línea ~561): `<ApiKeyRequiredModal isLoading={cargandoProveedores} isOpen={!cargandoProveedores && proveedores.length === 0} isAdmin={esAdmin} herramienta="Resúmenes" />`.
5. En el `Select` de modelo (líneas ~725-760): `disabled={models.length === 0 || cargandoProveedores}`, placeholder `cargandoProveedores ? "Cargando..." : "Seleccionar proveedor"`, y en cada `SelectItem` reemplazar `{MODELS[modelInfo.model as keyof typeof MODELS]}` por `{modelInfo.model}` y `{getProviderDisplayName(modelInfo.provider)}` por `{NOMBRE_PROVEEDOR[modelInfo.provider as keyof typeof NOMBRE_PROVEEDOR] ?? modelInfo.provider}`. Si `getProviderDisplayName` queda sin uso, borrarla.

- [ ] **Step 2: Ruta `generate-resume`**

En `app/api/tools/generate-resume/route.ts`:

1. Importar `obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError, type ProveedorEnUso` y `crearModeloConfigurado`.
2. Reemplazar la función `getApiKey` completa por:

```ts
async function obtenerConfiguracion(
  organizationId: string,
  provider: string,
  debugLogger: DebugLogger
): Promise<ProveedorEnUso> {
  try {
    return await obtenerProveedorDeHerramienta(organizationId, "resume", provider);
  } catch (error) {
    const mensaje = error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor";
    await debugLogger.logApiKey("API key not found", "not_found", { provider: provider.toLowerCase() as any, status: "not_found", hasValue: false }, { message: mensaje, code: "API_KEY_NOT_FOUND" });
    await debugLogger.finalize("failed", { error: { message: mensaje, code: "API_KEY_NOT_FOUND" } });
    throw new Error(mensaje);
  }
}
```

y en el `POST`, la línea `const apiKey = await getApiKey(organizationId, requestData.selectedModel.provider, debugLogger);` pasa a:

```ts
    const configuracion = await obtenerConfiguracion(organizationId, requestData.selectedModel.provider, debugLogger);
    requestData.selectedModel = { provider: configuracion.proveedor, model: configuracion.modelo };
    const apiKey = configuracion.apiKey;
```

3. `selectImportantNews` sigue recibiendo `selectedModel` y `apiKey`: el modelo pequeño se arma como hoy con `MINI_MODELS[selectedModel.provider.toUpperCase()]`, y su `switch` de las líneas 343-386 se reemplaza por:

```ts
    const { model: modelo } = crearModeloConfigurado({ ...configuracionMini, modelo: model });
    result = await generateObject({ model: modelo, prompt, schema, maxRetries: 5 });
```

donde `configuracionMini: ProveedorEnUso = { proveedor: selectedModel.provider.toUpperCase() as Proveedor, modelo: model, apiKey, reasoningEffort: "low", verbosity: "low" }` se declara justo antes (la selección es una tarea corta: esfuerzo bajo a propósito). Importar `type Proveedor` desde `@/lib/proveedores/tipos`.

4. La función del resumen final (líneas 436-470) pasa a recibir `configuracion: ProveedorEnUso` en vez de `modelConfig` y `apiKey`, y su `switch` se reemplaza por:

```ts
  const { model, providerOptions } = crearModeloConfigurado(configuracion);
  return generateText({
    model,
    prompt: combinedPrompt,
    providerOptions,
    ...(configuracion.proveedor === "GOOGLE" ? { temperature, topP: top_p } : {}),
  });
```

Ajustar las llamadas de las líneas ~610, 672, 725, 780, 853 y 912 para pasar `configuracion` donde antes pasaban `requestData.selectedModel` y `apiKey` al resumen final. Las llamadas a `selectImportantNews` no cambian.

- [ ] **Step 3: Verificar y commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "generador-resumen|generate-resume"` → sin salida.

```bash
git add app/dashboard/generador-resumen/page.tsx app/api/tools/generate-resume/route.ts
git commit -m "feat(resumenes): claves y modelo desde la configuración de la herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Detector

**Files:**
- Modify: `app/dashboard/detector-de-mentiras/components/ModelSelectionSection.tsx`, `app/dashboard/detector-de-mentiras/page.tsx`, `app/api/detector/route.ts`
- Delete: `app/dashboard/detector-de-mentiras/hooks/useApiKeyStatus.ts`

- [ ] **Step 1: Sección de modelos**

En `ModelSelectionSection.tsx`:

1. Quitar las importaciones de `getSupabaseClient`, `toast`, `MODELS` y `useAuth`. Importar `useProveedoresActivos` y `NOMBRE_PROVEEDOR`.
2. Reemplazar los estados `availableModels`, `isLoading`, la función `loadAvailableModels` y su `useEffect` por:

```tsx
  const { proveedores, cargando: isLoading } = useProveedoresActivos("detector");
  const availableModels: ModelInfo[] = proveedores.map((p) => ({ provider: p.proveedor.toLowerCase(), model: p.modelo }));

  useEffect(() => {
    if (availableModels.length > 0 && !getValues("selectedModel")?.model) {
      setValue("selectedModel", availableModels[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedores]);
```

3. Borrar `getProviderDisplayName` y usar `NOMBRE_PROVEEDOR[modelInfo.provider.toUpperCase() as keyof typeof NOMBRE_PROVEEDOR]` en los dos `SelectItem`; reemplazar `{MODELS[modelInfo.model as keyof typeof MODELS]}` por `{modelInfo.model}`.
4. En el selector de comparación, filtrar los que no son el principal:

```tsx
                    {availableModels
                      .filter((m) => m.provider !== getValues("selectedModel")?.provider)
                      .map((modelInfo) => (
```

- [ ] **Step 2: Página del Detector**

En `page.tsx`, reemplazar `import { useApiKeyStatus } from "./hooks/useApiKeyStatus";` por `import { useProveedoresActivos } from "@/hooks/use-proveedores-activos"; import { useAuth } from "@/hooks/use-auth";` y la línea `const apiKeyStatus = useApiKeyStatus();` por:

```tsx
  const { profile } = useAuth();
  const { proveedores, cargando } = useProveedoresActivos("detector");
  const apiKeyStatus = {
    isLoading: cargando,
    hasApiKey: proveedores.length > 0,
    isAdmin: profile?.role === "OWNER" || profile?.role === "ADMIN",
  };
```

y en `<ApiKeyRequiredModal isOpen={true} isAdmin={apiKeyStatus.isAdmin} />` agregar `herramienta="el Detector"`. Borrar `app/dashboard/detector-de-mentiras/hooks/useApiKeyStatus.ts`.

- [ ] **Step 3: Ruta del Detector**

En `app/api/detector/route.ts`:

1. Importar `obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError, type ProveedorEnUso` y `crearModeloConfigurado`. Quitar `createOpenAI`, `createAnthropic`, `createGoogleGenerativeAI` si quedan sin uso.
2. Borrar `interface ApiKeyResult`, los campos `reasoning_effort`, `verbosity` y `models` de `interface ToolConfig`, las constantes `DEFAULT_REASONING_EFFORT` y `DEFAULT_VERBOSITY`, y la función `anthropicEffort`.
3. Reemplazar `getApiKey` por:

```ts
async function obtenerConfiguracion(
  organizationId: string,
  provider: string,
  debugLogger: DebugLogger
): Promise<ProveedorEnUso> {
  await debugLogger.logApiKey("Fetching API key", "fetching", { provider: provider.toLowerCase() as any, status: "fetching", hasValue: false });
  try {
    return await obtenerProveedorDeHerramienta(organizationId, "detector", provider);
  } catch (error) {
    const mensaje = error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor";
    await debugLogger.logApiKey("API key not found", "not_found", { provider: provider.toLowerCase() as any, status: "not_found", hasValue: false }, { message: mensaje, code: "API_KEY_NOT_FOUND" });
    await debugLogger.finalize("failed", { error: { message: mensaje, code: "API_KEY_NOT_FOUND" } });
    throw new Error(mensaje);
  }
}
```

4. La función que genera el análisis (la del `switch` de las líneas 455-535) pasa a recibir `configuracion: ProveedorEnUso` en lugar de `modelConfig` y `apiKey`. Borrar el cálculo de `modelEntry`, `reasoningEffort` y `verbosity`, y reemplazar el `switch` por:

```ts
  const { model, providerOptions } = crearModeloConfigurado(configuracion);
  return generateText({
    model,
    system: systemPrompt,
    messages,
    providerOptions,
    ...(configuracion.proveedor === "GOOGLE" ? { temperature, topP: top_p } : {}),
  });
```

`medirAnalisis` recibe `configuracion` y reporta `proveedor: configuracion.proveedor.toLowerCase()` y `modelo: configuracion.modelo` donde antes usaba `modelConfig`.

5. En el `POST`: en modo comparación, `const apiKey1 = await getApiKey(...)` y `apiKey2` pasan a `const config1 = await obtenerConfiguracion(organizationId, validatedData.selectedModel.provider, debugLogger)` y `config2` con `model_to_compare_1!.provider`, y las llamadas a `medirAnalisis` reciben `config1`/`config2` en lugar de `validatedData.selectedModel`/`apiKey1.key`. En modo simple, igual con una sola configuración.

- [ ] **Step 4: Verificar y commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "detector"` → sin salida.
Run: `grep -rn "api_key_table\|useApiKeyStatus" app/dashboard/detector-de-mentiras app/api/detector` → sin salida.

```bash
git add app/dashboard/detector-de-mentiras app/api/detector/route.ts
git rm app/dashboard/detector-de-mentiras/hooks/useApiKeyStatus.ts
git commit -m "feat(detector): proveedores de la herramienta y esfuerzo por proveedor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Preguntas a SillaIA

**Files:**
- Modify: `app/api/preguntas-chatbot/route.ts`, `lib/preguntas-chatbot/agente.ts`, `lib/organizaciones/prompt-herramienta.ts`

- [ ] **Step 1: Agente**

En `lib/preguntas-chatbot/agente.ts`:

1. Quitar las importaciones de `createAnthropic`, `createGoogleGenerativeAI`, `createOpenAI`, `DEFAULT_MODELS` y la función `crearModelo`. Quitar `MODELO_PREGUNTAS_CHATBOT`, `PROVEEDOR_PREGUNTAS_CHATBOT`, `PROVEEDORES_SOPORTADOS`, `ProveedorSoportado` y `esProveedorSoportado` junto con su comentario: el proveedor ya no se elige aquí, viene de Ajustes.
2. Importar `crearModeloConfigurado` y `type ProveedorEnUso`.
3. `crearAgentePreguntasChatbot` pasa a:

```ts
export function crearAgentePreguntasChatbot(opts: {
  configuracion: ProveedorEnUso;
  registrarConsulta: RegistrarConsulta;
  /** Pestañas del prompt guardadas en Ajustes > Herramientas; ver `instrucciones` */
  pestanasPrompt?: PestanaPrompt[];
}) {
  const { model, providerOptions } = crearModeloConfigurado(opts.configuracion);
  return new ToolLoopAgent({
    model,
    instructions: instrucciones(opts.pestanasPrompt),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions,
    tools: {
      consultarPreguntasChatbot: crearHerramientaConsulta(opts.registrarConsulta),
      reportarResultado: herramientaReportarResultado,
    },
    toolChoice: "required",
    stopWhen: [hasToolCall("reportarResultado"), stepCountIs(12)],
  });
}
```

Si `ToolLoopAgent` no acepta `providerOptions` en su constructor en la versión instalada (tsc lo dirá), pasarlo en la llamada a `createAgentUIStreamResponse` de la ruta como opción de `agent.stream`/`generate` según la firma; verificar con `grep -n "providerOptions" node_modules/ai/dist/index.d.ts | head`.

- [ ] **Step 2: Ruta**

En `app/api/preguntas-chatbot/route.ts`:

1. Quitar `obtenerApiKey`, `NOMBRE_PROVEEDOR`, `COLUMNA_PROVEEDOR` y las importaciones que quedan sin uso (`esProveedorSoportado`, `MODELO_PREGUNTAS_CHATBOT`, `PROVEEDOR_PREGUNTAS_CHATBOT`, `ProveedorSoportado`, `leerConfiguracionDeOrganizacion`). Importar `leerPromptDeOrganizacionCompleto` (ver Step 3), `listarProveedoresActivos, obtenerProveedorDeHerramienta, ProveedorNoConfiguradoError` y `normalizarProveedor`.
2. Reemplazar desde `// Prompt y modelo que la organización guardó` hasta `const apiKey = credencial.key;` por:

```ts
  // Sin selector en la interfaz: corre con el primer proveedor del orden de
  // Ajustes > Herramientas, salvo que el cuerpo pida otro que también esté encendido.
  const activos = await listarProveedoresActivos(organizationId, "preguntas-chatbot");
  if (activos.length === 0) {
    return jsonError("Preguntas a SillaIA no tiene ningún proveedor configurado. Configúralo en Ajustes > Herramientas.", 400);
  }
  const pedido = normalizarProveedor(body?.proveedor);
  const proveedorElegido = pedido && activos.some((a) => a.proveedor === pedido) ? pedido : activos[0].proveedor;

  let configuracion;
  try {
    configuracion = await obtenerProveedorDeHerramienta(organizationId, "preguntas-chatbot", proveedorElegido);
  } catch (error) {
    return jsonError(error instanceof ProveedorNoConfiguradoError ? error.message : "No se pudo obtener la configuración del proveedor", 400);
  }
  const proveedor = configuracion.proveedor.toLowerCase();
  const modelo = configuracion.modelo;
  const pestanasPrompt = await leerPromptDeOrganizacionCompleto(await getSupabaseRouteHandler(), organizationId, "preguntas-chatbot");
```

3. La llamada `crearAgentePreguntasChatbot({ apiKey, proveedor, modelo, registrarConsulta, pestanasPrompt: configuracion.prompts })` pasa a `crearAgentePreguntasChatbot({ configuracion, registrarConsulta: (info) => consultas.push(info), pestanasPrompt })`. `calcularCosto(proveedor, modelo, ...)` y `modelo_utilizado: modelo` siguen igual con las variables de arriba.

- [ ] **Step 3: Helper de prompts**

En `lib/organizaciones/prompt-herramienta.ts` quitar `ModeloOrganizacion`, `modelos` de `ConfiguracionHerramientaOrganizacion`, `normalizarModelos` y el `models` del `select`; renombrar `leerConfiguracionDeOrganizacion` a `leerPromptDeOrganizacionCompleto` devolviendo directamente `PestanaPromptOrganizacion[]`. `leerPromptDeOrganizacion` (primer prompt, para Quién es quién) se queda y llama a la nueva.

- [ ] **Step 4: Verificar y commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "preguntas-chatbot|prompt-herramienta|perfil/route"` → sin salida.

```bash
git add app/api/preguntas-chatbot/route.ts lib/preguntas-chatbot/agente.ts lib/organizaciones/prompt-herramienta.ts
git commit -m "feat(preguntas-chatbot): proveedor y modelo desde la configuración de la herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Quién es quién (ruta interna de claves)

**Files:**
- Modify: `app/api/internal/llm-keys/route.ts`

- [ ] **Step 1: Leer de la tabla nueva con la misma forma de respuesta**

1. Reemplazar `type Provider` y `const PROVIDERS` por `import { normalizarProveedor, PROVEEDORES } from "@/lib/proveedores/tipos";` y `import { getSupabaseAdmin } from "@/lib/supabase/admin";`. Quitar `createClient` y `Database` si quedan sin uso.
2. La validación del proveedor:

```ts
    const provider = body.provider === undefined || body.provider === null ? null : normalizarProveedor(body.provider)
    if (body.provider !== undefined && body.provider !== null && !provider) {
      return NextResponse.json(
        { error: `Proveedor no válido. Valores permitidos: ${PROVEEDORES.join(", ")}` },
        { status: 400, headers: NO_STORE_HEADERS },
      )
    }
```

3. `const supabaseAdmin = createClient<Database>(...)` pasa a `const supabaseAdmin = getSupabaseAdmin()`.
4. Reemplazar la consulta a `api_key_table` (desde `let query = supabaseAdmin.from("api_key_table")` hasta el `order(...)`) por:

```ts
    // Las claves de Quién es quién: el servicio externo las pide con el token
    // de organización. La respuesta conserva la forma de api_key_table para no
    // tocar el servicio externo; `includeInactive` ya no aplica porque un
    // proveedor sin clave simplemente no tiene fila.
    let query = supabaseAdmin
      .from("herramienta_proveedores")
      .select("proveedor, api_key, modelo, created_at, updated_at")
      .eq("organization_id", organizationId)
      .eq("herramienta", "quien-es-quien")
      .order("posicion", { ascending: true })

    if (provider) {
      query = query.eq("proveedor", provider)
    }

    const { data: filas, error } = await query
    const apiKeys = (filas ?? []).map((f) => ({
      id: `quien-es-quien:${f.proveedor}`,
      provider: f.proveedor,
      key: f.api_key,
      models: [f.modelo],
      id_channel: null,
      status: "ACTIVE",
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }))
```

y ajustar el `console.info` y el `return` para usar `apiKeys` (ya no es nullable). Actualizar el comentario de cabecera de la ruta: dice "las API keys de LLM de una organización", debe decir "las claves de Quién es quién de una organización, configuradas en Ajustes > Herramientas".

- [ ] **Step 2: Documentación y verificación**

En `llm-keys-api.md`, en la sección que describe la respuesta, agregar una línea: "Desde el 29 de septiembre de 2026 las claves son las de la herramienta Quién es quién en Ajustes > Herramientas; `models` trae el modelo configurado y `includeInactive` no tiene efecto."

Run: `npx tsc --noEmit 2>&1 | grep "llm-keys"` → sin salida.

- [ ] **Step 3: Commit**

```bash
git add app/api/internal/llm-keys/route.ts llm-keys-api.md
git commit -m "feat(quien-es-quien): la ruta interna de claves lee la configuración de la herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 15: Quitar Integraciones y la clave en la creación de organizaciones

**Files:**
- Delete: `app/dashboard/configuracion/integraciones/`, `app/dashboard/configuracion/documentacion/configuraciones/integraciones/`, `app/api/integrations/`, `lib/services/api-key-service.ts`, `components/modals/add-api-key-modal.tsx`, `components/modals/toggle-api-key-status-modal.tsx`
- Modify: `app/dashboard/configuracion/layout.tsx`, `app/api/organization/create/route.ts`, `app/dashboard/admin/organizaciones/page.tsx`, `lib/utils.ts`

- [ ] **Step 1: Borrar archivos**

```bash
git rm -r app/dashboard/configuracion/integraciones app/dashboard/configuracion/documentacion/configuraciones/integraciones app/api/integrations lib/services/api-key-service.ts components/modals/add-api-key-modal.tsx components/modals/toggle-api-key-status-modal.tsx
```

Luego `grep -rn "api-key-service\|add-api-key-modal\|toggle-api-key-status-modal\|/api/integrations" app components lib hooks --include=*.ts --include=*.tsx` y quitar cualquier importación o enlace que quede.

- [ ] **Step 2: Menú de Ajustes**

En `app/dashboard/configuracion/layout.tsx` borrar el `SettingsMenuItem` de "Integrations" (líneas 350-356) y el `DocNavItem` de "Integraciones" en la documentación (líneas 121-127). Quitar las importaciones de iconos que queden sin uso (`Sparkles`, `Plug`) si eslint lo marca.

- [ ] **Step 3: Creación de organizaciones**

En `app/api/organization/create/route.ts`:

1. Quitar `api_key` y `provider` del destructuring del cuerpo y de la validación de obligatorios; borrar la validación de `validProviders`.
2. Borrar el bloque "4. Crear API key" completo (desde `const providerModels` hasta el `if (apiKeyError) {...}`) y la importación de `DEFAULT_MODELS` y de `uuidv4` si queda sin uso.
3. En los dos rollbacks que hacen `await supabase.from("api_key_table").delete()...`, borrar esa línea.
4. En `toolsToInsert` quitar el campo `models`.

En `app/dashboard/admin/organizaciones/page.tsx`:

1. Quitar `api_key` y `provider` del estado `createOrgFormData` (en sus tres apariciones: inicial, reset tras crear y reset del formulario).
2. Quitar la validación `!createOrgFormData.api_key || !createOrgFormData.provider` y los dos campos del cuerpo del `fetch`.
3. Borrar el `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">` que contiene el `Select` de proveedor y el `Input` de API key (líneas ~1105-1140). Quitar la importación de `DEFAULT_MODELS` si queda sin uso.
4. Debajo del formulario, donde estaban los campos, agregar: `<p className="text-xs text-gray-500">La organización nace sin claves de IA. Su administrador las configura en Ajustes > Herramientas.</p>`.

- [ ] **Step 4: `lib/utils.ts`**

Borrar `MODELS` (etiquetas). Comprobar con `grep -rn "MODELS\b" --include=*.ts --include=*.tsx app components lib | grep -v "DEFAULT_MODELS\|MINI_MODELS"` que nadie la usa.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit 2>&1 | wc -l` → 109 o menos, y `npx tsc --noEmit 2>&1 | grep -E "integrations|integraciones|organization/create|admin/organizaciones|layout.tsx|lib/utils"` → sin salida.
Run: `grep -rn "api_key_table" app lib actions components hooks --include=*.ts --include=*.tsx` → sólo `lib/supabase/database.types.ts` y comentarios en `lib/costos.ts` y `lib/preguntas-chatbot/agente.ts`; si esos comentarios siguen mencionando `api_key_table` como fuente de claves, corregirlos para decir `herramienta_proveedores`.

- [ ] **Step 6: Commit**

```bash
git add -A app/dashboard/configuracion app/api/organization/create/route.ts app/dashboard/admin/organizaciones/page.tsx lib/utils.ts lib/costos.ts lib/preguntas-chatbot/agente.ts
git commit -m "feat: Integraciones desaparece; las claves viven en cada herramienta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 16: Segunda migración y verificación final

**Files:**
- Create: `supabase/migrations/drop_api_key_table_y_columnas_models.sql`

- [ ] **Step 1: Escribir la migración diferida**

```sql
-- SEGUNDA MIGRACIÓN de las claves por herramienta. NO aplicar con el
-- despliegue: aplicar una semana después, cuando La Silla Vacía ya haya
-- configurado sus herramientas en Ajustes > Herramientas. Hasta entonces el
-- código nuevo no lee nada de esto, y si algo sale mal se puede volver a la
-- versión anterior sin perder datos.
--
-- Ver docs/superpowers/specs/2026-09-29-claves-por-herramienta-design.md.

drop table if exists public.api_key_table;

alter table public.tools
  drop column if exists models,
  drop column if exists reasoning_effort,
  drop column if exists verbosity;

alter table public.default_tools
  drop column if exists models,
  drop column if exists reasoning_effort,
  drop column if exists verbosity;
```

Cuando se aplique, quitar también `api_key_table` de `lib/supabase/database.types.ts` (no antes: hasta entonces el tipo sigue describiendo la base real).

- [ ] **Step 2: Verificación completa**

Run: `pnpm test` → PASS.
Run: `rm -rf .next/dev .next/types; npx tsc --noEmit 2>&1 | wc -l` → 109 o menos.
Run: `ESLINT_USE_FLAT_CONFIG=false npx eslint -c .eslintrc.json $(git diff --name-only 61854b1 -- '*.ts' '*.tsx' | tr '\n' ' ')` y comparar con el mismo comando en `git stash` (o en un worktree de `main`) para confirmar que no hay problemas nuevos.

- [ ] **Step 3: Lista manual en el entorno con datos**

Después de aplicar `create_herramienta_proveedores.sql` en Supabase y desplegar:

1. Abrir Herramientas como OWNER, entrar al Corrector, pegar una clave de OpenAI y otra de Anthropic, ver que cargan sus listas de modelos, elegir uno en cada una, reordenar con las flechas y guardar.
2. Volver a abrir: las claves aparecen enmascaradas, el orden se conserva, la etiqueta "Por defecto" está en el primero.
3. Entrar a Hilos: las chips sugieren los modelos del Corrector. Pegar la misma clave del Corrector y confirmar que el guardado la rechaza nombrando al Corrector.
4. Usar el Corrector con cada proveedor. Usar el Detector en modo comparar con dos proveedores.
5. Apagar un proveedor y confirmar que desaparece del selector de la página de uso.
6. Quitar todos los proveedores de una herramienta y confirmar que aparece el aviso que manda a Herramientas.
7. Configurar Quién es quién y generar un perfil.
8. Confirmar que Integraciones ya no aparece en Ajustes y que crear una organización desde administración no pide clave.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/drop_api_key_table_y_columnas_models.sql
git commit -m "chore(db): migración diferida que retira api_key_table y las columnas de modelos

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
