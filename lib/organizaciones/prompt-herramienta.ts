import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Herramienta } from "@/lib/organizaciones/herramientas";

/** Una pestaña del editor de prompts de Ajustes > Herramientas */
export interface PestanaPromptOrganizacion {
  title: string;
  content: string;
}

/**
 * Las pestañas de prompt que la organización configuró en Ajustes >
 * Herramientas para una herramienta.
 *
 * Se leen de la tabla `tools` por `identity`. Sirve para las herramientas que
 * no arman el prompt en el cliente —Quién es quién, Preguntas a SillaIA— y
 * necesitan leerlo en su ruta de API. Las pestañas vacías o sólo con espacios
 * se descartan; si la lectura falla tampoco se bloquea nada, la herramienta
 * sigue con sus instrucciones base.
 */
export async function leerPromptDeOrganizacionCompleto(
  supabase: SupabaseServerClient,
  organizationId: string,
  herramienta: Herramienta
): Promise<PestanaPromptOrganizacion[]> {
  try {
    const { data: toolRow } = await supabase
      .from("tools")
      .select("prompts")
      .eq("organization_id", organizationId)
      .eq("identity", herramienta)
      .maybeSingle();

    if (!toolRow) return [];
    return normalizarPrompts(toolRow.prompts);
  } catch {
    return [];
  }
}

/**
 * El primer prompt de la organización, o `undefined` si no configuró ninguno.
 * Para las herramientas que sólo usan una pestaña, como Quién es quién.
 */
export async function leerPromptDeOrganizacion(
  supabase: SupabaseServerClient,
  organizationId: string,
  herramienta: Herramienta
): Promise<string | undefined> {
  const prompts = await leerPromptDeOrganizacionCompleto(
    supabase,
    organizationId,
    herramienta
  );
  return prompts[0]?.content;
}

/**
 * `prompts` puede ser un array `[{ title, content }]`, un array de cadenas o
 * una cadena directa, según cómo se haya guardado.
 */
function normalizarPrompts(prompts: unknown): PestanaPromptOrganizacion[] {
  const lista: unknown[] =
    typeof prompts === "string" ? [prompts] : Array.isArray(prompts) ? prompts : [];

  return lista
    .map((p, i): PestanaPromptOrganizacion | null => {
      if (typeof p === "string") return { title: `Prompt ${i + 1}`, content: p };
      const fila = p as { title?: unknown; content?: unknown } | null;
      if (typeof fila?.content !== "string") return null;
      return {
        title: typeof fila.title === "string" ? fila.title : `Prompt ${i + 1}`,
        content: fila.content,
      };
    })
    .filter((p): p is PestanaPromptOrganizacion => p !== null && p.content.trim() !== "");
}
