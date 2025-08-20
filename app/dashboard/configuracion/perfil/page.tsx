"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { AlertCircle, Info } from "lucide-react"

export default function ProfileSettingsPage() {
  const { user, profile, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailVerified, setEmailVerified] = useState(true)
  const [showEmailAlert, setShowEmailAlert] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        lastname: profile.lastname || "",
        email: profile.email || "",
      })
    }

    // Verificar si el email está confirmado
    if (user) {
      setEmailVerified(user.email_confirmed_at !== null)
    }
  }, [profile, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Si se está cambiando el email, mostrar la alerta
    if (name === "email" && value !== profile?.email) {
      setShowEmailAlert(true)
    } else if (name === "email" && value === profile?.email) {
      setShowEmailAlert(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const emailChanged = formData.email !== profile?.email
      const nameOrLastnameChanged = formData.name !== profile?.name || formData.lastname !== profile?.lastname

      // Prepare update data
      const updateData = {}

      if (nameOrLastnameChanged) {
        updateData.name = formData.name
        updateData.lastname = formData.lastname
      }

      if (emailChanged) {
        updateData.email = formData.email
      }

      // Only make the API call if there are changes
      if (Object.keys(updateData).length > 0) {
        // Use the API route to update the profile
        const response = await api.put("/profile", updateData)

        if (response.data.emailUpdated) {
          // Mostrar alerta de confirmación
          toast.info(
            "Se ha enviado un correo de confirmación a tu nueva dirección. Por favor, verifica tu bandeja de entrada.",
          )
          setEmailVerified(false)
        }

        toast.success("Perfil actualizado correctamente")
      } else {
        toast.info("No se detectaron cambios")
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      toast.error(error.response?.data?.message || error.message || "Error al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Perfil</h2>
      </div>

      {!emailVerified && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Tu dirección de correo electrónico no ha sido confirmada. Por favor, revisa tu bandeja de entrada.
          </p>
        </div>
      )}

      {showEmailAlert && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Al cambiar tu correo electrónico, recibirás un enlace de confirmación en la nueva dirección. Deberás hacer
            clic en ese enlace para verificar tu nueva dirección.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
            <img
              src={profile?.avatar || `https://api.dicebear.com/9.x/bottts/jpg?seed=${profile?.id}`}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500 text-center">La foto de perfil no se puede cambiar en este momento</p>
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90 mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar"></div>
    </div>
  )
}
