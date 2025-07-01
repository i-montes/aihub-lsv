"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Home, BarChart, FileCheck, FileText, ChevronRight, ChevronLeft, Settings } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`h-full py-4 sm:py-6 transition-all duration-300 ml-2 ${isExpanded ? "w-[200px]" : "w-[70px]"}`}>
      <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm py-4 px-2 relative justify-between">
        {/* Contenido superior */}
        <div className="flex flex-col">
          {/* Logo del dashboard */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            {isExpanded && <span className="ml-2 font-bold text-lg transition-opacity duration-200">PressAI</span>}
          </div>

          {/* Botón para expandir/contraer */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-12 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-700 transition-colors"
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Iconos de navegación */}
          <div className="flex flex-col items-center gap-4 mt-4">
            <NavItem
              icon={<Home className="size-5" />}
              label="Inicio"
              href="/dashboard"
              isActive={pathname === "/dashboard"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<FileCheck className="size-5" />}
              label="Corrector"
              href="/dashboard/proofreader"
              isActive={pathname === "/dashboard/proofreader"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<XIcon className="size-5" />}
              label="Hilos"
              href="/dashboard/thread-generator"
              isActive={pathname === "/dashboard/thread-generator"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<FileText className="size-5" />}
              label="Boletín"
              href="/dashboard/newsletter-generator"
              isActive={pathname === "/dashboard/newsletter-generator"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<BarChart className="size-5" />}
              label="Analítica"
              href="/dashboard/analytics"
              isActive={pathname === "/dashboard/analytics"}
              isExpanded={isExpanded}
            />
          </div>
        </div>

        {/* Contenido inferior - Settings */}
        <div className="mt-4">
          <NavItem
            icon={<Settings className="size-5" />}
            label="Ajustes"
            href="/dashboard/settings"
            isActive={pathname.startsWith("/dashboard/settings")}
            isExpanded={isExpanded}
          />
        </div>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  href,
  isActive = false,
  isExpanded = false,
}: {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  isExpanded?: boolean
}) {
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
