"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Shield,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
  Building,
  Globe,
  FileText,
  ClipboardList,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export default function SettingsLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, logout } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: false,
    system: false,
  })

  const isAdmin = profile?.role === "OWNER" || profile?.role === "WORKSPACE_ADMIN"

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {})
      logout()
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

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
                  title="Cuenta"
                  expanded={expandedGroups.account}
                  onToggle={() => toggleGroup("account")}
                />
                {expandedGroups.account && (
                  <>
                    <SettingsMenuItem
                      icon={<User size={18} />}
                      title="Perfil"
                      active={pathname === "/dashboard/settings/profile"}
                      onClick={() => router.push("/dashboard/settings/profile")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Shield size={18} />}
                      title="Seguridad"
                      active={pathname === "/dashboard/settings/security"}
                      onClick={() => router.push("/dashboard/settings/security")}
                      indented
                    />
                  </>
                )}
              </div>

              {/* Organization Group */}
              <div className="space-y-1">
                <SettingsMenuGroup
                  title="Organización"
                  expanded={expandedGroups.organization}
                  onToggle={() => toggleGroup("organization")}
                />
                {expandedGroups.organization && (
                  <>
                    <SettingsMenuItem
                      icon={<Building size={18} />}
                      title="Información General"
                      active={pathname === "/dashboard/settings/general-information"}
                      onClick={() => router.push("/dashboard/settings/general-information")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Users size={18} />}
                      title="Lista de Usuarios"
                      active={pathname === "/dashboard/settings/user-list"}
                      onClick={() => router.push("/dashboard/settings/user-list")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<MessageSquare size={18} />}
                      title="Integraciones"
                      active={pathname === "/dashboard/settings/integrations"}
                      onClick={() => router.push("/dashboard/settings/integrations")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<FileText size={18} />}
                      title="Prompts"
                      active={pathname === "/dashboard/settings/prompts"}
                      onClick={() => router.push("/dashboard/settings/prompts")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Globe size={18} />}
                      title="Wordpress"
                      active={pathname === "/dashboard/settings/wordpress"}
                      onClick={() => router.push("/dashboard/settings/wordpress")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<CreditCard size={18} />}
                      title="Facturación"
                      active={pathname === "/dashboard/settings/billing"}
                      onClick={() => router.push("/dashboard/settings/billing")}
                      indented
                    />
                  </>
                )}
              </div>

              {/* System Group - Solo visible para administradores */}
              {isAdmin && (
                <div className="space-y-1">
                  <SettingsMenuGroup
                    title="Sistema"
                    expanded={expandedGroups.system}
                    onToggle={() => toggleGroup("system")}
                  />
                  {expandedGroups.system && (
                    <>
                      <SettingsMenuItem
                        icon={<ClipboardList size={18} />}
                        title="Registros de Auditoría"
                        active={pathname === "/dashboard/settings/audit-logs"}
                        onClick={() => router.push("/dashboard/settings/audit-logs")}
                        indented
                      />
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
      <div className="w-full md:w-3/4">{children}</div>
    </div>
  )
}

function SettingsMenuGroup({ title, expanded, onToggle }) {
  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-gray-100"
      onClick={onToggle}
    >
      <span className="font-medium">{title}</span>
      <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
    </button>
  )
}

function SettingsMenuItem({ icon, title, active = false, onClick, className = "", indented = false }) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        active ? "bg-sidebar text-white" : `text-gray-700 hover:bg-gray-100 ${className}`
      } ${indented ? "pl-6" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </button>
  )
}
