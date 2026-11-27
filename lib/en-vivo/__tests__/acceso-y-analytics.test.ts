import { beforeEach, describe, expect, it, vi } from "vitest";

// Sesión simulada: usuario, perfil y organización.
const sesion = { user: null as { id: string } | null, perfil: null as { organizationId: string; role: string } | null, organizacion: "" };
vi.mock("@/lib/supabase/server", () => {
  const cliente = () => ({
    auth: { getUser: async () => ({ data: { user: sesion.user }, error: null }) },
    from: (tabla: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: tabla === "profiles" ? sesion.perfil : { name: sesion.organizacion } }),
        }),
      }),
    }),
  });
  return { getSupabaseRouteHandler: async () => cliente(), getSupabaseServer: async () => cliente() };
});

// analytics_en_vivo en memoria, sólo por el cliente de servicio.
const filas = new Map<string, Record<string, unknown>>();
const usoAdmin = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => {
    usoAdmin();
    return {
      from: (tabla: string) => ({
        select: () => ({
          eq: (_: string, id: string) => ({
            single: async () => (filas.has(id) ? { data: filas.get(id), error: null } : { data: null, error: { message: "no" } }),
          }),
        }),
        upsert: (fila: Record<string, unknown>) => {
          if (tabla !== "analytics_en_vivo") throw new Error(tabla);
          filas.set(String(fila.id), fila);
          return { select: () => ({ single: async () => ({ data: fila, error: null }) }) };
        },
      }),
    };
  },
}));

import { verificarAccesoEnVivo, esAdministrador } from "../acceso";
import { analyticsPropia, AnalyticsEnVivoService } from "@/lib/analytics";

beforeEach(() => {
  sesion.user = { id: "u1" };
  sesion.perfil = { organizationId: "silla", role: "USER" };
  sesion.organizacion = "La Silla Vacía";
  filas.clear();
  usoAdmin.mockClear();
});

describe("acceso a Post redes", () => {
  it("deja entrar a La Silla Vacía y devuelve el rol", async () => {
    expect(await verificarAccesoEnVivo()).toEqual({ negado: null, organizationId: "silla", userId: "u1", role: "USER" });
  });

  it("no deja entrar a Orza", async () => {
    sesion.perfil = { organizationId: "orza", role: "OWNER" };
    sesion.organizacion = "Orza";
    expect((await verificarAccesoEnVivo()).negado?.status).toBe(403);
  });

  it("sin sesión es 401 y sin organización 403", async () => {
    sesion.user = null;
    expect((await verificarAccesoEnVivo()).negado?.status).toBe(401);
    sesion.user = { id: "u1" };
    sesion.perfil = null;
    expect((await verificarAccesoEnVivo()).negado?.status).toBe(403);
  });

  it("sólo OWNER y ADMIN son administradores", () => {
    expect(esAdministrador("OWNER")).toBe(true);
    expect(esAdministrador("ADMIN")).toBe(true);
    expect(esAdministrador("USER")).toBe(false);
    expect(esAdministrador(undefined)).toBe(false);
  });
});

describe("analíticas de Post redes", () => {
  it("se guardan con el cliente de servicio, no con la sesión", async () => {
    const a = new AnalyticsEnVivoService({ organization_id: "silla", user_id: "u1", url_nota: "x" });
    await a.save();
    expect(a.guardadoOk).toBe(true);
    expect(usoAdmin).toHaveBeenCalled();
    expect(filas.get(String(a.schema.id))).toMatchObject({ organization_id: "silla", user_id: "u1" });
  });

  it("analyticsPropia devuelve la fila propia y permite actualizarla", async () => {
    filas.set("a1", { id: "a1", organization_id: "silla", user_id: "u1", publicada: false });
    const a = await analyticsPropia("a1", "silla", "u1");
    expect(a).not.toBeNull();
    await a!.updateSchema({ publicada: true });
    expect(filas.get("a1")).toMatchObject({ publicada: true });
  });

  it.each([
    ["de otra organización", { organization_id: "orza", user_id: "u1" }],
    ["de otro usuario", { organization_id: "silla", user_id: "u2" }],
  ])("no devuelve una fila %s", async (_, duenos) => {
    filas.set("a1", { id: "a1", ...duenos });
    expect(await analyticsPropia("a1", "silla", "u1")).toBeNull();
  });

  it.each([null, undefined, "", {}, ["a1"]])("ignora el id %j sin consultar", async (id) => {
    expect(await analyticsPropia(id, "silla", "u1")).toBeNull();
  });

  it("un id que no existe no crea una fila", async () => {
    expect(await analyticsPropia("no-existe", "silla", "u1")).toBeNull();
    expect(filas.size).toBe(0);
  });
});
