"use server"

import { getServiceClient } from "./db"
import { createServerClient } from "./server"

export async function getPromptById(promptId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("prompts")
    .select("*, profiles(name, lastname, avatar)")
    .eq("id", promptId)
    .single()

  if (error) {
    console.error("Error fetching prompt:", error)
    return null
  }

  return data
}

export async function createPrompt({
  title,
  content,
  category,
  isPublic = false,
  userId,
  organizationId,
}: {
  title: string
  content: string
  category: string
  isPublic?: boolean
  userId: string
  organizationId: string
}) {
  const serviceClient = getServiceClient()

  const promptId = crypto.randomUUID()

  const { error } = await serviceClient.from("prompts").insert({
    id: promptId,
    title,
    content,
    category,
    isPublic,
    userId,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (error) {
    console.error("Error creating prompt:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "PROMPT_CREATED",
      createdAt: new Date().toISOString(),
      details: {
        promptId,
        title,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true, promptId }
}

export async function updatePrompt({
  id,
  title,
  content,
  category,
  isPublic,
  userId,
}: {
  id: string
  title: string
  content: string
  category: string
  isPublic: boolean
  userId: string
}) {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from("prompts")
    .update({
      title,
      content,
      category,
      isPublic,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating prompt:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "PROMPT_UPDATED",
      createdAt: new Date().toISOString(),
      details: {
        promptId: id,
        title,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function deletePrompt(promptId: string, userId: string) {
  const serviceClient = getServiceClient()

  // Obtener el título del prompt para el registro de actividad
  const { data: prompt, error: fetchError } = await serviceClient
    .from("prompts")
    .select("title")
    .eq("id", promptId)
    .single()

  if (fetchError) {
    console.error("Error fetching prompt:", fetchError)
    return { error: fetchError.message }
  }

  // Eliminar el prompt
  const { error } = await serviceClient.from("prompts").delete().eq("id", promptId)

  if (error) {
    console.error("Error deleting prompt:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "PROMPT_DELETED",
      createdAt: new Date().toISOString(),
      details: {
        promptId,
        title: prompt.title,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function getOrganizationsForSharing(userId: string) {
  const serviceClient = getServiceClient()

  // Obtener las organizaciones a las que pertenece el usuario
  const { data: userOrgs, error: userOrgsError } = await serviceClient
    .from("profiles")
    .select("organizationId")
    .eq("id", userId)
    .not("organizationId", "is", null)

  if (userOrgsError || !userOrgs.length) {
    console.error("Error fetching user organizations:", userOrgsError)
    return []
  }

  const userOrgId = userOrgs[0].organizationId

  // Obtener todas las organizaciones excepto la del usuario
  const { data: orgs, error: orgsError } = await serviceClient
    .from("organization")
    .select("id, name")
    .neq("id", userOrgId)
    .order("name")

  if (orgsError) {
    console.error("Error fetching organizations:", orgsError)
    return []
  }

  return orgs || []
}

export async function sharePromptWithOrganization(promptId: string, organizationId: string, userId: string) {
  const serviceClient = getServiceClient()

  // Verificar si ya está compartido con esta organización
  const { data: existing, error: checkError } = await serviceClient
    .from("prompt_shares")
    .select("id")
    .eq("promptId", promptId)
    .eq("organizationId", organizationId)

  if (checkError) {
    console.error("Error checking existing share:", checkError)
    return { error: checkError.message }
  }

  if (existing && existing.length > 0) {
    return { error: "Este prompt ya está compartido con esta organización" }
  }

  // Compartir el prompt
  const { error } = await serviceClient.from("prompt_shares").insert({
    id: crypto.randomUUID(),
    promptId,
    organizationId,
    sharedBy: userId,
    sharedAt: new Date().toISOString(),
  })

  if (error) {
    console.error("Error sharing prompt:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "PROMPT_SHARED",
      createdAt: new Date().toISOString(),
      details: {
        promptId,
        organizationId,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function unsharePrompt(promptId: string, organizationId: string, userId: string) {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from("prompt_shares")
    .delete()
    .eq("promptId", promptId)
    .eq("organizationId", organizationId)

  if (error) {
    console.error("Error unsharing prompt:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: "PROMPT_UNSHARED",
      createdAt: new Date().toISOString(),
      details: {
        promptId,
        organizationId,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}

export async function makePromptPublic(promptId: string, isPublic: boolean, userId: string) {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from("prompts")
    .update({
      isPublic,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", promptId)

  if (error) {
    console.error("Error updating prompt visibility:", error)
    return { error: error.message }
  }

  // Registrar la actividad
  try {
    await serviceClient.from("activity").insert({
      id: crypto.randomUUID(),
      userId,
      action: isPublic ? "PROMPT_MADE_PUBLIC" : "PROMPT_MADE_PRIVATE",
      createdAt: new Date().toISOString(),
      details: {
        promptId,
      },
    })
  } catch (activityError) {
    console.error("Error registering activity:", activityError)
    // No bloqueamos el flujo si falla el registro de actividad
  }

  return { success: true }
}
