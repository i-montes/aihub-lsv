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
 * Comprueba acceso a "Preguntas a SillaIA": que haya sesión y que la
 * organización tenga la herramienta habilitada, como el resto del kit.
 *
 * Hasta septiembre de 2026 exigía además rol OWNER, porque expone en texto
 * libre lo que los lectores le preguntan al chatbot. Se abrió a todo el
 * equipo de La Silla Vacía: es una herramienta de contenido para quien
 * escribe, no una analítica interna.
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
    .select("organizationId")
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
