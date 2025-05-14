import { getMany } from "@/lib/supabase/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, FileTextIcon, ActivityIcon, FolderIcon } from "lucide-react"

export async function StatsCards() {
  // Obtener estadísticas
  // Las políticas RLS garantizan que solo se obtengan los datos de la organización del usuario actual
  const users = await getMany("profiles", {})
  const content = await getMany("content", {})
  const resources = await getMany("resources", {})
  const activities = await getMany("activity", {})

  const stats = [
    {
      title: "Usuarios",
      value: users.length,
      description: "Total de usuarios en la organización",
      icon: UsersIcon,
    },
    {
      title: "Contenido",
      value: content.length,
      description: "Piezas de contenido creadas",
      icon: FileTextIcon,
    },
    {
      title: "Recursos",
      value: resources.length,
      description: "Recursos disponibles",
      icon: FolderIcon,
    },
    {
      title: "Actividades",
      value: activities.length,
      description: "Acciones registradas",
      icon: ActivityIcon,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
