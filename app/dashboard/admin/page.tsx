import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerUser, hasRole } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTable } from "./users-table"
import { ResourcesTable } from "./resources-table"
import { ActivityList } from "./activity-list"
import { StatsCards } from "./stats-cards"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminDashboardPage() {
  // Verificar si el usuario tiene permisos de administrador
  const isAdmin = (await hasRole("OWNER")) || (await hasRole("WORKSPACE_ADMIN"))

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const user = await getServerUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="text-sm text-muted-foreground">
          Organización: <span className="font-medium">{user.organizationId}</span>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <Skeleton className="h-32" />
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios de tu organización</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UsersTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
              <CardDescription>Gestiona los recursos de tu organización</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <ResourcesTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Historial de actividad de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <ActivityList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
