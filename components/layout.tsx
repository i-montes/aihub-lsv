"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail } from "lucide-react"

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessagesPage = pathname === "/messages"
  const { isAuthenticated, loading, organization, signOut } = useAuth()
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

  // Check if organization is inactive or deleted
  if (organization && (organization.state === "INACTIVE" || organization.state === "DELETED")) {
    const handleBackToLogin = async () => {
      try {
        await signOut()
        router.push("/login")
      } catch (error) {
        console.error("Error signing out:", error)
        router.push("/login")
      }
    }

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cuenta Deshabilitada
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Su cuenta se encuentra temporalmente deshabilitada. Para obtener más información 
              y solicitar la reactivación de su cuenta, por favor contacte a nuestro equipo de soporte.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Contacto de Soporte</span>
              </div>
              <a 
                href="mailto:labdeia@lasillavacia.com" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
              >
                labdeia@lasillavacia.com
              </a>
            </div>
            
            <Button 
              onClick={handleBackToLogin}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Volver al Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render the layout if authenticated and organization is active
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
