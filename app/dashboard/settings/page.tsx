"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent as CardContent2,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import {
  User,
  Shield,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
  Instagram,
  ChevronRight,
  Building,
  Globe,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("profile")
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: false,
  })

  useEffect(() => {
    router.push("/dashboard/settings/profile")
  }, [router])

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Menú vertical */}
      <div className="w-full md:w-1/4">
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-2">Configuración</h2>

              {/* Account Group */}
              <div className="space-y-1">
                <SettingsMenuGroup
                  title="Account"
                  expanded={expandedGroups.account}
                  onToggle={() => toggleGroup("account")}
                />
                {expandedGroups.account && (
                  <>
                    <SettingsMenuItem
                      icon={<User size={18} />}
                      title="Profile"
                      active={activeSection === "profile"}
                      onClick={() => setActiveSection("profile")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Shield size={18} />}
                      title="Security"
                      active={activeSection === "security"}
                      onClick={() => setActiveSection("security")}
                      indented
                    />
                  </>
                )}
              </div>

              {/* Organization Group */}
              <div className="space-y-1">
                <SettingsMenuGroup
                  title="Organization"
                  expanded={expandedGroups.organization}
                  onToggle={() => toggleGroup("organization")}
                />
                {expandedGroups.organization && (
                  <>
                    <SettingsMenuItem
                      icon={<Building size={18} />}
                      title="General Information"
                      active={activeSection === "general-information"}
                      onClick={() => setActiveSection("general-information")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Users size={18} />}
                      title="User List"
                      active={activeSection === "user-list"}
                      onClick={() => setActiveSection("user-list")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<MessageSquare size={18} />}
                      title="Integrations"
                      active={activeSection === "integrations"}
                      onClick={() => setActiveSection("integrations")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<FileText size={18} />}
                      title="Prompts"
                      active={activeSection === "prompts"}
                      onClick={() => setActiveSection("prompts")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<Globe size={18} />}
                      title="Wordpress"
                      active={activeSection === "wordpress"}
                      onClick={() => setActiveSection("wordpress")}
                      indented
                    />
                    <SettingsMenuItem
                      icon={<CreditCard size={18} />}
                      title="Billing & Usage"
                      active={activeSection === "billing"}
                      onClick={() => setActiveSection("billing")}
                      indented
                    />
                  </>
                )}
              </div>

              <div className="pt-4 mt-4 border-t">
                <SettingsMenuItem
                  icon={<LogOut size={18} />}
                  title="Cerrar Sesión"
                  onClick={() => console.log("Cerrar sesión")}
                  className="text-red-500 hover:bg-red-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido de configuración */}
      <div className="w-full md:w-3/4">
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardContent className="p-6">
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "general-information" && <GeneralInformationSettings />}
            {activeSection === "user-list" && <UserListSettings />}
            {activeSection === "integrations" && <IntegrationSettings />}
            {activeSection === "prompts" && <PromptsSettings />}
            {activeSection === "wordpress" && <WordpressSettings />}
            {activeSection === "billing" && <BillingSettings />}
            {![
              "profile",
              "security",
              "general-information",
              "user-list",
              "integrations",
              "prompts",
              "wordpress",
              "billing",
            ].includes(activeSection) && (
              <div className="text-center py-10">
                <h3 className="text-xl font-medium text-gray-500">Selecciona una sección para ver su configuración</h3>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsMenuGroup({ title, expanded, onToggle }) {
  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-gray-100"
      onClick={onToggle}
    >
      <span className="font-medium">{title}</span>
      <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
    </button>
  )
}

function SettingsMenuItem({ icon, title, active = false, onClick, className = "", indented = false }) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        active ? "bg-sidebar text-white" : `text-gray-700 hover:bg-gray-100 ${className}`
      } ${indented ? "pl-6" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </button>
  )
}

function ProfileSettings() {
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
              src={profile?.avatar || "/empowered-trainer.png"}
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

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notificaciones</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notificaciones por Correo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mensajes Nuevos</p>
                <p className="text-sm text-gray-500">Recibe notificaciones cuando recibas un nuevo mensaje</p>
              </div>
              <Switch id="email-messages" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nuevos Suscriptores</p>
                <p className="text-sm text-gray-500">Recibe notificaciones cuando tengas nuevos suscriptores</p>
              </div>
              <Switch id="email-subscribers" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campañas</p>
                <p className="text-sm text-gray-500">Recibe notificaciones sobre el estado de tus campañas</p>
              </div>
              <Switch id="email-campaigns" defaultChecked />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Notificaciones Push</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mensajes Nuevos</p>
                <p className="text-sm text-gray-500">Recibe notificaciones push cuando recibas un nuevo mensaje</p>
              </div>
              <Switch id="push-messages" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nuevos Suscriptores</p>
                <p className="text-sm text-gray-500">Recibe notificaciones push cuando tengas nuevos suscriptores</p>
              </div>
              <Switch id="push-subscribers" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campañas</p>
                <p className="text-sm text-gray-500">Recibe notificaciones push sobre el estado de tus campañas</p>
              </div>
              <Switch id="push-campaigns" defaultChecked />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Resúmenes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resumen Diario</p>
                <p className="text-sm text-gray-500">Recibe un resumen diario de tu actividad</p>
              </div>
              <Switch id="daily-summary" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resumen Semanal</p>
                <p className="text-sm text-gray-500">Recibe un resumen semanal de tu actividad</p>
              </div>
              <Switch id="weekly-summary" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
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
  )
}

function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Integraciones</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Añadir Integración</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Plataformas Conectadas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sidebar rounded-full flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="font-medium">WhatsApp Business</p>
                  <p className="text-sm text-gray-500">Conectado • +1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Activo</div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center text-white">
                  <Instagram size={20} />
                </div>
                <div>
                  <p className="font-medium">Instagram</p>
                  <p className="text-sm text-gray-500">Conectado • @tuempresa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Activo</div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow rounded-full flex items-center justify-center text-sidebar">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="font-medium">Facebook Messenger</p>
                  <p className="text-sm text-gray-500">Conectado • Página: Tu Empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Activo</div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Otras Integraciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6V18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12L16 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google Sheets</p>
                  <p className="text-sm text-gray-500">No conectado</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Conectar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 4H8C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Zapier</p>
                  <p className="text-sm text-gray-500">No conectado</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Conectar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Equipo</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Invitar Miembro</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Miembros del Equipo</h3>
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
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Invitaciones Pendientes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Roles y Permisos</h3>
          <div className="space-y-2">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium">Administrador</p>
              <p className="text-sm text-gray-500">Acceso completo a todas las funciones y configuraciones</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium">Editor</p>
              <p className="text-sm text-gray-500">
                Puede crear y editar contenido, pero no puede cambiar la configuración
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium">Visualizador</p>
              <p className="text-sm text-gray-500">Solo puede ver contenido, sin capacidad de edición</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Seguridad</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent2 className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90">Actualizar Contraseña</Button>
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

function GeneralInformationSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Información General</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Detalles de la Organización</CardTitle>
          <CardDescription>Información básica sobre tu organización</CardDescription>
        </CardHeader>
        <CardContent2 className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre de la Organización</Label>
            <Input id="orgName" defaultValue="PressAI Media" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgDescription">Descripción</Label>
            <Textarea id="orgDescription" defaultValue="Organización dedicada al periodismo digital" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orgWebsite">Sitio Web</Label>
              <Input id="orgWebsite" defaultValue="https://pressai.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgEmail">Email de Contacto</Label>
              <Input id="orgEmail" defaultValue="contact@pressai.com" />
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
            <Input id="address" defaultValue="123 Media Street" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" defaultValue="Barcelona" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado/Provincia</Label>
              <Input id="state" defaultValue="Cataluña" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" defaultValue="España" />
            </div>
          </div>
        </CardContent2>
      </Card>
    </div>
  )
}

function UserListSettings() {
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

function PromptsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestión de Prompts</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Crear Prompt</Button>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Prompts Guardados</CardTitle>
          <CardDescription>Gestiona tus prompts personalizados</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Análisis de Noticias</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Analiza esta noticia y proporciona un resumen de los puntos clave, posibles sesgos y contexto histórico
                relevante.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Análisis</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Noticias</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Generador de Titulares</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Genera 5 titulares atractivos para este artículo, optimizados para SEO y engagement en redes sociales.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Titulares</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">SEO</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Verificación de Hechos</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Verifica los hechos presentados en este artículo e identifica posibles afirmaciones que requieran más
                investigación.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fact-checking</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Investigación</span>
              </div>
            </div>
          </div>
        </CardContent2>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Categorías de Prompts</CardTitle>
          <CardDescription>Organiza tus prompts por categorías</CardDescription>
        </CardHeader>
        <CardContent2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <p className="font-medium">Análisis</p>
              </div>
              <p className="text-sm text-gray-500">3 prompts</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <p className="font-medium">Titulares</p>
              </div>
              <p className="text-sm text-gray-500">2 prompts</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <p className="font-medium">Fact-checking</p>
              </div>
              <p className="text-sm text-gray-500">1 prompt</p>
            </div>
          </div>
        </CardContent2>
      </Card>
    </div>
  )
}

function WordpressSettings() {
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

function Spinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar"></div>
    </div>
  )
}
