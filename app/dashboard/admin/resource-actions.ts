"use server"

import { createServiceClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/supabase/server"
import { logActivity } from "@/lib/supabase/db"
import { revalidatePath } from "next/cache"

// Acción para añadir un nuevo recurso
export async function addResource(resourceData: {
  title: string
  description?: string
  type: string
  url: string
}) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    const supabase = createServiceClient()

    // Crear el recurso
    const { error } = await supabase.from("resources").insert({
      id: crypto.randomUUID(),
      title: resourceData.title,
      description: resourceData.description || null,
      type: resourceData.type,
      url: resourceData.url,
      author: currentUser.id,
      organizationId: currentUser.organizationId,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Registrar la actividad
    await logActivity(currentUser.id, "RESOURCE_ADDED", {
      resourceTitle: resourceData.title,
      resourceType: resourceData.type,
    })

    revalidatePath("/dashboard/admin")

    return { success: true }
  } catch (error) {
    console.error("Error al añadir recurso:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Acción para actualizar un recurso existente
export async function updateResource(resourceData: {
  id: string
  title: string
  description?: string
  type: string
  url: string
  status: string
}) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    const supabase = createServiceClient()

    // Verificar que el recurso pertenece a la organización del usuario
    const { data: resource } = await supabase
      .from("resources")
      .select("organizationId")
      .eq("id", resourceData.id)
      .single()

    if (!resource || resource.organizationId !== currentUser.organizationId) {
      return { error: "No tienes permisos para modificar este recurso" }
    }

    // Actualizar el recurso
    const { error } = await supabase
      .from("resources")
      .update({
        title: resourceData.title,
        description: resourceData.description || null,
        type: resourceData.type,
        url: resourceData.url,
        status: resourceData.status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", resourceData.id)

    if (error) {
      return { error: error.message }
    }

    // Registrar la actividad
    await logActivity(currentUser.id, "RESOURCE_UPDATED", {
      resourceId: resourceData.id,
      resourceTitle: resourceData.title,
    })

    revalidatePath("/dashboard/admin")

    return { success: true }
  } catch (error) {
    console.error("Error al actualizar recurso:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Acción para eliminar un recurso
export async function deleteResource(resourceId: string) {
  try {
    const currentUser = await getServerUser()

    if (!currentUser) {
      return { error: "No estás autenticado" }
    }

    const supabase = createServiceClient()

    // Verificar que el recurso pertenece a la organización del usuario
    const { data: resource } = await supabase
      .from("resources")
      .select("organizationId, title")
      .eq("id", resourceId)
      .single()

    if (!resource || resource.organizationId !== currentUser.organizationId) {
      return { error: "No tienes permisos para eliminar este recurso" }
    }

    // Eliminar el recurso (o marcarlo como eliminado)
    const { error } = await supabase
      .from("resources")
      .update({
        status: "DELETED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", resourceId)

    if (error) {
      return { error: error.message }
    }

    // Registrar la actividad
    await logActivity(currentUser.id, "RESOURCE_DELETED", {
      resourceId,
      resourceTitle: resource.title,
    })

    revalidatePath("/dashboard/admin")

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar recurso:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}
