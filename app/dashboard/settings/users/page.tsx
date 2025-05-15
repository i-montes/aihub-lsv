import { getOrganizationUsers } from "@/lib/supabase/user-actions"
import { UsersTable } from "./users-table"
import { ExportUsersButton } from "./export-users-button"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout"

export default async function UsersPage() {
  // Obtener los usuarios de la organización
  const { users, error } = await getOrganizationUsers()

  // Si hay un error de permisos, redirigir al dashboard
  if (error && error.includes("No tienes permisos")) {
    redirect("/dashboard")
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Lista de Usuarios</h2>
          <div className="flex gap-2">
            <ExportUsersButton />
          </div>
        </div>

        <UsersTable initialUsers={users || []} />
      </div>
    </Layout>
  )
}
