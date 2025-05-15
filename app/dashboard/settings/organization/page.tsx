import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserOrganization } from "@/lib/supabase/auth-actions"
import { getOrganizationMembers } from "@/lib/supabase/organization"
import { OrganizationForm } from "./organization-form"
import { MembersTable } from "./members-table"
import { Layout } from "@/components/layout"

export default async function OrganizationSettingsPage() {
  const organization = await getCurrentUserOrganization()

  if (!organization) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Organización no encontrada</CardTitle>
              <CardDescription>
                No se encontró información de tu organización. Por favor, contacta con soporte.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    )
  }

  const members = await getOrganizationMembers(organization.id)

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Configuración de la organización</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información general</CardTitle>
                <CardDescription>Actualiza la información de tu organización</CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationForm organization={organization} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Miembros de la organización</CardTitle>
                <CardDescription>Gestiona los miembros de tu organización</CardDescription>
              </CardHeader>
              <CardContent>
                <MembersTable members={members} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Facturación</CardTitle>
                <CardDescription>Gestiona tu plan y métodos de pago</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Funcionalidad de facturación en desarrollo.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
