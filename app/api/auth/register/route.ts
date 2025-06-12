import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, lastname } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email y contraseña son requeridos",
          errorCode: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Crear cliente de Supabase para el route handler
    const supabase = await getSupabaseServer()

    // Verificar si el usuario ya existe consultando la tabla profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (profileError) {
      console.error("Error al verificar perfil existente:", profileError)
      return NextResponse.json(
        {
          error: "Error al verificar usuario",
          errorCode: "DATABASE_ERROR",
        },
        { status: 500 },
      )
    }

    // Si el perfil ya existe, devolver un error
    if (existingProfile) {
      return NextResponse.json(
        {
          error: "El email ya está registrado. Por favor inicia sesión o usa otro email.",
          errorCode: "EMAIL_EXISTS",
        },
        { status: 400 },
      )
    }

    // Proceder con el registro si el usuario no existe
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          lastname,
          role: "OWNER",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    })

    if (error) {
      console.error("Error en registro:", error)

      // Determinar el tipo de error para enviar un código específico
      let errorCode = "REGISTRATION_FAILED"

      if (error.message.includes("password")) {
        errorCode = "INVALID_PASSWORD"
      } else if (error.message.includes("email")) {
        errorCode = "INVALID_EMAIL"
      } else if (error.message.includes("rate limit")) {
        errorCode = "RATE_LIMITED"
      }

      return NextResponse.json(
        {
          error: error.message,
          errorCode,
        },
        { status: 400 },
      )
    }

    // Si hay un usuario creado, procedemos a crear la organización y el perfil
    if (data.user) {
      const userId = data.user.id

      // 1. Crear una nueva organización
      const { data: orgData, error: orgError } = await supabase
        .from("organization")
        .insert({
          id: crypto.randomUUID(), // Generar UUID para el ID
          name: `${name}'s Organization`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Campos opcionales
          contactemail: email,
        })
        .select("id")
        .single()

      if (orgError) {
        console.error("Error al crear organización:", orgError)
        console.error("Detalles del error:", JSON.stringify(orgError, null, 2))
      }

      // Obtener el ID de la organización creada
      const organizationId = orgData?.id

      if (!organizationId) {
        console.error("No se pudo obtener el ID de la organización")
      }

      // 2. Crear o actualizar el perfil del usuario con el ID de la organización
      const { error: profileUpsertError } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        name,
        lastname,
        role: "OWNER",
        organizationId: organizationId, // Usar camelCase: organizationId
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileUpsertError) {
        console.error("Error al crear/actualizar perfil:", profileUpsertError)
        console.error("Detalles del error de perfil:", JSON.stringify(profileUpsertError, null, 2))
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    console.error("Error inesperado en registro:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        errorCode: "SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
