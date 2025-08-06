"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { 
  BookOpen, 
  FileCheck, 
  FileText, 
  RssIcon, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  Home,
  Search,
  Menu,
  Plug,
  Wrench,
  Users,
  Building,
  User,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

interface DocNavItemProps {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  isExpanded?: boolean
  isSubItem?: boolean
}

function DocNavItem({ icon, label, href, isActive = false, isExpanded = false, isSubItem = false }: DocNavItemProps) {
  return (
    <Link href={href} className="w-full">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? "bg-primary-600 text-white" : "text-gray-600 hover:text-primary-600 hover:bg-gray-100"}
          ${isExpanded ? "justify-start" : "justify-center"}
          ${isSubItem ? "ml-4 py-1.5" : ""}
        `}
      >
        <div className="flex-shrink-0">{icon}</div>
        {isExpanded && <span className={`ml-3 font-medium transition-opacity duration-200 ${isSubItem ? "text-sm" : ""}`}>{label}</span>}
      </div>
    </Link>
  )
}

interface DocSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function DocSection({ title, icon, isExpanded, isOpen, onToggle, children }: DocSectionProps) {
  return (
    <div className="mb-2">
      {isExpanded && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between py-2 px-3 text-gray-700 hover:text-primary-600 font-semibold text-sm"
        >
          <div className="flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      {(!isExpanded || isOpen) && (
        <div className={`${isExpanded ? "ml-2" : ""} space-y-1`}>
          {children}
        </div>
      )}
    </div>
  )
}

function DocSidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [openSections, setOpenSections] = useState({
    configuraciones: true,
    cuenta: false,
    herramientas: false
  })

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className={`h-full py-4 sm:py-6 transition-all duration-300 ml-2 ${isExpanded ? "w-[280px]" : "w-[70px]"}`}>
      <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm py-4 px-2 relative justify-between">
        {/* Contenido superior */}
        <div className="flex flex-col">
          {/* Logo */}
          <div className="flex justify-center items-center mb-6">
            {isExpanded && <span className="mr-2 font-bold text-lg transition-opacity duration-200">Documentación</span>}
          </div>

          {/* Botón para expandir/contraer */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-12 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-700 transition-colors"
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Navegación por secciones */}
          <div className="flex flex-col mt-4 space-y-2">
            {/* Sección Configuraciones */}
            <DocSection
              title="Configuraciones"
              icon={<Settings className="size-4" />}
              isExpanded={isExpanded}
              isOpen={openSections.configuraciones}
              onToggle={() => toggleSection('configuraciones')}
            >
              <DocNavItem
                icon={<Plug className="size-4" />}
                label="Integraciones"
                href="/documentacion/configuraciones/integraciones"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<Wrench className="size-4" />}
                label="Herramientas"
                href="/documentacion/configuraciones/herramientas"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<BookOpen className="size-4" />}
                label="WordPress"
                href="/documentacion/configuraciones/wordpress"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<Users className="size-4" />}
                label="Lista de Usuarios"
                href="/documentacion/configuraciones/usuarios"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<Building className="size-4" />}
                label="Información General"
                href="/documentacion/configuraciones/organizacion"
                isExpanded={isExpanded}
                isSubItem={true}
              />
            </DocSection>

            {/* Sección Cuenta */}
            <DocSection
              title="Cuenta"
              icon={<User className="size-4" />}
              isExpanded={isExpanded}
              isOpen={openSections.cuenta}
              onToggle={() => toggleSection('cuenta')}
            >
              <DocNavItem
                icon={<User className="size-4" />}
                label="Perfil Personal"
                href="/documentacion/cuenta/perfil"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<Shield className="size-4" />}
                label="Seguridad"
                href="/documentacion/cuenta/seguridad"
                isExpanded={isExpanded}
                isSubItem={true}
              />
            </DocSection>

            {/* Sección Herramientas */}
            <DocSection
              title="Herramientas"
              icon={<Wrench className="size-4" />}
              isExpanded={isExpanded}
              isOpen={openSections.herramientas}
              onToggle={() => toggleSection('herramientas')}
            >
              <DocNavItem
                icon={<FileCheck className="size-4" />}
                label="Corrector"
                href="/documentacion/herramientas/corrector"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<XIcon className="size-4" />}
                label="Hilos"
                href="/documentacion/herramientas/hilos"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<FileText className="size-4" />}
                label="Resúmenes"
                href="/documentacion/herramientas/resumenes"
                isExpanded={isExpanded}
                isSubItem={true}
              />
              <DocNavItem
                icon={<RssIcon className="size-4" />}
                label="Newsletter"
                href="/documentacion/herramientas/newsletter"
                isExpanded={isExpanded}
                isSubItem={true}
              />
            </DocSection>
          </div>
        </div>

        {/* Volver al dashboard */}
        <div className="mt-4">
          <DocNavItem
            icon={<Home className="size-5" />}
            label="Volver al Dashboard"
            href="/dashboard"
            isExpanded={isExpanded}
          />
        </div>
      </div>
    </div>
  )
}

function DocHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Título y breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
            <p className="text-sm text-gray-500">Guía completa de KIT.AI</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar en la documentación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          {/* Botón de menú móvil */}
          <Button variant="outline" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default function DocumentacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DocSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DocHeader />
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}