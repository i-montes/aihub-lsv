"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "./client"
import type { Database } from "../database.types"

// Tipo genérico para las tablas
type Table = keyof Database["public"]["Tables"]
type Row<T extends Table> = Database["public"]["Tables"][T]["Row"]

// Hook para obtener datos de una tabla con suscripción a cambios en tiempo real
export function useRealtimeData<T extends Table>(
  table: T,
  options: {
    filters?: Record<string, any>
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
    realtimeEnabled?: boolean
  } = {},
) {
  const { filters = {}, limit, orderBy, realtimeEnabled = true } = options
  const [data, setData] = useState<Row<T>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    setIsLoading(true)

    // Función para cargar los datos
    const loadData = async () => {
      try {
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

        // Aplicar límite
        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setData(data as Row<T>[])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    // Cargar datos iniciales
    loadData()

    // Configurar suscripción en tiempo real si está habilitada
    let subscription: ReturnType<typeof supabase.channel> | null = null

    if (realtimeEnabled) {
      subscription = supabase
        .channel(`${table}-changes`)
        .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
          // Actualizar los datos según el tipo de evento
          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new as Row<T>])
          } else if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item) => ((item as any).id === payload.new.id ? (payload.new as Row<T>) : item)),
            )
          } else if (payload.eventType === "DELETE") {
            setData((prev) => prev.filter((item) => (item as any).id !== payload.old.id))
          }
        })
        .subscribe()
    }

    // Limpiar suscripción al desmontar
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, JSON.stringify(filters), limit, JSON.stringify(orderBy), realtimeEnabled])

  return { data, isLoading, error, refresh: () => setIsLoading(true) }
}

// Hook para obtener un solo registro por ID con suscripción a cambios
export function useRealtimeRecord<T extends Table>(
  table: T,
  id: string | null,
  options: {
    realtimeEnabled?: boolean
  } = {},
) {
  const { realtimeEnabled = true } = options
  const [data, setData] = useState<Row<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      setIsLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    setIsLoading(true)

    // Función para cargar los datos
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

        if (error) {
          throw error
        }

        setData(data as Row<T>)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Cargar datos iniciales
    loadData()

    // Configurar suscripción en tiempo real si está habilitada
    let subscription: ReturnType<typeof supabase.channel> | null = null

    if (realtimeEnabled) {
      subscription = supabase
        .channel(`${table}-${id}-changes`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: `id=eq.${id}` }, (payload) => {
          setData(payload.new as Row<T>)
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table, filter: `id=eq.${id}` }, () => {
          setData(null)
        })
        .subscribe()
    }

    // Limpiar suscripción al desmontar
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, id, realtimeEnabled])

  return { data, isLoading, error, refresh: () => setIsLoading(true) }
}
