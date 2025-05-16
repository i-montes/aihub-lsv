"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UserListSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Añadir Usuario</Button>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Miembros de la Organización</CardTitle>
          <CardDescription>Gestiona los usuarios de tu organización</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src="/empowered-trainer.png" alt="Amanda Johnson" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">Amanda Johnson</p>
                  <p className="text-sm text-gray-500">amanda@example.com • Administrador</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-sidebar text-white rounded-full text-xs">Tú</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="/thoughtful-man-profile.png"
                    alt="Carlos Rodríguez"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Carlos Rodríguez</p>
                  <p className="text-sm text-gray-500">carlos@example.com • Editor</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Gestionar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src="/serene-woman-gaze.png" alt="María García" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">María García</p>
                  <p className="text-sm text-gray-500">maria@example.com • Visualizador</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Gestionar
              </Button>
            </div>
          </div>
        </CardContent2>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Invitaciones Pendientes</CardTitle>
          <CardDescription>Invitaciones enviadas que aún no han sido aceptadas</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">juan@example.com</p>
                <p className="text-sm text-gray-500">Enviada hace 2 días • Editor</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Reenviar
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </CardContent2>
      </Card>
    </div>
  )
}
