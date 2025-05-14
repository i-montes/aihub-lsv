// Re-exportar todo desde un solo punto de entrada
export * from "./client"
export * from "./server"
export * from "./auth-actions"
export * from "./db"
export * from "./hooks"

// Exportar el tipo Database
export type { Database } from "../database.types"
