import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { puedeVerHerramienta } from "@/lib/organizaciones/herramientas";

/** Motivo por el que se niega el acceso, con el status que le corresponde */
export interface AccesoNegado {
  mensaje: string;
  status: number;
}

/**
 * Comprueba que quien llama sea usuario de una organización habilitada.
 *
 * Vive aparte porque las dos rutas de la herramienta —`/api/nombre` y
 * `/api/perfil`— exigen lo mismo pero reportan el fallo distinto: una en JSON
 * y la otra como evento SSE. Por eso devuelve el motivo en vez de la respuesta.
 */
export async function verificarAccesoQuienEsQuien(): Promise<AccesoNegado | null> {
  const supabase = await getSupabaseRouteHandler();
  const {
    data: { user },
    error: userAuthError,
  } = await supabase.auth.getUser();

  if (userAuthError || !user) {
    return { mensaje: "No hay usuario autenticado", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organizationId")
    .eq("id", user.id)
    .single();

  if (!profile?.organizationId) {
    return {
      mensaje: "No se pudo obtener la organización del usuario",
      status: 403,
    };
  }

  const { data: organization } = await supabase
    .from("organization")
    .select("name")
    .eq("id", profile.organizationId)
    .single();

  if (!puedeVerHerramienta(organization?.name, "quien-es-quien")) {
    return {
      mensaje: "Tu organización no tiene habilitada esta herramienta",
      status: 403,
    };
  }

  return null;
}
