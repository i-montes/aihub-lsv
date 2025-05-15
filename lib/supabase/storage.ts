"use client"

import { getSupabaseClient } from "./client"

export async function uploadFile(file: File, bucket: string, path: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) {
    console.error("Error uploading file:", error)
    return { error: error.message }
  }

  // Obtener la URL pública del archivo
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return {
    success: true,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  }
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error("Error deleting file:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = getSupabaseClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function listFiles(bucket: string, path: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    console.error("Error listing files:", error)
    return { error: error.message }
  }

  return { success: true, files: data }
}
