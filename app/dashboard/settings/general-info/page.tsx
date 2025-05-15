"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function GeneralInfoPage() {
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Información General</h2>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalles de la Organización</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nombre de la Organización</Label>
                  <Input id="org-name" defaultValue="AI Hub Media" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-description">Descripción</Label>
                  <Textarea
                    id="org-description"
                    rows={3}
                    defaultValue="Plataforma de herramientas de periodismo basadas en inteligencia artificial."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Correo Electrónico</Label>
                    <Input id="org-email" type="email" defaultValue="contacto@aihub.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-phone">Teléfono</Label>
                    <Input id="org-phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Sitio Web</Label>
                  <Input id="org-website" defaultValue="https://aihub.com" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-medium">Dirección</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-address">Dirección</Label>
                  <Input id="org-address" defaultValue="123 Main Street" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-city">Ciudad</Label>
                    <Input id="org-city" defaultValue="San Francisco" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-state">Estado/Provincia</Label>
                    <Input id="org-state" defaultValue="California" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-zip">Código Postal</Label>
                    <Input id="org-zip" defaultValue="94105" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-country">País</Label>
                  <select
                    id="org-country"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="US"
                  >
                    <option value="US">Estados Unidos</option>
                    <option value="MX">México</option>
                    <option value="ES">España</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="CL">Chile</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-medium">Redes Sociales</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social-twitter">Twitter</Label>
                  <Input id="social-twitter" defaultValue="@aihubmedia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-facebook">Facebook</Label>
                  <Input id="social-facebook" defaultValue="aihubmedia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-linkedin">LinkedIn</Label>
                  <Input id="social-linkedin" defaultValue="company/aihubmedia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-instagram">Instagram</Label>
                  <Input id="social-instagram" defaultValue="aihubmedia" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
