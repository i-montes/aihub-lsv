"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Shield,
  CreditCard,
  Users,
  LogOut,
  ChevronRight,
  Building,
  Globe,
  Sparkles,
  PenToolIcon as Tool,
  BookAIcon,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: true,
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const { profile } = useAuth()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Menú vertical */}
      <div className="w-full md:w-1/4">
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-2">Configuración</h2>

              {/* Account Group */}
              <div className="space-y-1">
                <SettingsMenuGroup
                  title="Account"
                  expanded={expandedGroups.account}
                  onToggle={() => toggleGroup("account")}
                />
                {expandedGroups.account && (
                  <>
                    <SettingsMenuItem
                      icon={<User size={18} />}
                      title="Profile"
                      active={pathname === "/dashboard/configuracion/perfil"}
                      onClick={() => router.push("/dashboard/configuracion/perfil")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Shield size={18} />}
                      title="Security"
                      active={pathname === "/dashboard/configuracion/seguridad"}
                      onClick={() => router.push("/dashboard/configuracion/seguridad")}
                      indented
                    />
                  </>
                )}
              </div>

              {/* Organization Group */}
              {profile && (profile.role === "OWNER" || profile.role === "ADMIN") && (
                <div className="space-y-1">
                  <SettingsMenuGroup
                    title="Organization"
                    expanded={expandedGroups.organization}
                    onToggle={() => toggleGroup("organization")}
                  />
                  {expandedGroups.organization && (
                    <>
                      <SettingsMenuItem
                        icon={<Building size={18} />}
                        title="General Information"
                        active={pathname === "/dashboard/configuracion/informacion-general"}
                        onClick={() => router.push("/dashboard/configuracion/informacion-general")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Users size={18} />}
                        title="User List"
                        active={pathname === "/dashboard/configuracion/lista-usuarios"}
                        onClick={() => router.push("/dashboard/configuracion/lista-usuarios")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Sparkles size={18} />}
                        title="Integrations"
                        active={pathname === "/dashboard/configuracion/integraciones"}
                        onClick={() => router.push("/dashboard/configuracion/integraciones")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Tool size={18} />}
                        title="Herramientas"
                        active={pathname === "/dashboard/configuracion/herramientas"}
                        onClick={() => router.push("/dashboard/configuracion/herramientas")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Globe size={18} />}
                        title="Wordpress"
                        active={pathname === "/dashboard/configuracion/wordpress"}
                        onClick={() => router.push("/dashboard/configuracion/wordpress")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<BookAIcon size={18} />}
                        title="Documentación"
                        active={pathname === "/documentacion"}
                        onClick={() => router.push("/documentacion")}
                        indented
                      />
                      {/* <SettingsMenuItem
                        icon={<CreditCard size={18} />}
                        title="Billing & Usage"
                        active={pathname === "/dashboard/configuracion/facturacion"}
                        onClick={() => router.push("/dashboard/configuracion/facturacion")}
                        indented
                      /> */}
                    </>
                  )}
                </div>
              )}

              <div className="pt-4 mt-4 border-t">
                <SettingsMenuItem
                  icon={<LogOut size={18} />}
                  title="Cerrar Sesión"
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-red-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido de configuración */}
      <div className="w-full md:w-3/4">
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50/30">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsMenuGroup({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
  // Traducir el título si es necesario
  const translatedTitle = title === "Account" ? "Cuenta" : title === "Organization" ? "Organización" : title

  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-gray-100"
      onClick={onToggle}
    >
      <span className="font-medium">{translatedTitle}</span>
      <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
    </button>
  )
}

function SettingsMenuItem({
  icon,
  title,
  active = false,
  onClick,
  className = "",
  indented = false,
}: {
  icon: React.ReactNode
  title: string
  active?: boolean
  onClick: () => void
  className?: string
  indented?: boolean
}) {
  const translatedTitle =
    title === "Profile"
      ? "Perfil"
      : title === "Security"
        ? "Seguridad"
        : title === "General Information"
          ? "Información General"
          : title === "User List"
            ? "Lista de Usuarios"
            : title === "Integrations"
              ? "Integraciones"
              : title === "Billing & Usage"
                ? "Facturación y Uso"
                : title
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        active ? "bg-sidebar text-white" : `text-gray-700 hover:bg-gray-100 ${className}`
      } ${indented ? "pl-6" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{translatedTitle}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </button>
  )
}
