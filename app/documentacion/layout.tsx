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
  Menu
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
}

function DocNavItem({ icon, label, href, isActive = false, isExpanded = false }: DocNavItemProps) {
  return (
    <Link href={href} className="w-full">
      <div
        className={`flex items-center py-3 px-3 rounded-xl cursor-pointer transition-all duration-200
          ${isActive ? "bg-primary-600 text-white" : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"}
          ${isExpanded ? "justify-start" : "justify-center"}
        `}
      >
        <div className="flex-shrink-0">{icon}</div>
        {isExpanded && <span className={`ml-3 font-medium transition-opacity duration-200`}>{label}</span>}
      </div>
    </Link>
  )
}

function DocSidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const sections = [
    { id: "overview", label: "Resumen", icon: <BookOpen className="size-5" /> },
    { id: "corrector", label: "Corrector", icon: <FileCheck className="size-5" /> },
    { id: "hilos", label: "Hilos", icon: <XIcon className="size-5" /> },
    { id: "resumenes", label: "Resúmenes", icon: <FileText className="size-5" /> },
    { id: "newsletter", label: "Newsletter", icon: <RssIcon className="size-5" /> },
    { id: "configuracion", label: "Configuración", icon: <Settings className="size-5" /> },
  ]

  return (
    <div className={`h-full py-4 sm:py-6 transition-all duration-300 ml-2 ${isExpanded ? "w-[200px]" : "w-[70px]"}`}>
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

          {/* Navegación de secciones */}
          <div className="flex flex-col items-center gap-2 mt-4">
            {sections.map((section) => (
              <DocNavItem
                key={section.id}
                icon={section.icon}
                label={section.label}
                href={`#${section.id}`}
                isActive={false} // Se puede implementar lógica para detectar sección activa
                isExpanded={isExpanded}
              />
            ))}
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