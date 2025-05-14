import { getMany } from "@/lib/supabase/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddResourceButton } from "./add-resource-button"
import { DeleteResourceButton } from "./delete-resource-button"
import { EditResourceButton } from "./edit-resource-button"

export async function ResourcesTable() {
  // Obtener recursos de la organización actual
  // Las políticas RLS garantizan que solo se obtengan los recursos de la organización del usuario actual
  const resources = await getMany("resources", {
    orderBy: { column: "createdAt", ascending: false },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recursos ({resources.length})</h3>
        <AddResourceButton />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No hay recursos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>
                    <ResourceTypeBadge type={resource.type} />
                  </TableCell>
                  <TableCell>{resource.author}</TableCell>
                  <TableCell>
                    <ResourceStatusBadge status={resource.status} />
                  </TableCell>
                  <TableCell>{new Date(resource.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditResourceButton resource={resource} />
                      <DeleteResourceButton resourceId={resource.id} resourceTitle={resource.title} />
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

function ResourceTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "IMAGE":
      return <Badge className="bg-green-500">Imagen</Badge>
    case "VIDEO":
      return <Badge className="bg-blue-500">Video</Badge>
    case "AUDIO":
      return <Badge className="bg-purple-500">Audio</Badge>
    case "DOCUMENT":
      return <Badge className="bg-orange-500">Documento</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

function ResourceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-500">Activo</Badge>
    case "INACTIVE":
      return <Badge variant="outline">Inactivo</Badge>
    case "ARCHIVED":
      return <Badge variant="secondary">Archivado</Badge>
    case "DELETED":
      return <Badge variant="destructive">Eliminado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
