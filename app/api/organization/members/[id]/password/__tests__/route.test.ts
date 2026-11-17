import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "../route"

const perfiles: Record<string, { role: string; organizationId: string }> = {}
const updateUserById = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin" } } }) },
    from: () => ({
      select: () => ({
        eq: (_: string, id: string) => ({ single: async () => ({ data: perfiles[id] ?? null }) }),
      }),
    }),
  }),
}))
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ auth: { admin: { updateUserById } } }),
}))


const llamar = (userId: string, body: object = {}) =>
  POST(
    new NextRequest(`http://x/api/organization/members/${userId}/password`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  )

describe("POST /organization/members/[id]/password", () => {
  beforeEach(() => {
    updateUserById.mockReset().mockResolvedValue({ error: null })
    perfiles.admin = { role: "ADMIN", organizationId: "org1" }
    perfiles.user = { role: "USER", organizationId: "org1" }
    perfiles.owner = { role: "OWNER", organizationId: "org1" }
    perfiles.ajeno = { role: "USER", organizationId: "org2" }
  })

  it("genera una contraseña y la devuelve", async () => {
    const res = await llamar("user")
    const { data } = await res.json()
    expect(res.status).toBe(200)
    expect(data.password).toHaveLength(16)
    expect(updateUserById).toHaveBeenCalledWith("user", { password: data.password })
  })

  it("establece la contraseña dada sin devolverla", async () => {
    const res = await llamar("user", { password: "secreta123" })
    expect((await res.json()).data.password).toBeNull()
    expect(updateUserById).toHaveBeenCalledWith("user", { password: "secreta123" })
  })

  it.each([
    ["contraseña corta", "user", { password: "corta" }, 400],
    ["otra organización", "ajeno", {}, 403],
    ["ADMIN sobre OWNER", "owner", {}, 403],
    ["a sí mismo", "admin", {}, 400],
  ])("rechaza %s", async (_, userId, body, status) => {
    expect((await llamar(userId, body)).status).toBe(status)
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it("rechaza a un USER que intenta restablecer", async () => {
    perfiles.admin.role = "USER"
    expect((await llamar("user")).status).toBe(403)
  })
})
