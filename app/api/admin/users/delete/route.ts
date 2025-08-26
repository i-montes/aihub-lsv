import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabase/server"

// Crear cliente de Supabase con service role para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    // Obtener el cliente de Supabase para validar la sesión del usuario actual
    const supabase = await getSupabaseServer()
    
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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "El ID del usuario es requerido." },
        { status: 400 }
      )
    }

    // Verificar que el usuario a eliminar existe
    const { data: userToDelete, error: userCheckError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .single()

    if (userCheckError || !userToDelete) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    // Prevenir que un usuario se elimine a sí mismo
    if (userId === user.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo." },
        { status: 400 }
      )
    }

    // Prevenir que un ADMIN elimine a un OWNER (solo OWNER puede eliminar OWNER)
    if (userToDelete.role === "OWNER" && profile.role !== "OWNER") {
      return NextResponse.json(
        { error: "Solo un propietario puede eliminar a otro propietario." },
        { status: 403 }
      )
    }

    // Eliminar el usuario de la tabla auth usando el cliente administrativo
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authDeleteError) {
      console.error("Error eliminando usuario de auth:", authDeleteError)
      return NextResponse.json(
        { error: "Error al eliminar el usuario de la autenticación." },
        { status: 500 }
      )
    }

    // Eliminar el perfil del usuario de la tabla profiles
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileDeleteError) {
      console.error("Error eliminando perfil del usuario:", profileDeleteError)
      // Intentar restaurar el usuario en auth si falló la eliminación del perfil
      // Nota: Supabase no permite restaurar usuarios eliminados, así que registramos el error
      return NextResponse.json(
        { error: "Error al eliminar el perfil del usuario. El usuario fue eliminado de la autenticación pero el perfil puede persistir." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "Usuario eliminado exitosamente del sistema.",
        deletedUser: {
          id: userId,
          email: userToDelete.email
        }
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