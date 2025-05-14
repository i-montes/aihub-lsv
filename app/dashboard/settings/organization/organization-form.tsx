"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateOrganization } from "@/lib/supabase/organization"
import type { Database } from "@/lib/database.types"

type Organization = Database["public"]["Tables"]["organization"]["Row"]

interface OrganizationFormProps {
  organization: Organization
}

export function OrganizationForm({ organization }: OrganizationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: organization.name,
    address: organization.address || "",
    city: organization.city || "",
    country: organization.country || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateOrganization(organization.id, formData)

      if (result) {
        setSuccess(true)
        router.refresh()
      } else {
        setError("No se pudo actualizar la organización")
      }
    } catch (err) {
      setError("Ocurrió un error al actualizar la organización")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la organización</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" value={formData.country} onChange={handleChange} />
        </div>
      </div>

      {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>}

      {success && (
        <div className="bg-green-50 p-3 rounded-md text-green-500 text-sm">Organización actualizada correctamente</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
