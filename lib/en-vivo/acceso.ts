import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import { puedeVerHerramienta } from "@/lib/organizaciones/herramientas";

/** Motivo por el que se niega el acceso, con el status que le corresponde */
export interface AccesoNegado {
  mensaje: string;
  status: number;
}

export type ResultadoAcceso =
  | { negado: AccesoNegado; organizationId?: undefined; userId?: undefined; role?: undefined }
  | { negado: null; organizationId: string; userId: string; role: string };

/**
 * Comprueba que quien llama tenga sesión y que su organización tenga En Vivo habilitada. La
 * guarda del layout es sólo del lado del cliente; las rutas de la herramienta pasan por aquí.
 * Devuelve el rol porque conectar Facebook es sólo para OWNER y ADMIN.
 */
export async function verificarAccesoEnVivo(): Promise<ResultadoAcceso> {
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
    return { negado: { mensaje: "No se pudo obtener la organización del usuario", status: 403 } };
  }

  const { data: organization } = await supabase
    .from("organization")
    .select("name")
    .eq("id", profile.organizationId)
    .single();

  if (!puedeVerHerramienta(organization?.name, "en-vivo")) {
    return { negado: { mensaje: "Tu organización no tiene habilitada esta herramienta", status: 403 } };
  }

  return { negado: null, organizationId: profile.organizationId, userId: user.id, role: profile.role ?? "USER" };
}

export function esAdministrador(role: string | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}
