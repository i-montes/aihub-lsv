"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, BarChart, Megaphone, Users, ChevronRight, ChevronLeft, CheckSquare, Home } from "lucide-react"

// Añadir el componente ThreadsIcon
const ThreadsIcon = ({ className }) => (
  <svg fill="none" viewBox="0.254 0.25 500 451.954" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"
      fill="currentColor"
    />
  </svg>
)
import Link from "next/link"

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="flex flex-col items-center py-4 sm:py-6 h-full overflow-hidden">
      {/* Logo del dashboard */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-center">
          <img src="/dynamic-triangle-fitness.png" alt="Be.run Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </div>

      {/* Contenedor principal con bordes redondeados */}
      <div
        className={`flex flex-col items-center bg-white py-4 sm:py-6 gap-4 sm:gap-6 md:gap-8 ml-2 sm:ml-4 md:ml-6 transition-all duration-300 ease-in-out
    ${
      expanded
        ? "w-[180px] sm:w-[200px] md:w-[220px] items-start px-4 rounded-xl"
        : "w-[40px] sm:w-[50px] md:w-[60px] rounded-full"
    }`}
      >
        {/* Iconos de navegación */}
        <div className={`flex flex-col ${expanded ? "w-full" : "items-center"} gap-4 sm:gap-6 md:gap-8`}>
          <NavItem
            icon={<Home className="size-3.5 sm:size-4 md:size-5" />}
            href="/dashboard"
            isActive={pathname === "/dashboard"}
            label="Inicio"
            expanded={expanded}
          />
          <NavItem
            icon={<BarChart className="size-3.5 sm:size-4 md:size-5" />}
            href="/dashboard/analytics"
            isActive={pathname === "/dashboard/analytics"}
            label="Analíticas"
            expanded={expanded}
          />
          <NavItem
            icon={<CheckSquare className="size-3.5 sm:size-4 md:size-5" />}
            href="/dashboard/corrections"
            isActive={pathname === "/dashboard/corrections"}
            label="Corrector"
            expanded={expanded}
          />
          <NavItem
            icon={<ThreadsIcon className="size-3.5 sm:size-4 md:size-5" />}
            href="/dashboard/threads"
            isActive={pathname === "/dashboard/threads"}
            label="Threads"
            expanded={expanded}
          />
        </div>
      </div>

      {/* Botón para expandir/colapsar el sidebar */}
      <div className="mt-4 sm:mt-6">
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer bg-white text-gray-500 hover:text-whatsapp hover:bg-gray-100"
          aria-label={expanded ? "Colapsar menú" : "Expandir menú"}
        >
          {expanded ? (
            <ChevronLeft className="size-3.5 sm:size-4 md:size-5" />
          ) : (
            <ChevronRight className="size-3.5 sm:size-4 md:size-5" />
          )}
        </button>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  href: string
  isActive?: boolean
  label: string
  expanded?: boolean
}

function NavItem({ icon, href, isActive = false, label, expanded = false }: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <Link href={href} className="w-full relative group">
      <div
        className={`flex items-center ${expanded ? "justify-start" : "justify-center"} cursor-pointer rounded-full
          ${isActive ? "bg-whatsapp text-white" : "text-gray-500 hover:text-whatsapp hover:bg-gray-100"}
          ${expanded ? "px-3 py-2" : "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"}`}
        onMouseEnter={() => !expanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
        {expanded && <span className="ml-3 text-sm font-medium truncate">{label}</span>}
      </div>

      {/* Tooltip */}
      {!expanded && showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {label}
            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      )}
    </Link>
  )
}

interface NotificationsItemProps {
  icon: React.ReactNode
  isActive?: boolean
}

function NotificationsItem({ icon, isActive = false }: NotificationsItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      <Link href="/dashboard/notifications">
        <div
          ref={buttonRef}
          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer 
          ${isActive ? "bg-whatsapp text-white" : "text-gray-500 hover:text-whatsapp hover:bg-gray-100"}`}
        >
          {icon}
        </div>
      </Link>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed left-[80px] top-[200px] z-[9999] origin-top-left animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ position: "fixed", left: "80px", top: "200px" }}
        >
          <div className="w-64 bg-white rounded-xl shadow-lg py-2 border border-gray-200">
            <div className="px-4 py-2 border-b">
              <h3 className="font-medium text-sm">Notificaciones</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-whatsapp rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Nuevo mensaje de María García</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-whatsapp-light rounded-full flex items-center justify-center flex-shrink-0 text-whatsapp-dark">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">5 nuevos suscriptores</p>
                    <p className="text-xs text-gray-500">Hace 30 minutos</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-whatsapp-dark rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    <Megaphone size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Campaña "Descuento" enviada</p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 border-t">
              <Link href="/dashboard/notifications" className="text-xs text-whatsapp hover:underline block text-center">
                Ver todas las notificaciones
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
