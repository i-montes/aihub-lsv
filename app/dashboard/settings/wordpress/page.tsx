"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Globe,
  Link2,
  Key,
  CheckCircle2,
  ArrowRight,
  Loader2,
  XCircle,
  RefreshCw,
  Settings2,
} from "lucide-react"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function WordpressSettingsPage() {
  const [formData, setFormData] = useState({
    site_url: "",
    username: "",
    password: "",
    api_path: "/wp-json/wp/v2",
  })

  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [siteName, setSiteName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingConnection, setExistingConnection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    async function loadExistingConnection() {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        // Obtener el ID de la organización del usuario actual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("organizationId")
          .eq("id", user.id)
          .single()

        if (userError || !userData?.organizationId) {
          setIsLoading(false)
          return
        }

        // Buscar conexión existente
        const { data, error } = await supabase
          .from("wordpress_integration_table")
          .select("*")
          .eq("organizationId", userData.organizationId)
          .eq("active", true)
          .single()

        if (error) {
          console.log("No hay conexión existente o ocurrió un error:", error)
        } else if (data) {
          setExistingConnection(data)
          // Si hay un siteName guardado, mostrarlo
          if (data.site_name) {
            setSiteName(data.site_name)
          }
        }
      } catch (error) {
        console.error("Error al cargar la conexión existente:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingConnection()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id === "wpUrl"
        ? "site_url"
        : id === "wpUsername"
          ? "username"
          : id === "wpPassword"
            ? "password"
            : id === "wpApiPath"
              ? "api_path"
              : id]: value,
    }))
  }

  const testConnection = async () => {
    if (!formData.site_url) {
      setStatus("error")
      setMessage("Por favor, ingresa la URL del sitio")
      return false
    }

    try {
      setStatus("testing")
      setMessage("Probando conexión con WordPress...")
      setSiteName(null)

      // Usar nuestro endpoint de proxy para evitar problemas de CORS
      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: formData.site_url,
          username: formData.username,
          password: formData.password,
          api_path: formData.api_path,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || `Error al conectar: ${response.status}`)
      }

      // Guardar el nombre del sitio
      setSiteName(data.site.name)

      setStatus("success")
      setMessage(`Conexión exitosa. Sitio: ${data.site.name}`)
      return true
    } catch (error) {
      console.error("Error al probar la conexión:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Error al conectar con WordPress")
      return false
    }
  }

  const saveConnection = async () => {
    try {
      setIsSubmitting(true)

      // Primero probar la conexión
      const isConnectionValid = await testConnection()

      if (!isConnectionValid) {
        setIsSubmitting(false)
        return
      }

      // Si la conexión es válida, guardar en Supabase
      const supabase = getSupabaseClient()

      // Obtener el ID de la organización del usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa")
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", user.id)
        .single()

      if (userError || !userData?.organizationId) {
        throw new Error("No se pudo obtener la organización del usuario")
      }

      // Normalizar URL
      let siteUrl = formData.site_url
      if (!siteUrl.startsWith("http")) {
        siteUrl = `https://${siteUrl}`
      }
      if (siteUrl.endsWith("/")) {
        siteUrl = siteUrl.slice(0, -1)
      }

      // Normalizar ruta de API
      let apiPath = formData.api_path
      if (!apiPath.startsWith("/")) {
        apiPath = `/${apiPath}`
      }
      if (apiPath.endsWith("/")) {
        apiPath = apiPath.slice(0, -1)
      }

      // Guardar la integración
      const { error: insertError } = await supabase.from("wordpress_integration_table").insert({
        id: uuidv4(),
        organizationId: userData.organizationId,
        site_url: siteUrl,
        api_path: apiPath,
        username: formData.username,
        password: formData.password,
        site_name: siteName || "Sitio WordPress",
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      if (insertError) {
        throw new Error(`Error al guardar la integración: ${insertError.message}`)
      }

      // Recargar la página para mostrar la conexión guardada
      window.location.reload()
    } catch (error) {
      console.error("Error al guardar la integración:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Error al guardar la integración")
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyExistingConnection = async () => {
    if (!existingConnection) return

    try {
      setIsVerifying(true)

      // Usar nuestro endpoint de proxy para verificar la conexión existente
      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: existingConnection.site_url,
          username: existingConnection.username,
          password: existingConnection.password,
          api_path: existingConnection.api_path || "/wp-json/wp/v2",
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        alert(`Error al verificar la conexión: ${data.error || "Verifica las credenciales"}`)
      } else {
        // Actualizar el nombre del sitio si ha cambiado
        if (data.site.name !== existingConnection.site_name) {
          const supabase = getSupabaseClient()
          await supabase
            .from("wordpress_integration_table")
            .update({ site_name: data.site.name, updatedAt: new Date().toISOString() })
            .eq("id", existingConnection.id)

          // Actualizar el estado local
          setExistingConnection({
            ...existingConnection,
            site_name: data.site.name,
          })
        }

        alert(`Conexión verificada correctamente. Sitio: ${data.site.name}`)
      }
    } catch (error) {
      console.error("Error al verificar la conexión:", error)
      alert(`Error al verificar la conexión: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const disconnectWordPress = async () => {
    if (!existingConnection) return

    if (
      !confirm("¿Estás seguro de que deseas eliminar esta conexión con WordPress? Esta acción no se puede deshacer.")
    ) {
      return
    }

    try {
      setIsDeleting(true)
      const supabase = getSupabaseClient()

      // Eliminar completamente el registro de la base de datos
      const { error } = await supabase.from("wordpress_integration_table").delete().eq("id", existingConnection.id)

      if (error) {
        throw new Error(`Error al eliminar la conexión con WordPress: ${error.message}`)
      }

      // Recargar la página
      window.location.reload()
    } catch (error) {
      console.error("Error al eliminar la conexión con WordPress:", error)
      alert(`Error al eliminar la conexión: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="text-2xl font-bold">Integración con WordPress</h2>
        <p className="text-muted-foreground">Conecta tu sitio de WordPress para mejorar tu flujo de trabajo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 overflow-hidden">
            <div className="bg-sidebar/10 p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Image src="/placeholder.svg?key=wordpress" alt="WordPress" width={40} height={40} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Conexión con WordPress</h3>
                  <p className="text-sm text-muted-foreground">
                    {existingConnection
                      ? existingConnection.site_name || "Sitio WordPress conectado"
                      : "Configura la conexión con tu sitio de WordPress"}
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-sidebar animate-spin" />
                </div>
              ) : existingConnection ? (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        {existingConnection.site_name || "Sitio WordPress"} está conectado correctamente.
                      </p>
                      <p className="text-sm text-green-700">
                        Puedes utilizar todas las funcionalidades de integración.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">URL del Sitio</p>
                        <p className="font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-sidebar" />
                          <a
                            href={existingConnection.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sidebar hover:underline"
                          >
                            {existingConnection.site_url}
                          </a>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                        <p className="font-medium flex items-center gap-2">
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
                            className="lucide lucide-user text-sidebar"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {existingConnection.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Ruta de API</p>
                      <p className="font-medium flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-sidebar" />
                        {existingConnection.api_path || "/wp-json/wp/v2"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Conectado desde</p>
                      <p className="font-medium">
                        {new Date(existingConnection.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={disconnectWordPress}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        {isDeleting ? "Eliminando..." : "Eliminar Conexión"}
                      </Button>

                      <Button
                        className="bg-sidebar text-white hover:bg-sidebar/90 flex items-center gap-2"
                        onClick={verifyExistingConnection}
                        disabled={isVerifying}
                      >
                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {isVerifying ? "Verificando..." : "Verificar Conexión"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {status === "idle" && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        No hay ningún sitio de WordPress conectado. Conecta tu sitio para facilitar el uso de las
                        herramientas de PressAI. No publicaremos ningún contenido automáticamente.
                      </p>
                    </div>
                  )}

                  {status === "testing" && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                      <p className="text-sm text-blue-700">{message}</p>
                    </div>
                  )}

                  {status === "success" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">{message}</p>
                        {siteName && (
                          <p className="text-sm text-green-700">
                            Nombre del sitio: <span className="font-medium">{siteName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{message}</p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="wpUrl" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> URL del Sitio
                      </Label>
                      <div className="relative">
                        <Input
                          id="wpUrl"
                          placeholder="https://tusitio.com"
                          className="pl-10 bg-white"
                          value={formData.site_url}
                          onChange={handleChange}
                        />
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Introduce la URL completa de tu sitio WordPress</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="wpUsername" className="flex items-center gap-2">
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
                            className="lucide lucide-user"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Nombre de Usuario
                        </Label>
                        <Input
                          id="wpUsername"
                          placeholder="admin"
                          className="bg-white"
                          value={formData.username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wpPassword" className="flex items-center gap-2">
                          <Key className="h-4 w-4" /> Contraseña de Aplicación
                        </Label>
                        <Input
                          id="wpPassword"
                          type="password"
                          placeholder="••••••••••••"
                          className="bg-white"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          <a
                            href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sidebar hover:underline"
                          >
                            ¿Cómo crear una contraseña de aplicación?
                          </a>
                        </p>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced-options">
                        <AccordionTrigger className="text-sm font-medium">
                          <span className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Opciones Avanzadas
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <Label htmlFor="wpApiPath" className="flex items-center gap-2">
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
                                className="lucide lucide-code"
                              >
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                              </svg>
                              Ruta de la API
                            </Label>
                            <Input
                              id="wpApiPath"
                              placeholder="/wp-json/wp/v2"
                              className="bg-white"
                              value={formData.api_path}
                              onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              Ruta base de la API REST de WordPress. El valor predeterminado es /wp-json/wp/v2
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      onClick={testConnection}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={status === "testing" || isSubmitting}
                    >
                      {status === "testing" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
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
                          className="lucide lucide-check-circle"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <path d="m9 11 3 3L22 4" />
                        </svg>
                      )}
                      {status === "testing" ? "Probando..." : "Probar Conexión"}
                    </Button>

                    <Button
                      onClick={saveConnection}
                      className="bg-sidebar text-white hover:bg-sidebar/90 flex items-center gap-2"
                      disabled={status === "testing" || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Guardando..." : "Guardar Conexión"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-gray-200 h-full">
            <CardHeader>
              <CardTitle className="text-lg">Beneficios de la conexión</CardTitle>
              <CardDescription>Mejora tu flujo de trabajo periodístico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-sidebar/10 p-2 rounded-full">
                  <ArrowRight className="h-4 w-4 text-sidebar" />
                </div>
                <div>
                  <h4 className="font-medium">Análisis de contenido</h4>
                  <p className="text-sm text-muted-foreground">
                    Analiza el contenido existente para mejorar tus artículos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-sidebar/10 p-2 rounded-full">
                  <ArrowRight className="h-4 w-4 text-sidebar" />
                </div>
                <div>
                  <h4 className="font-medium">Extracción de datos</h4>
                  <p className="text-sm text-muted-foreground">
                    Obtén información valiosa de tus publicaciones anteriores
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-sidebar/10 p-2 rounded-full">
                  <ArrowRight className="h-4 w-4 text-sidebar" />
                </div>
                <div>
                  <h4 className="font-medium">Optimización SEO</h4>
                  <p className="text-sm text-muted-foreground">Mejora el posicionamiento de tus artículos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-sidebar/10 p-2 rounded-full">
                  <ArrowRight className="h-4 w-4 text-sidebar" />
                </div>
                <div>
                  <h4 className="font-medium">Flujo de trabajo mejorado</h4>
                  <p className="text-sm text-muted-foreground">
                    Integra tus herramientas periodísticas en un solo lugar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
