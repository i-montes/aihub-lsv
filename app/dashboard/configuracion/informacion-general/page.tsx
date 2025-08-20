"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { OrganizationService } from "@/lib/services/organization-service"

export default function GeneralInformationSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    contactemail: "",
    address: "",
    city: "",
    state: "",
    country: "",
  })

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true)
        const { organization } = await OrganizationService.getOrganization()
        if (organization) {
          setFormData({
            name: organization.name || "",
            description: organization.description || "",
            website: organization.website || "",
            contactemail: organization.contactemail || "",
            address: organization.address || "",
            city: organization.city || "",
            state: organization.state || "",
            country: organization.country || "",
          })
        }
      } catch (error) {
        console.error("Error fetching organization:", error)
        toast.error("Error al cargar la información de la organización")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await OrganizationService.updateOrganization(formData)
      toast.success("Información actualizada correctamente")
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error("Error al actualizar la información")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando información...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Información General</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-gray-200 mb-6">
          <CardHeader>
            <CardTitle>Detalles de la Organización</CardTitle>
            <CardDescription>Información básica sobre tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Organización</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe tu organización"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactemail">Email de Contacto</Label>
                <Input
                  id="contactemail"
                  name="contactemail"
                  type="email"
                  value={formData.contactemail}
                  onChange={handleChange}
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
            <CardDescription>Ubicación física de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle y número"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ciudad" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Estado o provincia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="País"
                />
              </div>
            </div>

            <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90 mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
