import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

export const POST = createApiHandler(async (req: NextRequest) => {
  try {
    const { organization_name, email, name, lastname, role = 'OWNER' } = await req.json()

    // Validar campos obligatorios
    if (!organization_name || !email || !name || !lastname) {
      return errorResponse("Nombre de organización, email, nombre y apellido son requeridos", 400)
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse("Formato de email inválido", 400)
    }

    const supabase = await getSupabaseServer()

    // Verificar que el usuario actual esté autenticado y sea admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return errorResponse("No autenticado", 401)
    }

    // Verificar que el usuario actual sea admin
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || currentProfile?.role !== "OWNER") {
      return errorResponse("No tienes permisos para crear organizaciones", 403)
    }

    // Verificar si ya existe un usuario con ese email
    const { data: existingUser, error: checkUserError } = await supabase.auth.admin.getUserByEmail(email)

    if (checkUserError && checkUserError.message !== "User not found") {
      return errorResponse("Error al verificar usuario existente", 500)
    }

    if (existingUser?.user) {
      return errorResponse("Ya existe un usuario con ese email", 409)
    }

    // Generar ID para la nueva organización
    const organizationId = uuidv4()
    const currentDate = new Date().toISOString()

    // 1. Crear la organización
    const { data: newOrganization, error: orgError } = await supabase
      .from("organization")
      .insert({
        id: organizationId,
        name: organization_name,
        contactemail: email,
        state: "ACTIVE",
        createdAt: currentDate,
        updatedAt: currentDate,
      })
      .select()
      .single()

    if (orgError) {
      console.error("Error creating organization:", orgError)
      return errorResponse("Error al crear la organización", 500)
    }

    // 2. Invitar al usuario por email
    const redirectTo = `https://www.elkit.ai/auth/invite?email=${encodeURIComponent(email)}&organizationId=${organizationId}`
    
    const { data: invitedUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: {
          role,
          name,
          lastname,
          organizationId,
        },
      }
    )

    if (inviteError) {
      console.error("Error inviting user:", inviteError)
      // Si falla la invitación, eliminar la organización creada
      await supabase.from("organization").delete().eq("id", organizationId)
      return errorResponse("Error al invitar al usuario", 500)
    }

    // 3. Crear el perfil del usuario invitado
    if (invitedUser?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: invitedUser.user.id,
          email: email,
          name: name,
          lastname: lastname,
          role: role,
          organizationId: organizationId,
          createdAt: currentDate,
          updatedAt: currentDate,
        })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        // Si falla la creación del perfil, eliminar la organización y el usuario
        await supabase.from("organization").delete().eq("id", organizationId)
        await supabase.auth.admin.deleteUser(invitedUser.user.id)
        return errorResponse("Error al crear el perfil del usuario", 500)
      }
    }

    return successResponse({
      organization: newOrganization,
      invitedUser: {
        id: invitedUser?.user?.id,
        email: email,
        name: name,
        lastname: lastname,
        role: role,
      },
      message: "Organización creada exitosamente. Se ha enviado una invitación al email proporcionado.",
    })
  } catch (error: any) {
    console.error("Error in organization creation:", error)
    return errorResponse("Error interno del servidor", 500)
  }
})