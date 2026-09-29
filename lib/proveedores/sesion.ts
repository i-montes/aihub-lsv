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
