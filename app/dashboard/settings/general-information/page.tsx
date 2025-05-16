"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function GeneralInformationSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    orgName: "PressAI Media",
    orgDescription: "Organización dedicada al periodismo digital",
    orgWebsite: "https://pressai.com",
    orgEmail: "contact@pressai.com",
    address: "123 Media Street",
    city: "Barcelona",
    state: "Cataluña",
    country: "España",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Información actualizada correctamente")
      setIsSubmitting(false)
    }, 1000)
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
          <CardContent2 className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nombre de la Organización</Label>
              <Input id="orgName" name="orgName" value={formData.orgName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Descripción</Label>
              <Textarea
                id="orgDescription"
                name="orgDescription"
                value={formData.orgDescription}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgWebsite">Sitio Web</Label>
                <Input id="orgWebsite" name="orgWebsite" value={formData.orgWebsite} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgEmail">Email de Contacto</Label>
                <Input id="orgEmail" name="orgEmail" value={formData.orgEmail} onChange={handleChange} />
              </div>
            </div>
          </CardContent2>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
            <CardDescription>Ubicación física de tu organización</CardDescription>
          </CardHeader>
          <CardContent2 className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} />
              </div>
            </div>

            <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90 mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent2>
        </Card>
      </form>
    </div>
  )
}
