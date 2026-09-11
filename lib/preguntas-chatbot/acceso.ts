import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { puedeVerHerramienta } from "@/lib/organizaciones/herramientas";

/** Motivo por el que se niega el acceso, con el status que le corresponde */
export interface AccesoNegado {
  mensaje: string;
  status: number;
}

export type ResultadoAcceso =
  | { negado: AccesoNegado; organizationId?: undefined; userId?: undefined }
  | { negado: null; organizationId: string; userId: string };

/**
 * Comprueba acceso a "Preguntas al chatbot": además de que la organización
 * tenga la herramienta habilitada (como el resto del kit), exige rol OWNER —
 * expone en texto libre lo que cualquier lector le ha preguntado al chatbot,
 * así que se trata como el resto de analíticas internas, no como una
 * herramienta de contenido para todo el equipo.
 */
export async function verificarAccesoPreguntasChatbot(): Promise<ResultadoAcceso> {
  const supabase = await getSupabaseRouteHandler();
  const {
    data: { user },
    error: userAuthError,
  } = await supabase.auth.getUser();

  if (userAuthError || !user) {
    return { negado: { mensaje: "No hay usuario autenticado", status: 401 } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organizationId, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organizationId) {
    return {
      negado: {
        mensaje: "No se pudo obtener la organización del usuario",
        status: 403,
      },
    };
  }

  if (profile.role !== "OWNER") {
    return {
      negado: {
        mensaje: "Sólo el dueño de la organización puede usar esta herramienta",
        status: 403,
      },
    };
  }

  const { data: organization } = await supabase
    .from("organization")
    .select("name")
    .eq("id", profile.organizationId)
    .single();

  if (!puedeVerHerramienta(organization?.name, "preguntas-chatbot")) {
    return {
      negado: {
        mensaje: "Tu organización no tiene habilitada esta herramienta",
        status: 403,
      },
    };
  }

  return { negado: null, organizationId: profile.organizationId, userId: user.id };
}
