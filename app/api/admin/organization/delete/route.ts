import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    // Obtener el cliente de Supabase para validar la sesión del usuario actual
    const supabase = await getSupabaseRouteHandler()
    
    // Verificar autenticación del usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      )
    }

    // Obtener el perfil del usuario actual para verificar permisos
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Error al obtener el perfil del usuario." },
        { status: 500 }
      )
    }

    // Verificar que el usuario tenga permisos de administrador
    if (profile.role !== "ADMIN" && profile.role !== "OWNER") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo los administradores pueden eliminar usuarios." },
        { status: 403 }
      )
    }

    // Obtener el ID del usuario a eliminar del cuerpo de la solicitud
    const { organization_id } = await request.json()

    if (!organization_id) {
      return NextResponse.json(
        { error: "El ID de la organización es requerido." },
        { status: 400 }
      )
    }

    // Verificar que el usuario a eliminar existe
    const { data: orgToDelete, error: orgCheckError } = await supabase
      .from("organization")
      .select("id")
      .eq("id", organization_id)
      .single()

    if (orgCheckError || !orgToDelete) {
      return NextResponse.json(
        { error: "Organización no encontrada." },
        { status: 404 }
      )
    }

    const { data: users, error: usersDeleteError } = await supabase
        .from("profiles")
        .delete()
        .select("id")
        .eq("organizationId", orgToDelete.id)

    if (usersDeleteError) {
      console.error("Error eliminando usuarios de la organización:", usersDeleteError)
      return NextResponse.json(
        { error: "Error al eliminar usuarios de la organización." },
        { status: 500 }
      )
    }

    await Promise.all(
      users.map(async (user: any) => {
        await supabase.auth.admin.deleteUser(user.id)
      })
    )

    await supabase.from("tools").delete().eq("organization_id", orgToDelete.id)
    
    const { error: orgDeleteError } = await supabase
        .from("organization")
        .delete()
        .eq("id", orgToDelete.id)

    if (orgDeleteError) {
      console.error("Error eliminando la organización:", orgDeleteError)
      return NextResponse.json(
        { error: "Error al eliminar la organización." },
        { status: 500 }
      )
    }

    

    return NextResponse.json(
      { 
        message: "Usuario eliminado exitosamente del sistema.",
        success: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error en la eliminación del usuario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}