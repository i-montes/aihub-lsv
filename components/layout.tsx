"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessagesPage = pathname === "/messages"
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    // Only check authentication after the initial loading is complete
    if (!loading) {
      if (!isAuthenticated) {
        toast.error("Sesión no válida. Por favor inicia sesión nuevamente.")
        router.push("/login")
      }
    }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Render the layout if authenticated
  return (
    <div className="h-screen w-screen flex overflow-hidden dashboard-layout">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 container ${isMessagesPage ? "p-0 overflow-hidden" : "p-6 overflow-auto"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
