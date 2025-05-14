import { createServerClient, createServiceClient } from "./server"
import type { Database } from "../database.types"

type Prompt = Database["public"]["Tables"]["prompts"]["Row"]
type PromptSharing = Database["public"]["Tables"]["prompt_sharing"]["Row"]
type Organization = Database["public"]["Tables"]["organization"]["Row"]

/**
 * Obtiene todos los prompts de la organización del usuario actual
 * y los prompts compartidos con esta organización
 */
export async function getOrganizationPrompts() {
  const supabase = createServerClient()

  // Obtener prompts de la organización del usuario
  const { data: ownPrompts, error: ownPromptsError } = await supabase
    .from("prompts")
    .select("*")
    .order("updatedAt", { ascending: false })

  if (ownPromptsError) {
    console.error("Error al obtener prompts propios:", ownPromptsError)
    return []
  }

  // Obtener prompts compartidos con la organización del usuario
  const { data: sharedPrompts, error: sharedPromptsError } = await supabase
    .from("prompt_sharing")
    .select(`
      id,
      prompt_id,
      shared_by,
      created_at,
      prompts:prompt_id (*)
    `)
    .order("created_at", { ascending: false })

  if (sharedPromptsError) {
    console.error("Error al obtener prompts compartidos:", sharedPromptsError)
    return ownPrompts || []
  }

  // Combinar prompts propios y compartidos, marcando los compartidos
  const sharedPromptsData =
    sharedPrompts?.map((item) => ({
      ...item.prompts,
      isShared: true,
      sharedBy: item.shared_by,
      sharingId: item.id,
    })) || []

  // Filtrar duplicados (si un prompt está compartido y es propio)
  const allPrompts = [...(ownPrompts || []), ...sharedPromptsData]
  const uniquePrompts = allPrompts.filter((prompt, index, self) => index === self.findIndex((p) => p.id === prompt.id))

  return uniquePrompts
}

/**
 * Obtiene todas las organizaciones disponibles para compartir prompts
 */
export async function getOrganizationsForSharing() {
  // Usamos el cliente de servicio para evitar restricciones de RLS
  const supabase = createServiceClient()

  const { data, error } = await supabase.from("organization").select("id, name").order("name")

  if (error) {
    console.error("Error al obtener organizaciones:", error)
    return []
  }

  return data || []
}

/**
 * Comparte un prompt con otra organización
 */
export async function sharePromptWithOrganization(promptId: string, organizationId: string) {
  const supabase = createServerClient()
  const serviceClient = createServiceClient()

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Usuario no autenticado" }
  }

  // Primero marcar el prompt como compartible
  const { error: updateError } = await supabase.from("prompts").update({ is_shareable: true }).eq("id", promptId)

  if (updateError) {
    console.error("Error al actualizar prompt:", updateError)
    return { success: false, error: updateError.message }
  }

  // Luego crear el registro de compartición usando el cliente de servicio
  // para evitar problemas de permisos
  const { data, error } = await serviceClient
    .from("prompt_sharing")
    .insert({
      prompt_id: promptId,
      shared_with_org_id: organizationId,
      shared_by: user.id,
    })
    .select()

  if (error) {
    console.error("Error al compartir prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Deja de compartir un prompt con una organización
 */
export async function unsharePrompt(sharingId: string) {
  // Usamos el cliente de servicio para evitar restricciones de RLS
  const supabase = createServiceClient()

  const { error } = await supabase.from("prompt_sharing").delete().eq("id", sharingId)

  if (error) {
    console.error("Error al dejar de compartir prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Marca un prompt como público (visible para todas las organizaciones)
 */
export async function makePromptPublic(promptId: string, isPublic: boolean) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("prompts")
    .update({
      is_public: isPublic,
      is_shareable: isPublic ? true : undefined, // Si es público, también debe ser compartible
    })
    .eq("id", promptId)

  if (error) {
    console.error("Error al actualizar visibilidad del prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Crea un nuevo prompt
 */
export async function createPrompt(promptData: Partial<Prompt>) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("prompts").insert(promptData).select()

  if (error) {
    console.error("Error al crear prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Actualiza un prompt existente
 */
export async function updatePrompt(promptId: string, updates: Partial<Prompt>) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("prompts").update(updates).eq("id", promptId).select()

  if (error) {
    console.error("Error al actualizar prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Elimina un prompt
 */
export async function deletePrompt(promptId: string) {
  const supabase = createServerClient()

  // Primero eliminar los registros de compartición
  const serviceClient = createServiceClient()
  await serviceClient.from("prompt_sharing").delete().eq("prompt_id", promptId)

  // Luego eliminar el prompt
  const { error } = await supabase.from("prompts").delete().eq("id", promptId)

  if (error) {
    console.error("Error al eliminar prompt:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Obtiene un prompt por su ID
 */
export async function getPromptById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("prompts").select("*").eq("id", id).single()

  if (error) {
    console.error("Error al obtener prompt:", error)
    return null
  }

  return data
}
