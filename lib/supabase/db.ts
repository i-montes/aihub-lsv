import { createServiceClient } from "./server"
import type { Database } from "../database.types"

// Tipos para las funciones de consulta
type Table = keyof Database["public"]["Tables"]
type Row<T extends Table> = Database["public"]["Tables"][T]["Row"]
type Insert<T extends Table> = Database["public"]["Tables"][T]["Insert"]
type Update<T extends Table> = Database["public"]["Tables"][T]["Update"]

// Funciones de utilidad para interactuar con la base de datos

// Obtener un registro por ID
export async function getById<T extends Table>(table: T, id: string): Promise<Row<T> | null> {
  const supabase = createServiceClient()
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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()
  const { data: result, error } = await supabase.from(table).insert(data).select().single()

  if (error) {
    console.error(`Error al crear ${table}:`, error)
    return null
  }

  return result as Row<T>
}

// Actualizar un registro existente
export async function update<T extends Table>(table: T, id: string, data: Update<T>): Promise<Row<T> | null> {
  const supabase = createServiceClient()
  const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single()

  if (error) {
    console.error(`Error al actualizar ${table}:`, error)
    return null
  }

  return result as Row<T>
}

// Eliminar un registro
export async function remove<T extends Table>(table: T, id: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error al eliminar ${table}:`, error)
    return false
  }

  return true
}

// Registrar una actividad
export async function logActivity(userId: string, action: string, details?: any): Promise<void> {
  const supabase = createServiceClient()
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
