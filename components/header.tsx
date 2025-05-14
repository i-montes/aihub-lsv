"use client"

import { Search, ChevronDown, Settings, LogOut, Bell, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Datos de ejemplo para las notificaciones
const notificationsData = [
  {
    id: 1,
    title: "Nuevo mensaje",
    description: "Has recibido un nuevo mensaje de María García",
    time: "Hace 5 minutos",
    read: false,
  },
  {
    id: 2,
    title: "Recordatorio",
    description: "Tienes una reunión programada para hoy a las 15:00",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: 3,
    title: "Actualización del sistema",
    description: "El sistema se ha actualizado a la versión 2.5.0",
    time: "Hace 3 horas",
    read: true,
  },
  {
    id: 4,
    title: "Nuevo seguidor",
    description: "Juan Pérez ha comenzado a seguirte",
    time: "Ayer",
    read: true,
  },
]

export function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(notificationsData)
  const [userName, setUserName] = useState("Usuario")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("/empowered-trainer.png")

  const supabase = createClientComponentClient()

  const menuRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLDivElement>(null)

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length

  // Obtener información del usuario al cargar el componente
  useEffect(() => {
    async function getUserInfo() {
      try {
        // Obtener la sesión actual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Establecer el email como nombre de usuario por defecto
          setUserEmail(session.user.email || "")

          // Intentar obtener el nombre del usuario desde los metadatos de la sesión
          if (session.user.user_metadata?.name) {
            setUserName(session.user.user_metadata.name || session.user.email?.split("@")[0] || "Usuario")
          } else {
            // Si no hay metadatos, usar la primera parte del email
            setUserName(session.user.email?.split("@")[0] || "Usuario")
          }

          try {
            // Intentar obtener el perfil del usuario, pero manejar el error si ocurre
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, email")
              .eq("id", session.user.id)
              .single()

            // Solo actualizar si se obtuvo el perfil correctamente
            if (profile) {
              setUserName(`${profile.name} ${profile.lastname}` || session.user.email?.split("@")[0] || "Usuario")
              setUserEmail(profile.email || session.user.email || "")
            }
          } catch (profileError) {
            console.error("Error al obtener el perfil:", profileError)
            // No hacer nada, ya tenemos un nombre de usuario por defecto
          }
        }
      } catch (error) {
        console.error("Error al obtener información del usuario:", error)
      }
    }

    getUserInfo()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cerrar menú de perfil si se hace clic fuera
      if (
        showMenu &&
        menuRef.current &&
        profileButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }

      // Cerrar menú de notificaciones si se hace clic fuera
      if (
        showNotifications &&
        notificationsRef.current &&
        notificationButtonRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu, showNotifications])

  // Marcar notificación como leída
  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">¡Hola, {userName}!</h1>
          <p className="text-gray-500">Let's take a look at your activity today</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input className="pl-10 w-[300px] bg-gray-50 border-gray-100" placeholder="Search for health data" />
          </div>

          {/* Icono de notificaciones */}
          <div className="relative">
            <div
              ref={notificationButtonRef}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-coral text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Menú de notificaciones */}
            {showNotifications && (
              <div
                ref={notificationsRef}
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 max-h-[400px] overflow-y-auto"
              >
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notificaciones</p>
                    <p className="text-xs text-gray-500">{unreadCount} no leídas</p>
                  </div>
                  {unreadCount > 0 && (
                    <button className="text-xs text-sidebar hover:underline" onClick={markAllAsRead}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 ${!notification.read ? "bg-gray-50" : ""}`}
                      >
                        <div className="flex justify-between">
                          <p className={`text-sm font-medium ${!notification.read ? "text-sidebar" : ""}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No tienes notificaciones</div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100">
                  <a href="/dashboard/notifications" className="text-xs text-sidebar hover:underline block text-center">
                    Ver todas las notificaciones
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div
              ref={profileButtonRef}
              className="flex items-center space-x-2 bg-white rounded-full py-1 px-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-white border overflow-hidden flex-shrink-0">
                <img src="/empowered-trainer.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium">{userName}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${showMenu ? "transform rotate-180" : ""}`}
              />
            </div>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <a
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </a>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <LogOut size={16} className="mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
