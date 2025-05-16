"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent as CardContent2 } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertCircle } from "lucide-react"

export default function WordpressSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Integración con WordPress</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Conexión con WordPress</CardTitle>
          <CardDescription>Configura la conexión con tu sitio de WordPress</CardDescription>
        </CardHeader>
        <CardContent2 className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              No hay ningún sitio de WordPress conectado. Conecta tu sitio para publicar contenido directamente desde
              PressAI.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wpUrl">URL del Sitio</Label>
            <Input id="wpUrl" placeholder="https://tusitio.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wpUsername">Nombre de Usuario</Label>
              <Input id="wpUsername" placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wpPassword">Contraseña de Aplicación</Label>
              <Input id="wpPassword" type="password" placeholder="••••••••••••" />
            </div>
          </div>

          <Button className="bg-sidebar text-white hover:bg-sidebar/90">Conectar WordPress</Button>
        </CardContent2>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Configuración de Publicación</CardTitle>
          <CardDescription>Personaliza cómo se publica el contenido en WordPress</CardDescription>
        </CardHeader>
        <CardContent2 className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Publicación Automática</p>
              <p className="text-sm text-gray-500">Publica automáticamente el contenido generado</p>
            </div>
            <Switch id="autoPublish" disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Categoría Predeterminada</p>
              <p className="text-sm text-gray-500">Asigna una categoría por defecto</p>
            </div>
            <Input className="w-40" placeholder="Sin categoría" disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Etiquetas Automáticas</p>
              <p className="text-sm text-gray-500">Genera etiquetas automáticamente</p>
            </div>
            <Switch id="autoTags" disabled />
          </div>
        </CardContent2>
      </Card>
    </div>
  )
}
