"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
  Instagram,
  ChevronRight,
  Settings,
  RefreshCcw,
  ClipboardCheck,
  Scissors,
  Tag,
  File,
  Upload,
  Download,
  Info,
  Briefcase,
  BarChart,
} from "lucide-react"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    workspace: false,
    apps: false,
    inbox: false,
    data: false,
    organization: false,
  })

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  return (
    <Layout>
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
                        icon={<Bell size={18} />}
                        title="Notification"
                        active={activeSection === "notification"}
                        onClick={() => setActiveSection("notification")}
                        indented
                      />
                    </>
                  )}
                </div>

                {/* Workspace Group */}
                <div className="space-y-1">
                  <SettingsMenuGroup
                    title="Workspace"
                    expanded={expandedGroups.workspace}
                    onToggle={() => toggleGroup("workspace")}
                  />
                  {expandedGroups.workspace && (
                    <>
                      <SettingsMenuItem
                        icon={<Settings size={18} />}
                        title="General"
                        active={activeSection === "general"}
                        onClick={() => setActiveSection("general")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Users size={18} />}
                        title="Members"
                        active={activeSection === "members"}
                        onClick={() => setActiveSection("members")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Users size={18} />}
                        title="Team"
                        active={activeSection === "team"}
                        onClick={() => setActiveSection("team")}
                        indented
                      />
                    </>
                  )}
                </div>

                {/* Apps Group */}
                <div className="space-y-1">
                  <SettingsMenuGroup title="Apps" expanded={expandedGroups.apps} onToggle={() => toggleGroup("apps")} />
                  {expandedGroups.apps && (
                    <>
                      <SettingsMenuItem
                        icon={<MessageSquare size={18} />}
                        title="Channels"
                        active={activeSection === "channels"}
                        onClick={() => setActiveSection("channels")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<MessageSquare size={18} />}
                        title="Integration"
                        active={activeSection === "integration"}
                        onClick={() => setActiveSection("integration")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<BarChart size={18} />}
                        title="Growth Widgets"
                        active={activeSection === "growth-widgets"}
                        onClick={() => setActiveSection("growth-widgets")}
                        indented
                      />
                    </>
                  )}
                </div>

                {/* Inbox Settings Group */}
                <div className="space-y-1">
                  <SettingsMenuGroup
                    title="Inbox Settings"
                    expanded={expandedGroups.inbox}
                    onToggle={() => toggleGroup("inbox")}
                  />
                  {expandedGroups.inbox && (
                    <>
                      <SettingsMenuItem
                        icon={<User size={18} />}
                        title="Contact fields"
                        active={activeSection === "contact-fields"}
                        onClick={() => setActiveSection("contact-fields")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<RefreshCcw size={18} />}
                        title="Lifecycle"
                        active={activeSection === "lifecycle"}
                        onClick={() => setActiveSection("lifecycle")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<ClipboardCheck size={18} />}
                        title="Closing Notes"
                        active={activeSection === "closing-notes"}
                        onClick={() => setActiveSection("closing-notes")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Scissors size={18} />}
                        title="Snippets"
                        active={activeSection === "snippets"}
                        onClick={() => setActiveSection("snippets")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Tag size={18} />}
                        title="Tags"
                        active={activeSection === "tags"}
                        onClick={() => setActiveSection("tags")}
                        indented
                      />
                    </>
                  )}
                </div>

                {/* Data Settings Group */}
                <div className="space-y-1">
                  <SettingsMenuGroup
                    title="Data Settings"
                    expanded={expandedGroups.data}
                    onToggle={() => toggleGroup("data")}
                  />
                  {expandedGroups.data && (
                    <>
                      <SettingsMenuItem
                        icon={<File size={18} />}
                        title="Files"
                        active={activeSection === "files"}
                        onClick={() => setActiveSection("files")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Upload size={18} />}
                        title="Contacts Import"
                        active={activeSection === "contacts-import"}
                        onClick={() => setActiveSection("contacts-import")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Download size={18} />}
                        title="Data Export"
                        active={activeSection === "data-export"}
                        onClick={() => setActiveSection("data-export")}
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
                        icon={<Info size={18} />}
                        title="Account Info"
                        active={activeSection === "account-info"}
                        onClick={() => setActiveSection("account-info")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Users size={18} />}
                        title="User list"
                        active={activeSection === "user-list"}
                        onClick={() => setActiveSection("user-list")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Shield size={18} />}
                        title="Security"
                        active={activeSection === "security"}
                        onClick={() => setActiveSection("security")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<Briefcase size={18} />}
                        title="Workspaces"
                        active={activeSection === "workspaces"}
                        onClick={() => setActiveSection("workspaces")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<CreditCard size={18} />}
                        title="Billing & usage"
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
              {activeSection === "notification" && <NotificationSettings />}
              {activeSection === "team" && <TeamSettings />}
              {activeSection === "billing" && <BillingSettings />}
              {activeSection === "integration" && <IntegrationSettings />}
              {/* Aquí se pueden agregar más secciones según sea necesario */}
              {!["profile", "notification", "team", "billing", "integration"].includes(activeSection) && (
                <div className="text-center py-10">
                  <h3 className="text-xl font-medium text-gray-500">
                    Selecciona una sección para ver su configuración
                  </h3>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Perfil</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
            <img src="/empowered-trainer.png" alt="Foto de perfil" className="w-full h-full object-cover" />
          </div>
          <Button variant="outline" className="w-full">
            Cambiar Foto
          </Button>
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" defaultValue="Amanda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" defaultValue="Johnson" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue="amanda@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" defaultValue="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              rows={4}
              defaultValue="Especialista en marketing digital con 5 años de experiencia en gestión de campañas de redes sociales y estrategias de comunicación."
            />
          </div>
        </div>
      </div>
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
