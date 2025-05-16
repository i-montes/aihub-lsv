"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

export default function SecuritySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsSubmitting(true)

    try {
      await api.put("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      toast.success("Contraseña actualizada correctamente")

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error)
      toast.error(error.response?.data?.message || error.message || "Error al actualizar la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Seguridad</h2>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent2 className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </form>
          </CardContent2>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Autenticación de Dos Factores</CardTitle>
            <CardDescription>Añade una capa adicional de seguridad a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Estado: <span className="text-red-500">Desactivado</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  La autenticación de dos factores no está habilitada actualmente
                </p>
              </div>
              <Button>Activar 2FA</Button>
            </div>
          </CardContent2>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>Gestiona tus sesiones activas en diferentes dispositivos</CardDescription>
          </CardHeader>
          <CardContent2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Chrome en Windows</p>
                  <p className="text-sm text-gray-500">Última actividad: Hace 5 minutos</p>
                </div>
                <Button variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Safari en iPhone</p>
                  <p className="text-sm text-gray-500">Última actividad: Hace 2 días</p>
                </div>
                <Button variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </CardContent2>
        </Card>
      </div>
    </div>
  )
}
