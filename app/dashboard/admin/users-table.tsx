import { getMany } from "@/lib/supabase/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddUserButton } from "./add-user-button"
import { DeleteUserButton } from "./delete-user-button"
import { EditUserButton } from "./edit-user-button"

export async function UsersTable() {
  // Obtener usuarios de la organización actual
  // Las políticas RLS garantizan que solo se obtengan los usuarios de la organización del usuario actual
  const users = await getMany("profiles", {
    orderBy: { column: "created_at", ascending: false },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuarios ({users.length})</h3>
        <AddUserButton />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No hay usuarios para mostrar
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name} {user.lastname}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditUserButton user={user} />
                      <DeleteUserButton userId={user.id} userName={`${user.name} ${user.lastname}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "OWNER":
      return <Badge className="bg-purple-500">Propietario</Badge>
    case "WORKSPACE_ADMIN":
      return <Badge className="bg-blue-500">Administrador</Badge>
    case "USER":
      return <Badge>Usuario</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}
