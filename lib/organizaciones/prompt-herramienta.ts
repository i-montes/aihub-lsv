import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Herramienta } from "@/lib/organizaciones/herramientas";

/**
 * Prompt que la organización configuró en Ajustes > Herramientas para una
 * herramienta, o `undefined` si no lo ha configurado.
 *
 * Se lee de la tabla `tools` por `identity`. Sirve para las herramientas que
 * no arman el prompt en el cliente —Quién es quién, Preguntas a SillaIA— y
 * necesitan leerlo en su ruta de API. Un prompt vacío o sólo espacios equivale
 * a no configurado; si la lectura falla tampoco se bloquea nada, la herramienta
 * sigue con sus instrucciones base.
 */
export async function leerPromptDeOrganizacion(
  supabase: SupabaseServerClient,
  organizationId: string,
  herramienta: Herramienta
): Promise<string | undefined> {
  try {
    const { data: toolRow } = await supabase
      .from("tools")
      .select("prompts")
      .eq("organization_id", organizationId)
      .eq("identity", herramienta)
      .maybeSingle();

    const prompt = primerPrompt(toolRow?.prompts);
    return prompt && prompt.trim() !== "" ? prompt : undefined;
  } catch {
    return undefined;
  }
}

/**
 * `prompts` puede ser un array `[{ title, content }]`, un array de cadenas o
 * una cadena directa, según cómo se haya guardado. Se toma el primero.
 */
function primerPrompt(prompts: unknown): string | undefined {
  if (typeof prompts === "string") return prompts;
  if (!Array.isArray(prompts) || prompts.length === 0) return undefined;

  const primero = prompts[0] as { content?: unknown } | string;
  if (typeof primero === "string") return primero;
  return typeof primero?.content === "string" ? primero.content : undefined;
}
