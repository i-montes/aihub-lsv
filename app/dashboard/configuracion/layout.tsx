"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plug,
  Wrench,
  BookOpen,
  FileCheck,
  FileText,
  Rss as RssIcon,
  Home,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// Componente para el icono de X/Twitter
function XIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0.254 0.25 500 451.954" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"
        fill="currentColor"
      />
    </svg>
  )
}

// Componente para elementos de navegación de documentación
function DocNavItem({ icon, label, href, isActive = false, isSubItem = false }: {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  isSubItem?: boolean
}) {
  return (
    <Link href={href} className="w-full">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer doc-nav-item doc-item-animate
          ${isActive ? "bg-primary-600 text-white" : "text-gray-600 hover:text-primary-600 hover:bg-gray-100"}
          ${isSubItem ? "ml-4 py-1.5" : ""}
        `}
      >
        <div className="flex-shrink-0">{icon}</div>
        <span className={`ml-3 font-medium transition-opacity duration-200 ${isSubItem ? "text-sm" : ""}`}>{label}</span>
      </div>
    </Link>
  )
}

// Componente para secciones de documentación
function DocSection({ title, icon, isOpen, onToggle, children }: {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-3 text-gray-700 hover:text-primary-600 font-semibold text-sm doc-section-button"
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="ml-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

// Componente de barra lateral de documentación
function DocumentationSidebar({ expandedGroups, toggleGroup, pathname }: {
  expandedGroups: { [key: string]: boolean }
  toggleGroup: (group: string) => void
  pathname: string
}) {
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-4">Documentación</h3>
          
          {/* Sección Configuraciones */}
          <DocSection
            title="Configuraciones"
            icon={<Settings className="size-4" />}
            isOpen={expandedGroups.configuraciones}
            onToggle={() => toggleGroup('configuraciones')}
          >
            <DocNavItem
              icon={<Plug className="size-4" />}
              label="Integraciones"
              href="/dashboard/configuracion/documentacion/configuraciones/integraciones"
              isActive={pathname.includes('/documentacion/configuraciones/integraciones')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<Wrench className="size-4" />}
              label="Herramientas"
              href="/dashboard/configuracion/documentacion/configuraciones/herramientas"
              isActive={pathname.includes('/documentacion/configuraciones/herramientas')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<BookOpen className="size-4" />}
              label="WordPress"
              href="/dashboard/configuracion/documentacion/configuraciones/wordpress"
              isActive={pathname.includes('/documentacion/configuraciones/wordpress')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<Users className="size-4" />}
              label="Lista de usuarios"
              href="/dashboard/configuracion/documentacion/configuraciones/usuarios"
              isActive={pathname.includes('/documentacion/configuraciones/usuarios')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<Building className="size-4" />}
              label="Información general"
              href="/dashboard/configuracion/documentacion/configuraciones/organizacion"
              isActive={pathname.includes('/documentacion/configuraciones/organizacion')}
              isSubItem={true}
            />
          </DocSection>

          {/* Sección Cuenta */}
          <DocSection
            title="Cuenta"
            icon={<User className="size-4" />}
            isOpen={expandedGroups.cuenta}
            onToggle={() => toggleGroup('cuenta')}
          >
            <DocNavItem
              icon={<User className="size-4" />}
              label="Perfil personal"
              href="/dashboard/configuracion/documentacion/cuenta/perfil"
              isActive={pathname.includes('/documentacion/cuenta/perfil')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<Shield className="size-4" />}
              label="Seguridad"
              href="/dashboard/configuracion/documentacion/cuenta/seguridad"
              isActive={pathname.includes('/documentacion/cuenta/seguridad')}
              isSubItem={true}
            />
          </DocSection>

          {/* Sección Herramientas */}
          <DocSection
            title="Herramientas"
            icon={<Wrench className="size-4" />}
            isOpen={expandedGroups.herramientas}
            onToggle={() => toggleGroup('herramientas')}
          >
            <DocNavItem
              icon={<FileCheck className="size-4" />}
              label="Corrector"
              href="/dashboard/configuracion/documentacion/herramientas/corrector"
              isActive={pathname.includes('/documentacion/herramientas/corrector')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<XIcon className="size-4" />}
              label="Hilos"
              href="/dashboard/configuracion/documentacion/herramientas/hilos"
              isActive={pathname.includes('/documentacion/herramientas/hilos')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<FileText className="size-4" />}
              label="Resúmenes"
              href="/dashboard/configuracion/documentacion/herramientas/resumenes"
              isActive={pathname.includes('/documentacion/herramientas/resumenes')}
              isSubItem={true}
            />
            <DocNavItem
              icon={<RssIcon className="size-4" />}
              label="Newsletter"
              href="/dashboard/configuracion/documentacion/herramientas/newsletter"
              isActive={pathname.includes('/documentacion/herramientas/newsletter')}
              isSubItem={true}
            />
          </DocSection>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: true,
  })
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [docExpandedGroups, setDocExpandedGroups] = useState({
    configuraciones: true,
    cuenta: false,
    herramientas: false
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const toggleDocGroup = (group: string) => {
    setDocExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const toggleDocumentation = () => {
    const newShowDocumentation = !showDocumentation
    setShowDocumentation(newShowDocumentation)
    
    // Navegación automática basada en el estado de documentación
    if (newShowDocumentation) {
      // Al activar documentación, navegar a la página de introducción
      router.push("/dashboard/configuracion/documentacion")
    } else {
      // Al desactivar documentación, regresar a la página principal de configuración
      router.push("/dashboard/configuracion")
    }
  }

  // Función para manejar clics en elementos del menú (excepto Documentación)
  const handleMenuItemClick = (route: string) => {
    // Si la documentación está activa, desactivarla
    if (showDocumentation) {
      setShowDocumentation(false)
    }
    // Navegar a la ruta especificada
    router.push(route)
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {})
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const { profile } = useAuth()

  return (
    <div className="flex flex-col lg:flex-row gap-6">
        {/* Menú vertical */}
        <div className={`settings-menu-transition ${showDocumentation ? 'w-full lg:w-1/5' : 'w-full lg:w-1/4'} ${showDocumentation ? 'hidden md:block' : ''}`}>
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold mb-2">Configuración</h2>
                {showDocumentation && (
                  <button
                    onClick={toggleDocumentation}
                    className="text-gray-500 hover:text-gray-700 transition-colors documentation-transition"
                    title="Cerrar documentación"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
              </div>

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
                      onClick={() => handleMenuItemClick("/dashboard/configuracion/perfil")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Shield size={18} />}
                      title="Security"
                      active={pathname === "/dashboard/configuracion/seguridad"}
                      onClick={() => handleMenuItemClick("/dashboard/configuracion/seguridad")}
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
                        onClick={() => handleMenuItemClick("/dashboard/configuracion/informacion-general")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Users size={18} />}
                        title="User List"
                        active={pathname === "/dashboard/configuracion/lista-usuarios"}
                        onClick={() => handleMenuItemClick("/dashboard/configuracion/lista-usuarios")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Sparkles size={18} />}
                        title="Integrations"
                        active={pathname === "/dashboard/configuracion/integraciones"}
                        onClick={() => handleMenuItemClick("/dashboard/configuracion/integraciones")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Tool size={18} />}
                        title="Herramientas"
                        active={pathname === "/dashboard/configuracion/herramientas"}
                        onClick={() => handleMenuItemClick("/dashboard/configuracion/herramientas")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Globe size={18} />}
                        title="Wordpress"
                        active={pathname === "/dashboard/configuracion/wordpress"}
                        onClick={() => handleMenuItemClick("/dashboard/configuracion/wordpress")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<BookAIcon size={18} />}
                        title="Documentación"
                        active={showDocumentation}
                        onClick={toggleDocumentation}
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

      {/* Barra lateral de documentación */}
      {showDocumentation && (
        <div className="w-full lg:w-1/5 order-first lg:order-none documentation-transition doc-section-animate">
          <DocumentationSidebar 
            expandedGroups={docExpandedGroups}
            toggleGroup={toggleDocGroup}
            pathname={pathname}
          />
        </div>
      )}

      {/* Contenido de configuración */}
      <div className={`settings-content-transition ${showDocumentation ? 'w-full lg:w-3/5' : 'w-full lg:w-3/4'}`}>
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50/30">
            {showDocumentation ? (
              <ScrollArea className="h-[calc(100vh-170px)] w-full">
                <div className="pr-4">
                  {children}
                </div>
              </ScrollArea>
            ) : (
              children
            )}
          </CardContent>
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
          ? "Información general"
          : title === "User List"
            ? "Lista de usuarios"
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
