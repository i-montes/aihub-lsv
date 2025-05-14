import { type NextRequest, NextResponse } from "next/server"
import { getUsersForExport } from "@/lib/supabase/user-actions"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar permisos
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["OWNER", "WORKSPACE_ADMIN"].includes(profile.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener usuarios para exportación
    const { users, error } = await getUsersForExport()

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No hay usuarios para exportar" }, { status: 404 })
    }

    // Convertir a CSV
    const headers = Object.keys(users[0])
    const csvRows = [
      // Encabezados
      headers.join(","),
      // Filas de datos
      ...users.map((user) =>
        headers
          .map((header) => {
            const value = user[header as keyof typeof user]
            // Escapar comillas y encerrar en comillas si contiene comas o comillas
            const stringValue = String(value || "")
            if (stringValue.includes(",") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(","),
      ),
    ]

    const csv = csvRows.join("\n")

    // Configurar la respuesta
    const response = new NextResponse(csv)
    response.headers.set("Content-Type", "text/csv; charset=utf-8")
    response.headers.set("Content-Disposition", `attachment; filename="usuarios_${new Date().toISOString()}.csv"`)

    return response
  } catch (error) {
    console.error("Error al exportar usuarios:", error)
    return NextResponse.json({ error: "Error al exportar usuarios" }, { status: 500 })
  }
}
