import { OrganizationMembers } from "@/components/organization-members"

export default function OrganizationMembersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Miembros de la Organización</h1>
      <p className="text-gray-500 mb-8">
        Visualiza todos los miembros que pertenecen a tu organización y sus roles asignados.
      </p>

      <OrganizationMembers />
    </div>
  )
}
