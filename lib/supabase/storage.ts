import { getSupabaseClient } from "./client"
import { createServiceClient } from "./server"
import { v4 as uuidv4 } from "uuid"

// Función para subir un archivo desde el cliente
export async function uploadFile(
  bucket: string,
  file: File,
  options: {
    path?: string
    isPublic?: boolean
    metadata?: Record<string, string>
  } = {},
) {
  const { path = "", isPublic = false, metadata = {} } = options
  const supabase = getSupabaseClient()

  // Generar un nombre de archivo único
  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = path ? `${path}/${fileName}` : fileName

  // Subir el archivo
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
    metadata,
  })

  if (error) {
    throw error
  }

  // Obtener la URL pública si es necesario
  let publicUrl = null
  if (isPublic) {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    publicUrl = urlData.publicUrl
  }

  return {
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
    publicUrl,
  }
}

// Función para eliminar un archivo desde el cliente
export async function deleteFile(bucket: string, path: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw error
  }

  return true
}

// Función para obtener una URL pública desde el cliente
export function getPublicUrl(bucket: string, path: string) {
  const supabase = getSupabaseClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

// Función para obtener una URL firmada desde el cliente
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60, // segundos
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    throw error
  }

  return data.signedUrl
}

// Funciones para el servidor

// Función para subir un archivo desde el servidor
export async function uploadFileServer(
  bucket: string,
  fileBuffer: Buffer,
  fileName: string,
  options: {
    path?: string
    contentType?: string
    isPublic?: boolean
    metadata?: Record<string, string>
  } = {},
) {
  const { path = "", contentType = "application/octet-stream", isPublic = false, metadata = {} } = options

  const supabase = createServiceClient()

  // Generar un nombre de archivo único si no se proporciona
  const finalFileName = fileName || `${uuidv4()}.bin`
  const filePath = path ? `${path}/${finalFileName}` : finalFileName

  // Subir el archivo
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    cacheControl: "3600",
    upsert: false,
    contentType,
    metadata,
  })

  if (error) {
    throw error
  }

  // Obtener la URL pública si es necesario
  let publicUrl = null
  if (isPublic) {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    publicUrl = urlData.publicUrl
  }

  return {
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
    publicUrl,
  }
}

// Función para eliminar un archivo desde el servidor
export async function deleteFileServer(bucket: string, path: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw error
  }

  return true
}
