"use client"

import { Search, ChevronDown, Settings, LogOut, Bell, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const dropdownRef = useRef<any>(null)
  const buttonRef = useRef<any>(null)
  const notificationsRef = useRef<any>(null)
  const notificationsButtonRef = useRef<any>(null)
  const { user, profile, signOut } = useAuth()

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
  }

  // Get user's display name
  const displayName =
    profile?.name ||
    (user?.user_metadata ? user.user_metadata.name : null) ||
    (user?.email ? user.email.split("@")[0] : "Usuario")

  return (
    <header className="p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>

        <div className="flex items-center space-x-4">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input className="pl-10 w-[300px] bg-gray-50 border-gray-100" placeholder="Buscar contenido" />
          </div>

          <div className="relative">
            <button
              ref={notificationsButtonRef}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 relative"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {isNotificationsOpen && (
              <div
                ref={notificationsRef}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium">Notificaciones</h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mr-3 flex-shrink-0">
                        <Bell size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nuevo artículo disponible</p>
                        <p className="text-xs text-gray-500">
                          Hemos publicado un nuevo artículo sobre técnicas de escritura
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Hace 5 minutos</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                        <Settings size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Actualización de la plataforma</p>
                        <p className="text-xs text-gray-500">Hemos mejorado el generador de hilos para Twitter</p>
                        <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mr-3 flex-shrink-0">
                        <Bell size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Recordatorio</p>
                        <p className="text-xs text-gray-500">No olvides revisar tu artículo programado para mañana</p>
                        <p className="text-xs text-gray-400 mt-1">Hace 1 día</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 border-t border-gray-100">
                  <Link
                    href="/dashboard/notificaciones"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium block text-center"
                  >
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div> */}

          <Link href="/dashboard/soporte">
            <Button variant="ghost" className="flex items-center gap-2">
              <HelpCircle size={16} />
              ¿Necesitas ayuda?
            </Button>
          </Link>

          <div className="relative">
            <div
              ref={buttonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white rounded-full py-1 px-3 cursor-pointer hover:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-white border overflow-hidden flex-shrink-0">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : user?.user_metadata?.avatar ? (
                  <img
                    src={`https://api.dicebear.com/9.x/bottts/jpg?seed=${user?.id}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={`https://api.dicebear.com/9.x/bottts/jpg?seed=${user?.id}`} alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="font-medium">{displayName}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100"
              >
                <Link
                  href="/dashboard/configuracion"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut size={16} className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
