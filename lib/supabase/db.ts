import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Tipos para las funciones de consulta
type Table = keyof Database["public"]["Tables"]
type Row<T extends Table> = Database["public"]["Tables"][T]["Row"]
type Insert<T extends Table> = Database["public"]["Tables"][T]["Insert"]
type Update<T extends Table> = Database["public"]["Tables"][T]["Update"]

// Funciones de utilidad para interactuar con la base de datos

// Cliente con rol de servicio (bypass RLS)
export const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Faltan variables de entorno para Supabase")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Obtener un registro por ID
export async function getById<T extends Table>(table: T, id: string): Promise<Row<T> | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

  if (error) {
    console.error(`Error al obtener ${table}:`, error)
    return null
  }

  return data as Row<T>
}

// Obtener múltiples registros con filtros opcionales
export async function getMany<T extends Table>(
  table: T,
  options: {
    filters?: Record<string, any>
    limit?: number
    offset?: number
    orderBy?: { column: string; ascending?: boolean }
  } = {},
): Promise<Row<T>[]> {
  const { filters = {}, limit, offset, orderBy } = options
  const supabase = getServiceClient()

  let query = supabase.from(table).select("*")

  // Aplicar filtros
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
    }
  })

  // Aplicar ordenamiento
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
  }

  // Aplicar paginación
  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error al obtener ${table}:`, error)
    return []
  }

  return data as Row<T>[]
}

// Crear un nuevo registro
export async function create<T extends Table>(table: T, data: Insert<T>): Promise<Row<T> | null> {
  const supabase = getServiceClient()
  const { data: result, error } = await supabase.from(table).insert(data).select().single()

  if (error) {
    console.error(`Error al crear ${table}:`, error)
    return null
  }

  return result as Row<T>
}

// Actualizar un registro existente
export async function update<T extends Table>(table: T, id: string, data: Update<T>): Promise<Row<T> | null> {
  const supabase = getServiceClient()
  const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single()

  if (error) {
    console.error(`Error al actualizar ${table}:`, error)
    return null
  }

  return result as Row<T>
}

// Eliminar un registro
export async function remove<T extends Table>(table: T, id: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error al eliminar ${table}:`, error)
    return false
  }

  return true
}

// Registrar una actividad
export async function logActivity(userId: string, action: string, details?: any): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.from("activity").insert({
    id: crypto.randomUUID(),
    userId,
    action,
    details,
    createdAt: new Date().toISOString(),
  })

  if (error) {
    console.error("Error al registrar actividad:", error)
  }
}
