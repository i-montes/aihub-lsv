import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseRouteHandler } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

export const POST = createApiHandler(async (req: NextRequest) => {
  try {
    const { organization_name, email, name, lastname, role = 'OWNER', api_key, provider } = await req.json()

    // Validar campos obligatorios
    if (!organization_name || !email || !name || !lastname || !api_key || !provider) {
      return errorResponse("Nombre de organización, email, nombre, apellido, API key y proveedor son requeridos", 400)
    }

    // Validar proveedor
    const validProviders = ['OPENAI', 'GOOGLE', 'ANTHROPIC']
    if (!validProviders.includes(provider)) {
      return errorResponse("Proveedor debe ser uno de: OPENAI, GOOGLE, ANTHROPIC", 400)
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse("Formato de email inválido", 400)
    }

    const supabase = await getSupabaseRouteHandler()

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
    // const { data: existingUser, error: checkUserError } = await supabase.auth.getUserByEmail(email)
    const { data: existingUser, error: checkUserError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)

    if (checkUserError && checkUserError.message !== "User not found") {
      console.log(checkUserError)
      return errorResponse("Error al verificar usuario existente", 500)
    }

    if (existingUser?.email) {
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
        .upsert({
          id: invitedUser.user.id,
          email: email,
          name: name,
          lastname: lastname,
          role: role,
          organizationId: organizationId,
          created_at: currentDate,
          updated_at: currentDate,
        })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        // Si falla la creación del perfil, eliminar la organización y el usuario
        await supabase.from("organization").delete().eq("id", organizationId)
        await supabase.auth.admin.deleteUser(invitedUser.user.id)
        return errorResponse("Error al crear el perfil del usuario", 500)
      }
    }

    // 4. Crear API key
    const providerModels = {
      OPENAI: ["gpt-4.1-2025-04-14"],
      GOOGLE: ["gemini-2.5-pro"],
      ANTHROPIC: ["claude-opus-4-20250514"]
    }

    const { error: apiKeyError } = await supabase
      .from("api_key_table")
      .insert({
        id: uuidv4(),
        organizationId: organizationId,
        provider: provider,
        key: api_key,
        models: providerModels[provider as keyof typeof providerModels],
        status: "ACTIVE",
        createdAt: currentDate,
        updatedAt: currentDate
      })

     if (apiKeyError) {
      console.error("Error creating API key:", apiKeyError)
      // Rollback: eliminar organización y usuario
      await supabase.from("organization").delete().eq("id", organizationId)
      if (invitedUser?.user) {
        await supabase.auth.admin.deleteUser(invitedUser.user.id)
      }
      return errorResponse("Error al crear la API key", 500)
    }

    const { error: UsefulLinksError } = await supabase
      .from("useful_links")
      .insert([
        {
          organization_id: organizationId,
          name: "NotebookLM",
          description: "Asistente de investigación con IA para analizar documentos y generar pódcasts",
          link: "https://notebooklm.google/",
          
        },
        {
          organization_id: organizationId,
          name: "Pinpoint",
          description: "Herramienta para analizar grandes cantidades de datos",
          link: "https://journaliststudio.google.com/pinpoint/about/"
        },
        {
          organization_id: organizationId,
          name: "GODDS",
          description: "Sistema de detección de deepfakes para verificar autenticidad de contenido multimedia",
          link: "https://godds.ads.northwestern.edu/"
        }
      ])

    if (UsefulLinksError) {
      console.error("Error creating Useful Links:", UsefulLinksError)
      return errorResponse("Error al crear los enlaces útiles", 500)
    }   

    // 5. Obtener herramientas por defecto e insertarlas
    const { data: defaultTools, error: defaultToolsError } = await supabase
      .from("default_tools")
      .select("id, title, prompts, temperature, top_p, identity")

    if (defaultToolsError) {
      console.error("Error fetching default tools:", defaultToolsError)
      // Rollback: eliminar organización, usuario y API key
      await supabase.from("organization").delete().eq("id", organizationId)
      await supabase.from("api_key_table").delete().eq("organization_id", organizationId)
      if (invitedUser?.user) {
        await supabase.auth.admin.deleteUser(invitedUser.user.id)
      }
      return errorResponse("Error al obtener herramientas por defecto", 500)
    }

    if (defaultTools && defaultTools.length > 0) {
      const toolsToInsert = defaultTools.map((tool: any) => ({
        title: tool.title,
        prompts: tool.prompts,
        temperature: tool.temperature,
        top_p: tool.top_p,
        organization_id: organizationId,
        identity: tool.identity,
        schema: {},
        models: [{
          model: providerModels[provider as keyof typeof providerModels][0],
          provider: provider
        }],
        created_at: currentDate,
        updated_at: currentDate
      }))

      const { error: toolsError } = await supabase
        .from("tools")
        .insert(toolsToInsert)

      if (toolsError) {
        console.error("Error creating tools:", toolsError)
        // Rollback: eliminar organización, usuario y API key
        await supabase.from("organization").delete().eq("id", organizationId)
        await supabase.from("api_key_table").delete().eq("organization_id", organizationId)
        if (invitedUser?.user) {
          await supabase.auth.admin.deleteUser(invitedUser.user.id)
        }
        return errorResponse("Error al crear las herramientas por defecto", 500)
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