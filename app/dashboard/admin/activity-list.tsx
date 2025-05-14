import { getMany } from "@/lib/supabase/db"
import { getById } from "@/lib/supabase/db"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function ActivityList() {
  // Obtener actividades recientes
  // Las políticas RLS garantizan que solo se obtengan las actividades de la organización del usuario actual
  const activities = await getMany("activity", {
    orderBy: { column: "createdAt", ascending: false },
    limit: 10,
  })

  if (activities.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay actividad reciente para mostrar</div>
  }

  return (
    <div className="space-y-4">
      {activities.map(async (activity) => {
        // Obtener información del usuario que realizó la actividad
        const user = await getById("profiles", activity.userId)

        return (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                  <AvatarFallback>{getInitials(user?.name, user?.lastname)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {user?.name} {user?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatActivityAction(activity.action)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(activity.createdAt)}</p>
                  </div>

                  {activity.details && (
                    <div className="mt-2 text-sm">
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(activity.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || ""
  const last = lastName?.charAt(0) || ""
  return (first + last).toUpperCase()
}

function formatActivityAction(action: string): string {
  switch (action) {
    case "ACCOUNT_CREATED":
      return "Creó una cuenta"
    case "LOGIN":
      return "Inició sesión"
    case "LOGOUT":
      return "Cerró sesión"
    case "CONTENT_CREATED":
      return "Creó contenido"
    case "CONTENT_UPDATED":
      return "Actualizó contenido"
    case "RESOURCE_ADDED":
      return "Añadió un recurso"
    case "USER_INVITED":
      return "Invitó a un usuario"
    default:
      return action.replace(/_/g, " ").toLowerCase()
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) {
    return "Justo ahora"
  } else if (diffMins < 60) {
    return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  } else if (diffDays < 7) {
    return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
  } else {
    return date.toLocaleDateString()
  }
}
