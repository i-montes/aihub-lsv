import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const acceso = vi.fn();
vi.mock("@/lib/en-vivo/acceso", () => ({ verificarAccesoEnVivo: () => acceso() }));

import { COOKIE_STATE } from "@/lib/en-vivo/facebook";
import { GET } from "../route";

const entrar = () => GET(new NextRequest("http://localhost:3000/api/en-vivo/facebook/login"));

beforeEach(() => {
  vi.stubEnv("META_APP_ID", "app");
  vi.stubEnv("META_APP_SECRET", "secreto");
  vi.stubEnv("META_REDIRECT_BASE", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/en-vivo/facebook/login", () => {
  it.each(["USER", "ADMIN", "OWNER"])("un miembro con rol %s va al diálogo de Facebook con un state", async (role) => {
    acceso.mockResolvedValue({ negado: null, organizationId: "silla", userId: "u1", role });
    const r = await entrar();
    const destino = new URL(r.headers.get("location")!);
    expect(destino.hostname).toBe("www.facebook.com");
    const state = r.cookies.get(COOKIE_STATE)?.value;
    expect(state).toMatch(/^[0-9a-f]{32}$/);
    expect(destino.searchParams.get("state")).toBe(state);
  });

  it("otra organización vuelve a Post redes con el motivo y sin state", async () => {
    acceso.mockResolvedValue({ negado: { mensaje: "Tu organización no tiene habilitada esta herramienta", status: 403 } });
    const r = await entrar();
    expect(new URL(r.headers.get("location")!).searchParams.get("facebook")).toMatch(/no tiene habilitada/);
    expect(r.cookies.get(COOKIE_STATE)).toBeUndefined();
  });
});
