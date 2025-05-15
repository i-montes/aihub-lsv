"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function WordPressPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testResult, setTestResult] = useState({ success: false, message: "" })
  const [showTestResult, setShowTestResult] = useState(false)
  const [sites, setSites] = useState([
    { id: 1, name: "Blog Principal", url: "https://ejemplo.com", status: "connected" },
  ])

  // Función para probar la conexión
  const testConnection = () => {
    setIsConnecting(true)
    setShowTestResult(false)

    // Simulación de prueba de conexión
    setTimeout(() => {
      setIsConnecting(false)
      setShowTestResult(true)
      setIsConnected(true)

      setTestResult({
        success: true,
        message: "Conexión exitosa. Se ha conectado correctamente al sitio WordPress.",
      })

      // Añadir el nuevo sitio a la lista
      const url = document.getElementById("wordpress-url").value
      if (url && !sites.some((site) => site.url === url)) {
        setSites([
          ...sites,
          {
            id: sites.length + 1,
            name: `Sitio ${sites.length + 1}`,
            url: url,
            status: "connected",
          },
        ])
      }
    }, 1500)
  }

  // Función para desconectar un sitio
  const disconnectSite = (siteId) => {
    setSites(sites.map((site) => (site.id === siteId ? { ...site, status: "disconnected" } : site)))
  }

  // Función para eliminar un sitio
  const removeSite = (siteId) => {
    setSites(sites.filter((site) => site.id !== siteId))
  }

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Integración con WordPress</h2>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">
              Conecta tu sitio WordPress para sincronizar contenido, gestionar comentarios y publicar directamente desde
              esta plataforma. Esta integración utiliza la API REST de WordPress.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Conectar nuevo sitio</h3>

              <div className="space-y-4 p-4 bg-white border rounded-xl">
                <div className="space-y-2">
                  <Label htmlFor="wordpress-url">URL del sitio WordPress</Label>
                  <Input id="wordpress-url" placeholder="https://tusitio.com" />
                  <p className="text-xs text-gray-500">
                    Introduce la URL completa de tu sitio WordPress, incluyendo https://
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wordpress-username">Nombre de usuario</Label>
                  <Input id="wordpress-username" placeholder="admin" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wordpress-password">Contraseña de aplicación</Label>
                  <Input id="wordpress-password" type="password" placeholder="xxxx xxxx xxxx xxxx" />
                  <p className="text-xs text-gray-500">
                    Recomendamos usar una{" "}
                    <a
                      href="https://wordpress.org/documentation/article/application-passwords/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sidebar hover:underline"
                    >
                      contraseña de aplicación
                    </a>{" "}
                    en lugar de tu contraseña principal.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="text-sm text-sidebar hover:underline flex items-center"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`ml-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-api-path">Ruta de la API (opcional)</Label>
                      <Input id="wordpress-api-path" defaultValue="/wp-json/wp/v2" />
                      <p className="text-xs text-gray-500">
                        Ruta personalizada si tu instalación de WordPress tiene una configuración diferente.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Permisos</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="perm-read" className="rounded border-gray-300" defaultChecked />
                          <Label htmlFor="perm-read" className="text-sm font-normal">
                            Leer contenido
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="perm-write" className="rounded border-gray-300" defaultChecked />
                          <Label htmlFor="perm-write" className="text-sm font-normal">
                            Escribir contenido
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="perm-comments"
                            className="rounded border-gray-300"
                            defaultChecked
                          />
                          <Label htmlFor="perm-comments" className="text-sm font-normal">
                            Gestionar comentarios
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="perm-users" className="rounded border-gray-300" />
                          <Label htmlFor="perm-users" className="text-sm font-normal">
                            Gestionar usuarios
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    className="bg-sidebar text-white hover:bg-sidebar/90 flex items-center gap-2"
                    onClick={testConnection}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
                    {isConnecting ? "Conectando..." : "Conectar sitio"}
                  </Button>
                </div>

                {showTestResult && (
                  <div
                    className={`p-3 rounded-md text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
