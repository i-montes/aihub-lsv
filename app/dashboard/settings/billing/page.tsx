"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BillingPage() {
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Facturación</h2>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90">Actualizar Plan</Button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Plan Actual: <span className="text-sidebar">Profesional</span>
                  </p>
                  <p className="text-sm text-gray-500">$49.99/mes • Renovación: 15/06/2023</p>
                </div>
                <div className="px-3 py-1 bg-yellow text-sidebar rounded-full text-sm font-medium">Activo</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Método de Pago</h3>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-sidebar rounded flex items-center justify-center text-white text-xs">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">Visa terminada en 4242</p>
                    <p className="text-sm text-gray-500">Expira: 12/2025</p>
                  </div>
                </div>
                <Button variant="outline">Cambiar</Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-medium">Historial de Facturación</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Factura #INV-001</p>
                    <p className="text-sm text-gray-500">15/05/2023 • $49.99</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Descargar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Factura #INV-002</p>
                    <p className="text-sm text-gray-500">15/04/2023 • $49.99</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Descargar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Factura #INV-003</p>
                    <p className="text-sm text-gray-500">15/03/2023 • $49.99</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
