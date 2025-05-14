import { FitnessLayout } from "@/components/fitness-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Megaphone, Bell, Instagram, Check, AlertCircle } from "lucide-react"

// Datos de ejemplo para las notificaciones
const notifications = [
  {
    id: 1,
    type: "message",
    title: "Nuevo mensaje de María García",
    description: "Hola, ¿cómo estás? Quería saber más sobre...",
    time: "Hace 5 minutos",
    date: "today",
    read: false,
    platform: "whatsapp",
  },
  {
    id: 2,
    type: "subscribers",
    title: "5 nuevos suscriptores",
    description: "Tu lista de contactos está creciendo",
    time: "Hace 30 minutos",
    date: "today",
    read: false,
    platform: "all",
  },
  {
    id: 3,
    type: "campaign",
    title: 'Campaña "Descuento" enviada',
    description: "La campaña se ha enviado a 2,800 destinatarios",
    time: "Hace 2 horas",
    date: "today",
    read: true,
    platform: "all",
  },
  {
    id: 4,
    type: "message",
    title: "Nuevo mensaje de Juan Pérez",
    description: "¿Podemos hablar sobre el nuevo producto?",
    time: "Hace 4 horas",
    date: "today",
    read: true,
    platform: "instagram",
  },
  {
    id: 5,
    type: "campaign",
    title: 'Campaña "Bienvenida" programada',
    description: "La campaña está programada para mañana a las 10:00 AM",
    time: "Hace 6 horas",
    date: "today",
    read: true,
    platform: "all",
  },
  {
    id: 6,
    type: "message",
    title: "Nuevo mensaje de Ana Martínez",
    description: "Gracias por la información",
    time: "Ayer, 15:30",
    date: "yesterday",
    read: true,
    platform: "messenger",
  },
  {
    id: 7,
    type: "alert",
    title: "Tasa de respuesta por debajo del objetivo",
    description: "Tu tasa de respuesta ha bajado al 85%",
    time: "Ayer, 10:15",
    date: "yesterday",
    read: true,
    platform: "all",
  },
  {
    id: 8,
    type: "subscribers",
    title: "10 nuevos suscriptores",
    description: "Tu lista de contactos está creciendo",
    time: "Hace 2 días",
    date: "this_week",
    read: true,
    platform: "all",
  },
  {
    id: 9,
    type: "campaign",
    title: 'Campaña "Promoción Mensual" completada',
    description: "Tasa de apertura: 68%, Tasa de clics: 42%",
    time: "Hace 3 días",
    date: "this_week",
    read: true,
    platform: "all",
  },
  {
    id: 10,
    type: "alert",
    title: "Actualización del sistema",
    description: "Se ha actualizado el sistema a la versión 2.5.0",
    time: "Hace 1 semana",
    date: "earlier",
    read: true,
    platform: "all",
  },
]

export default function NotificationsPage() {
  // Agrupar notificaciones por fecha
  const today = notifications.filter((n) => n.date === "today")
  const yesterday = notifications.filter((n) => n.date === "yesterday")
  const thisWeek = notifications.filter((n) => n.date === "this_week")
  const earlier = notifications.filter((n) => n.date === "earlier")

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <FitnessLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-gray-500">Mantente al día con tus actividades recientes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-sidebar text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Bell size={14} />
              <span>{unreadCount} no leídas</span>
            </div>
            <button className="text-sm text-sidebar hover:underline">Marcar todas como leídas</button>
          </div>
        </div>

        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Centro de Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Hoy */}
              {today.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Hoy</h3>
                  <div className="space-y-3">
                    {today.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Ayer */}
              {yesterday.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Ayer</h3>
                  <div className="space-y-3">
                    {yesterday.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Esta semana */}
              {thisWeek.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Esta semana</h3>
                  <div className="space-y-3">
                    {thisWeek.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Anteriores */}
              {earlier.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Anteriores</h3>
                  <div className="space-y-3">
                    {earlier.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FitnessLayout>
  )
}

function NotificationItem({ notification }) {
  // Determinar el icono y color según el tipo de notificación
  let icon
  let bgColor
  let textColor = "text-white"

  switch (notification.type) {
    case "message":
      icon = <MessageSquare size={16} />
      bgColor = "bg-coral"
      break
    case "subscribers":
      icon = <Users size={16} />
      bgColor = "bg-yellow"
      textColor = "text-sidebar"
      break
    case "campaign":
      icon = <Megaphone size={16} />
      bgColor = "bg-sidebar"
      break
    case "alert":
      icon = <AlertCircle size={16} />
      bgColor = "bg-red-500"
      break
    default:
      icon = <Bell size={16} />
      bgColor = "bg-gray-500"
  }

  // Determinar el icono de la plataforma
  let platformIcon
  switch (notification.platform) {
    case "whatsapp":
      platformIcon = <MessageSquare size={12} className="text-sidebar" />
      break
    case "instagram":
      platformIcon = <Instagram size={12} className="text-coral" />
      break
    case "messenger":
      platformIcon = <MessageSquare size={12} className="text-yellow" />
      break
    default:
      platformIcon = null
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        notification.read ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center ${textColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`font-medium ${notification.read ? "" : "text-sidebar"}`}>{notification.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
          </div>
          {!notification.read && <div className="w-2 h-2 bg-coral rounded-full flex-shrink-0 mt-2"></div>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{notification.time}</span>
            {platformIcon && (
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">{platformIcon}</div>
            )}
          </div>
          <button className="text-xs text-sidebar hover:underline flex items-center gap-1">
            <Check size={12} />
            Marcar como leída
          </button>
        </div>
      </div>
    </div>
  )
}
