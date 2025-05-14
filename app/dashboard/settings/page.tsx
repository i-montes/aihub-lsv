"use client"

import { useState } from "react"
import { FitnessLayout } from "@/components/fitness-layout"
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
  BarChart,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  MoreVertical,
  FileText,
  ChevronLeft,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    <FitnessLayout>
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
                        icon={<FileText size={18} />}
                        title="Prompts"
                        active={activeSection === "prompts"}
                        onClick={() => setActiveSection("prompts")}
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
                        icon={<MessageSquare size={18} />}
                        title="Integrations"
                        active={activeSection === "integrations"}
                        onClick={() => setActiveSection("integrations")}
                        indented
                      />
                      <SettingsMenuItem
                        icon={<File size={18} />}
                        title="WordPress"
                        active={activeSection === "wordpress"}
                        onClick={() => setActiveSection("wordpress")}
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
              {activeSection === "user-list" && <UserListSettings />}
              {activeSection === "prompts" && <PromptsSettings />}
              {activeSection === "integrations" && <AIIntegrationsSettings />}
              {activeSection === "wordpress" && <WordPressSettings />}
              {/* Aquí se pueden agregar más secciones según sea necesario */}
              {![
                "profile",
                "notification",
                "team",
                "billing",
                "integration",
                "user-list",
                "prompts",
                "integrations",
                "wordpress",
              ].includes(activeSection) && (
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
    </FitnessLayout>
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

function AccountSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cuenta y Seguridad</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
          <div className="space-y-4">
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
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Seguridad de la Cuenta</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticación de Dos Factores</p>
                <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
              </div>
              <Switch id="2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sesiones Activas</p>
                <p className="text-sm text-gray-500">Gestiona tus sesiones activas en diferentes dispositivos</p>
              </div>
              <Button variant="outline">Ver Sesiones</Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium text-red-500">Zona de Peligro</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Desactivar Cuenta</p>
                <p className="text-sm text-gray-500">Desactiva temporalmente tu cuenta</p>
              </div>
              <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
                Desactivar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Eliminar Cuenta</p>
                <p className="text-sm text-gray-500">Elimina permanentemente tu cuenta y todos tus datos</p>
              </div>
              <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
                Eliminar
              </Button>
            </div>
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

function UserListSettings() {
  // Estado para controlar el modal de nuevo usuario
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  // Estado para controlar el modal de edición de usuario
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  // Estado para almacenar el usuario que se está editando
  const [editingUser, setEditingUser] = useState(null)

  // Datos de ejemplo para la lista de usuarios
  const users = [
    {
      id: 1,
      name: "Amanda Johnson",
      email: "amanda@example.com",
      role: "Administrador",
      department: "Marketing",
      status: "active",
      avatar: "/empowered-trainer.png",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      role: "Editor",
      department: "Redacción",
      status: "active",
      avatar: "/thoughtful-man-profile.png",
    },
    {
      id: 3,
      name: "María García",
      email: "maria@example.com",
      role: "Visualizador",
      department: "Diseño",
      status: "active",
      avatar: "/serene-woman-gaze.png",
    },
    {
      id: 4,
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Editor",
      department: "Investigación",
      status: "inactive",
      avatar: "/thoughtful-man-profile.png",
    },
    {
      id: 5,
      name: "Laura Sánchez",
      email: "laura@example.com",
      role: "Redactor",
      department: "Noticias",
      status: "active",
      avatar: "/serene-woman-gaze.png",
    },
    {
      id: 6,
      name: "Miguel Torres",
      email: "miguel@example.com",
      role: "Fotógrafo",
      department: "Multimedia",
      status: "active",
      avatar: "/thoughtful-man-profile.png",
    },
    {
      id: 7,
      name: "Ana Martínez",
      email: "ana@example.com",
      role: "Redactor",
      department: "Internacional",
      status: "inactive",
      avatar: "/serene-woman-gaze.png",
    },
  ]

  // Función para manejar la creación de un nuevo usuario
  const handleCreateUser = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para crear un nuevo usuario
    setIsNewUserModalOpen(false)
    // Mostrar alguna notificación de éxito
  }

  // Función para abrir el modal de edición con los datos del usuario
  const handleEditUser = (user) => {
    setEditingUser(user)
    setIsEditUserModalOpen(true)
  }

  // Función para guardar los cambios del usuario
  const handleSaveUserChanges = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar los datos del usuario
    setIsEditUserModalOpen(false)
    setEditingUser(null)
    // Mostrar alguna notificación de éxito
  }

  // Función para exportar usuarios a CSV
  const exportUsersToCSV = () => {
    // Encabezados del CSV
    const headers = ["Nombre", "Correo Electrónico", "Rol", "Departamento", "Estado"]

    // Convertir datos de usuarios a formato CSV
    const userDataCSV = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.department,
      user.status === "active" ? "Activo" : "Inactivo",
    ])

    // Combinar encabezados y datos
    const csvContent = [headers.join(","), ...userDataCSV.map((row) => row.join(","))].join("\n")

    // Crear un blob con el contenido CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Crear URL para el blob
    const url = URL.createObjectURL(blob)

    // Crear un elemento de enlace para descargar
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lista de Usuarios</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={exportUsersToCSV}>
            <FileText size={16} />
            Exportar
          </Button>
          <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsNewUserModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Añadir Usuario
          </Button>
        </div>
      </div>

      {/* Modal para crear nuevo usuario */}
      <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Complete el formulario para agregar un nuevo usuario al sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Nombre" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Apellido" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Administrador</option>
                    <option value="editor">Editor</option>
                    <option value="redactor">Redactor</option>
                    <option value="visualizador">Visualizador</option>
                    <option value="fotografo">Fotógrafo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <select
                    id="department"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar departamento</option>
                    <option value="marketing">Marketing</option>
                    <option value="redaccion">Redacción</option>
                    <option value="diseno">Diseño</option>
                    <option value="investigacion">Investigación</option>
                    <option value="noticias">Noticias</option>
                    <option value="multimedia">Multimedia</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="Contraseña" required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90">
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar usuario */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifique la información del usuario.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleSaveUserChanges}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">Nombre</Label>
                    <Input id="editFirstName" defaultValue={editingUser.name.split(" ")[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Apellido</Label>
                    <Input id="editLastName" defaultValue={editingUser.name.split(" ")[1] || ""} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Correo Electrónico</Label>
                  <Input id="editEmail" type="email" defaultValue={editingUser.email} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRole">Rol</Label>
                    <select
                      id="editRole"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={editingUser.role.toLowerCase()}
                      required
                    >
                      <option value="administrador">Administrador</option>
                      <option value="editor">Editor</option>
                      <option value="redactor">Redactor</option>
                      <option value="visualizador">Visualizador</option>
                      <option value="fotógrafo">Fotógrafo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDepartment">Departamento</Label>
                    <select
                      id="editDepartment"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={editingUser.department.toLowerCase()}
                      required
                    >
                      <option value="marketing">Marketing</option>
                      <option value="redacción">Redacción</option>
                      <option value="diseño">Diseño</option>
                      <option value="investigación">Investigación</option>
                      <option value="noticias">Noticias</option>
                      <option value="multimedia">Multimedia</option>
                      <option value="internacional">Internacional</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="editActive" defaultChecked={editingUser.status === "active"} />
                  <Label htmlFor="editActive">Usuario activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditUserModalOpen(false)
                    setEditingUser(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90">
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input className="pl-9 w-[300px] bg-white" placeholder="Buscar usuario..." />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter size={14} />
            Filtrar
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">Todos los departamentos</option>
            <option value="marketing">Marketing</option>
            <option value="redaccion">Redacción</option>
            <option value="diseno">Diseño</option>
            <option value="investigacion">Investigación</option>
            <option value="noticias">Noticias</option>
            <option value="multimedia">Multimedia</option>
            <option value="internacional">Internacional</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Usuario</th>
              <th className="py-3 px-4 text-left font-medium">Rol</th>
              <th className="py-3 px-4 text-left font-medium">Departamento</th>
              <th className="py-3 px-4 text-left font-medium">Estado</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{user.role}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{user.department}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditUser(user)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-4 px-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">Mostrando 1-7 de 7 usuarios</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HelpSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Ayuda y Soporte</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Centro de Ayuda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Guías de Inicio Rápido</h4>
              <p className="text-sm text-gray-500 mt-1">Aprende lo básico para comenzar a usar la plataforma</p>
              <Button variant="link" className="text-sidebar p-0 h-auto mt-2">
                Ver Guías
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Tutoriales en Video</h4>
              <p className="text-sm text-gray-500 mt-1">Aprende visualmente con nuestros tutoriales paso a paso</p>
              <Button variant="link" className="text-sidebar p-0 h-auto mt-2">
                Ver Tutoriales
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Preguntas Frecuentes</h4>
              <p className="text-sm text-gray-500 mt-1">Encuentra respuestas a las preguntas más comunes</p>
              <Button variant="link" className="text-sidebar p-0 h-auto mt-2">
                Ver FAQs
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Base de Conocimientos</h4>
              <p className="text-sm text-gray-500 mt-1">Explora artículos detallados sobre todas las funciones</p>
              <Button variant="link" className="text-sidebar p-0 h-auto mt-2">
                Explorar
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Contactar Soporte</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Chat en Vivo</h4>
              <p className="text-sm text-gray-500 mt-1">Habla con un agente de soporte en tiempo real</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-500">Disponible ahora</span>
              </div>
              <Button className="bg-sidebar text-white hover:bg-sidebar/90 mt-2">Iniciar Chat</Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium">Enviar Ticket</h4>
              <p className="text-sm text-gray-500 mt-1">Crea un ticket para problemas más complejos</p>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" placeholder="Describe brevemente tu problema" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Proporciona todos los detalles que puedas sobre el problema"
                  />
                </div>
                <Button className="bg-sidebar text-white hover:bg-sidebar/90">Enviar Ticket</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PromptsSettings() {
  // Estado para los prompts
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [testResult, setTestResult] = useState("")
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState(false)

  // Datos de ejemplo para las categorías
  const categories = [
    { id: "all", name: "Todos" },
    { id: "chatbot", name: "Chatbot" },
    { id: "email", name: "Correos" },
    { id: "social", name: "Redes Sociales" },
    { id: "support", name: "Soporte" },
    { id: "sales", name: "Ventas" },
  ]

  // Datos de ejemplo para los prompts
  const [prompts, setPrompts] = useState([
    {
      id: 1,
      title: "Bienvenida al chatbot",
      content:
        "Hola, soy el asistente virtual de [Nombre de la Empresa]. ¿En qué puedo ayudarte hoy? Puedo proporcionarte información sobre nuestros productos, servicios, o resolver dudas frecuentes.",
      category: "chatbot",
      variables: ["Nombre de la Empresa"],
      lastEdited: "Hace 2 días",
      status: "active",
      showAdvanced: false,
      complementaryPrompts: [
        {
          id: 101,
          title: "Respuesta a preguntas frecuentes",
          content:
            "Aquí tienes información sobre [Tema de Consulta] en [Nombre de la Empresa]. Si necesitas más detalles, no dudes en preguntar.",
        },
        {
          id: 102,
          title: "Despedida",
          content: "Gracias por contactar con [Nombre de la Empresa]. ¿Hay algo más en lo que pueda ayudarte hoy?",
        },
      ],
      advancedSettings: {
        temperature: 0.7,
        topP: 1,
        maxTokens: 256,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 2,
      title: "Respuesta a consulta de producto",
      content:
        "Gracias por tu interés en [Nombre del Producto]. Este producto ofrece [Características]. El precio actual es [Precio]. ¿Te gustaría obtener más información o proceder con una compra?",
      category: "chatbot",
      variables: ["Nombre del Producto", "Características", "Precio"],
      lastEdited: "Hace 1 semana",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.8,
        topP: 1,
        maxTokens: 200,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 3,
      title: "Plantilla de correo de bienvenida",
      content:
        "Estimado/a [Nombre del Cliente],\n\nBienvenido/a a [Nombre de la Empresa]. Estamos encantados de tenerte como parte de nuestra comunidad.\n\nTu cuenta ha sido activada correctamente y ya puedes comenzar a disfrutar de todos nuestros servicios.\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\nSaludos cordiales,\n[Nombre del Remitente]\n[Cargo]\n[Nombre de la Empresa]",
      category: "email",
      variables: ["Nombre del Cliente", "Nombre de la Empresa", "Nombre del Remitente", "Cargo"],
      lastEdited: "Hace 3 días",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.5,
        topP: 1,
        maxTokens: 300,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 4,
      title: "Publicación para Instagram",
      content:
        "✨ ¡Nuevo [Tipo de Contenido] disponible! ✨\n\nDescubre cómo [Beneficio Principal] con nuestro último [Producto/Servicio].\n\n👉 [Call to Action]\n\n#[Hashtag1] #[Hashtag2] #[Hashtag3]",
      category: "social",
      variables: [
        "Tipo de Contenido",
        "Beneficio Principal",
        "Producto/Servicio",
        "Call to Action",
        "Hashtag1",
        "Hashtag2",
        "Hashtag3",
      ],
      lastEdited: "Hace 5 días",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.9,
        topP: 1,
        maxTokens: 150,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 5,
      title: "Respuesta a ticket de soporte",
      content:
        "Estimado/a [Nombre del Cliente],\n\nHemos recibido tu solicitud de soporte con el número de ticket [Número de Ticket].\n\nNuestro equipo está trabajando para resolver tu problema relacionado con [Descripción del Problema].\n\nTe contactaremos tan pronto como tengamos una solución.\n\nAtentamente,\nEquipo de Soporte\n[Nombre de la Empresa]",
      category: "support",
      variables: ["Nombre del Cliente", "Número de Ticket", "Descripción del Problema", "Nombre de la Empresa"],
      lastEdited: "Hace 1 día",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.6,
        topP: 1,
        maxTokens: 250,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 6,
      title: "Seguimiento de venta",
      content:
        "Hola [Nombre del Cliente],\n\nEspero que estés bien. Quería hacer un seguimiento sobre [Producto/Servicio] que discutimos el [Fecha de Contacto Anterior].\n\n¿Has tenido tiempo de revisar la propuesta? Estoy disponible para resolver cualquier duda que puedas tener.\n\nSaludos cordiales,\n[Nombre del Vendedor]\n[Cargo]\n[Nombre de la Empresa]",
      category: "sales",
      variables: [
        "Nombre del Cliente",
        "Producto/Servicio",
        "Fecha de Contacto Anterior",
        "Nombre del Vendedor",
        "Cargo",
        "Nombre de la Empresa",
      ],
      lastEdited: "Hace 4 días",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.7,
        topP: 1,
        maxTokens: 200,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
    {
      id: 7,
      title: "Respuesta automática fuera de horario",
      content:
        "Gracias por contactarnos. En este momento nos encontramos fuera de nuestro horario de atención, que es de [Horario de Atención].\n\nTu mensaje es importante para nosotros y te responderemos tan pronto como regresemos a la oficina.\n\nSi tu consulta es urgente, puedes llamarnos al [Número de Emergencia].\n\nAtentamente,\nEquipo de [Nombre de la Empresa]",
      category: "support",
      variables: ["Horario de Atención", "Número de Emergencia", "Nombre de la Empresa"],
      lastEdited: "Hace 2 semanas",
      status: "active",
      showAdvanced: false,
      advancedSettings: {
        temperature: 0.5,
        topP: 1,
        maxTokens: 150,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    },
  ])

  // Filtrar prompts según la búsqueda y categoría
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || prompt.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Función para guardar un prompt editado
  const handleSavePrompt = (updatedPrompt) => {
    // Actualizar las variables detectadas para el prompt principal
    const detectedVariables = (updatedPrompt.content.match(/\[(.*?)\]/g) || [])
      .map((match) => match.replace(/[[\]]/g, ""))
      .filter((value, index, self) => self.indexOf(value) === index)

    // Actualizar las variables detectadas para los prompts complementarios
    if (updatedPrompt.complementaryPrompts && updatedPrompt.complementaryPrompts.length > 0) {
      updatedPrompt.complementaryPrompts.forEach((prompt) => {
        const promptVariables = (prompt.content.match(/\[(.*?)\]/g) || [])
          .map((match) => match.replace(/[[\]]/g, ""))
          .filter((value, index, self) => self.indexOf(value) === index)

        // Añadir variables únicas que no estén ya en detectedVariables
        promptVariables.forEach((variable) => {
          if (!detectedVariables.includes(variable)) {
            detectedVariables.push(variable)
          }
        })
      })
    }

    const finalPrompt = {
      ...updatedPrompt,
      variables: detectedVariables,
      lastEdited: "Justo ahora",
    }

    setPrompts(prompts.map((p) => (p.id === finalPrompt.id ? finalPrompt : p)))
    setEditingPrompt(null)
  }

  // Función para crear un nuevo prompt
  const handleCreatePrompt = (newPrompt) => {
    const newId = Math.max(...prompts.map((p) => p.id)) + 1
    const promptToAdd = {
      ...newPrompt,
      id: newId,
      lastEdited: "Justo ahora",
      status: "active",
      complementaryPrompts: newPrompt.complementaryPrompts || [],
      advancedSettings: newPrompt.advancedSettings || {
        temperature: 0.7,
        topP: 1,
        maxTokens: 256,
        presencePenalty: 0,
        frequencyPenalty: 0,
        stopSequences: [],
      },
    }
    setPrompts([...prompts, promptToAdd])
    setIsNewPromptModalOpen(false)
  }

  // Función para probar un prompt
  const handleTestPrompt = (prompt) => {
    // Simulación de prueba de prompt
    const testPrompt = { ...prompt }
    let testContent = testPrompt.content

    // Reemplazar variables con valores de ejemplo en el prompt principal
    testPrompt.variables.forEach((variable) => {
      const exampleValue = `[Ejemplo de ${variable}]`
      testContent = testContent.replace(new RegExp(`\\[${variable}\\]`, "g"), exampleValue)
    })

    // Si hay prompts complementarios, añadirlos al resultado
    if (testPrompt.complementaryPrompts && testPrompt.complementaryPrompts.length > 0) {
      testContent += "\n\n--- Prompts complementarios ---\n\n"

      testPrompt.complementaryPrompts.forEach((complementaryPrompt, index) => {
        let complementaryContent = complementaryPrompt.content

        // Reemplazar variables en el prompt complementario
        testPrompt.variables.forEach((variable) => {
          const exampleValue = `[Ejemplo de ${variable}]`
          complementaryContent = complementaryContent.replace(new RegExp(`\\[${variable}\\]`, "g"), exampleValue)
        })

        testContent += `${complementaryPrompt.title || `Complementario ${index + 1}`}:\n${complementaryContent}\n\n`
      })
    }

    setTestResult(testContent)
    setIsTestModalOpen(true)
  }

  // Función para eliminar un prompt
  const handleDeletePrompt = (promptId) => {
    setPrompts(prompts.filter((p) => p.id !== promptId))
  }

  // Función para editar un prompt
  const handleEditPrompt = (prompt) => {
    setEditingPrompt({ ...prompt, showAdvanced: false, activePromptTab: 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Prompts</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsNewPromptModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nuevo Prompt
        </Button>
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            className="pl-9 bg-white"
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="flex overflow-x-auto py-1 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={activeCategory === category.id ? "bg-sidebar text-white" : ""}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de prompts */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <FileText size={48} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">No se encontraron prompts</h3>
            <p className="text-sm text-gray-400">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      prompt.category === "chatbot"
                        ? "bg-sidebar"
                        : prompt.category === "email"
                          ? "bg-yellow"
                          : prompt.category === "social"
                            ? "bg-coral"
                            : prompt.category === "support"
                              ? "bg-green-600"
                              : "bg-accent"
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium">{prompt.title}</h3>
                    <p className="text-xs text-gray-500">
                      {categories.find((c) => c.id === prompt.category)?.name} • Editado: {prompt.lastEdited}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleTestPrompt(prompt)}>
                    Probar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditPrompt(prompt)}>
                    Editar
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                <div className="bg-white border rounded-md p-3 whitespace-pre-line text-sm">{prompt.content}</div>
                {prompt.variables.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {prompt.variables.map((variable, index) => (
                        <div key={index} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                          {variable}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para editar prompt */}

      <Dialog open={editingPrompt !== null} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Prompt</DialogTitle>
            <DialogDescription>Modifica el contenido y las propiedades del prompt.</DialogDescription>
          </DialogHeader>
          {editingPrompt && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Columna izquierda: Contenido del prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="promptContent">Contenido</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        // Lógica para añadir un nuevo prompt complementario
                        const newPrompts = [
                          ...(editingPrompt.complementaryPrompts || []),
                          {
                            id: Date.now(),
                            title: "Nuevo prompt complementario",
                            content: "",
                          },
                        ]
                        setEditingPrompt({
                          ...editingPrompt,
                          complementaryPrompts: newPrompts,
                          activePromptTab: newPrompts.length,
                        })
                      }}
                    >
                      Añadir prompt complementario
                    </Button>
                  </div>
                </div>

                {/* Tabs para prompts complementarios */}
                <div className="border-b mb-2">
                  <div className="flex overflow-x-auto">
                    <button
                      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                        !editingPrompt.activePromptTab
                          ? "border-sidebar text-sidebar"
                          : "border-transparent hover:text-sidebar"
                      }`}
                      onClick={() => setEditingPrompt({ ...editingPrompt, activePromptTab: 0 })}
                    >
                      Principal
                    </button>

                    {(editingPrompt.complementaryPrompts || []).map((prompt, index) => (
                      <div key={prompt.id} className="relative group">
                        <button
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                            editingPrompt.activePromptTab === index + 1
                              ? "border-sidebar text-sidebar"
                              : "border-transparent hover:text-sidebar"
                          }`}
                          onClick={() => setEditingPrompt({ ...editingPrompt, activePromptTab: index + 1 })}
                        >
                          {prompt.title || `Complementario ${index + 1}`}
                        </button>
                        <button
                          className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          onClick={() => {
                            // Eliminar este prompt complementario
                            const newPrompts = [...(editingPrompt.complementaryPrompts || [])]
                            newPrompts.splice(index, 1)
                            const newActiveTab =
                              editingPrompt.activePromptTab > index + 1
                                ? editingPrompt.activePromptTab - 1
                                : editingPrompt.activePromptTab === index + 1
                                  ? 0
                                  : editingPrompt.activePromptTab

                            setEditingPrompt({
                              ...editingPrompt,
                              complementaryPrompts: newPrompts,
                              activePromptTab: newActiveTab,
                            })
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor de contenido según la pestaña activa */}
                {editingPrompt.activePromptTab === 0 ? (
                  <Textarea
                    id="promptContent"
                    rows={16}
                    value={editingPrompt.content}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                    className="font-mono text-sm h-[400px] resize-none"
                  />
                ) : (
                  <Textarea
                    id={`promptContent-${editingPrompt.activePromptTab}`}
                    rows={16}
                    value={editingPrompt.complementaryPrompts[editingPrompt.activePromptTab - 1].content}
                    onChange={(e) => {
                      const newPrompts = [...(editingPrompt.complementaryPrompts || [])]
                      newPrompts[editingPrompt.activePromptTab - 1].content = e.target.value
                      setEditingPrompt({
                        ...editingPrompt,
                        complementaryPrompts: newPrompts,
                      })
                    }}
                    className="font-mono text-sm h-[400px] resize-none"
                  />
                )}

                <p className="text-xs text-gray-500">
                  Usa [Variable] para definir variables que se reemplazarán al usar el prompt.
                  {editingPrompt.activePromptTab > 0 &&
                    " Este prompt complementario se utilizará junto con el prompt principal."}
                </p>
              </div>

              {/* Columna derecha: Configuraciones */}
              <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label htmlFor="promptTitle">Título</Label>
                  <Input
                    id="promptTitle"
                    value={editingPrompt.title}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promptCategory">Categoría</Label>
                  <select
                    id="promptCategory"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingPrompt.category}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, category: e.target.value })}
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Variables detectadas</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[100px] max-h-[120px] overflow-y-auto">
                    {/* Extraer variables del contenido usando regex */}
                    {(editingPrompt.content.match(/\[(.*?)\]/g) || [])
                      .map((match) => match.replace(/[[\]]/g, ""))
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .map((variable, index) => (
                        <div key={index} className="px-2 py-1 bg-sidebar text-white rounded-full text-xs">
                          {variable}
                        </div>
                      ))}
                    {(editingPrompt.content.match(/\[(.*?)\]/g) || []).length === 0 && (
                      <p className="text-xs text-gray-400">No se han detectado variables</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Las variables se detectan automáticamente del contenido usando el formato [Variable].
                  </p>
                </div>

                {/* Configuración avanzada en acordeón */}
                <div className="border rounded-md">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() =>
                      setEditingPrompt({
                        ...editingPrompt,
                        showAdvanced: !editingPrompt.showAdvanced,
                      })
                    }
                  >
                    <Label className="cursor-pointer font-medium">Configuración avanzada</Label>
                    <ChevronRight
                      size={18}
                      className={`transition-transform ${editingPrompt.showAdvanced ? "rotate-90" : ""}`}
                    />
                  </div>

                  {editingPrompt.showAdvanced && (
                    <div className="p-3 pt-0 border-t space-y-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Restablecer a valores predeterminados
                            setEditingPrompt({
                              ...editingPrompt,
                              advancedSettings: {
                                temperature: 0.7,
                                topP: 1,
                                maxTokens: 256,
                                presencePenalty: 0,
                                frequencyPenalty: 0,
                                stopSequences: [],
                              },
                            })
                          }}
                        >
                          Restablecer valores
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="temperature" className="text-sm">
                              Temperatura: {editingPrompt.advancedSettings.temperature}
                            </Label>
                            <span className="text-xs text-gray-500">(0.1 - 1.0)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">0.1</span>
                            <input
                              id="temperature"
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={editingPrompt.advancedSettings.temperature}
                              onChange={(e) =>
                                setEditingPrompt({
                                  ...editingPrompt,
                                  advancedSettings: {
                                    ...editingPrompt.advancedSettings,
                                    temperature: Number.parseFloat(e.target.value),
                                  },
                                })
                              }
                              className="flex-1"
                            />
                            <span className="text-xs">1.0</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Controla la aleatoriedad de las respuestas. Valores más altos producen respuestas más
                            creativas.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="topP" className="text-sm">
                              Top P: {editingPrompt.advancedSettings.topP}
                            </Label>
                            <span className="text-xs text-gray-500">(0.1 - 1.0)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">0.1</span>
                            <input
                              id="topP"
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={editingPrompt.advancedSettings.topP}
                              onChange={(e) =>
                                setEditingPrompt({
                                  ...editingPrompt,
                                  advancedSettings: {
                                    ...editingPrompt.advancedSettings,
                                    topP: Number.parseFloat(e.target.value),
                                  },
                                })
                              }
                              className="flex-1"
                            />
                            <span className="text-xs">1.0</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Controla la diversidad mediante nucleus sampling. Valores más bajos = respuestas más
                            enfocadas.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="maxTokens" className="text-sm">
                              Máximo de tokens: {editingPrompt.advancedSettings.maxTokens}
                            </Label>
                          </div>
                          <Input
                            id="maxTokens"
                            type="number"
                            min="1"
                            max="4000"
                            value={editingPrompt.advancedSettings.maxTokens}
                            onChange={(e) =>
                              setEditingPrompt({
                                ...editingPrompt,
                                advancedSettings: {
                                  ...editingPrompt.advancedSettings,
                                  maxTokens: Number.parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            Limita la longitud de la respuesta generada. Un token es aproximadamente 4 caracteres.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="presencePenalty" className="text-sm">
                              Penalización de presencia: {editingPrompt.advancedSettings.presencePenalty}
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">0</span>
                              <input
                                id="presencePenalty"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={editingPrompt.advancedSettings.presencePenalty}
                                onChange={(e) =>
                                  setEditingPrompt({
                                    ...editingPrompt,
                                    advancedSettings: {
                                      ...editingPrompt.advancedSettings,
                                      presencePenalty: Number.parseFloat(e.target.value),
                                    },
                                  })
                                }
                                className="flex-1"
                              />
                              <span className="text-xs">2.0</span>
                            </div>
                            <p className="text-xs text-gray-500">Reduce la repetición de temas.</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="frequencyPenalty" className="text-sm">
                              Penalización de frecuencia: {editingPrompt.advancedSettings.frequencyPenalty}
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">0</span>
                              <input
                                id="frequencyPenalty"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={editingPrompt.advancedSettings.frequencyPenalty}
                                onChange={(e) =>
                                  setEditingPrompt({
                                    ...editingPrompt,
                                    advancedSettings: {
                                      ...editingPrompt.advancedSettings,
                                      frequencyPenalty: Number.parseFloat(e.target.value),
                                    },
                                  })
                                }
                                className="flex-1"
                              />
                              <span className="text-xs">2.0</span>
                            </div>
                            <p className="text-xs text-gray-500">Reduce la repetición de palabras.</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stopSequences" className="text-sm">
                            Secuencias de parada (una por línea)
                          </Label>
                          <Textarea
                            id="stopSequences"
                            rows={2}
                            value={editingPrompt.advancedSettings.stopSequences.join("\n")}
                            onChange={(e) =>
                              setEditingPrompt({
                                ...editingPrompt,
                                advancedSettings: {
                                  ...editingPrompt.advancedSettings,
                                  stopSequences: e.target.value.split("\n").filter((seq) => seq.trim() !== ""),
                                },
                              })
                            }
                            placeholder="Ejemplo: ###\nFIN"
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Secuencias que detienen la generación de texto cuando aparecen.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="promptActive"
                    checked={editingPrompt.status === "active"}
                    onCheckedChange={(checked) =>
                      setEditingPrompt({
                        ...editingPrompt,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
                  <Label htmlFor="promptActive">Prompt activo</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              className="text-red-500 hover:bg-red-50"
              onClick={() => {
                handleDeletePrompt(editingPrompt.id)
                setEditingPrompt(null)
              }}
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                Cancelar
              </Button>
              <Button
                className="bg-sidebar text-white hover:bg-sidebar/90"
                onClick={() => {
                  // Actualizar las variables detectadas
                  const detectedVariables = (editingPrompt.content.match(/\[(.*?)\]/g) || [])
                    .map((match) => match.replace(/[[\]]/g, ""))
                    .filter((value, index, self) => self.indexOf(value) === index)

                  handleSavePrompt({
                    ...editingPrompt,
                    variables: detectedVariables,
                    lastEdited: "Justo ahora",
                  })
                }}
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para crear nuevo prompt */}
      <Dialog open={isNewPromptModalOpen} onOpenChange={setIsNewPromptModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Prompt</DialogTitle>
            <DialogDescription>Añade un nuevo prompt a tu biblioteca.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Columna izquierda: Contenido del prompt */}
            <div className="space-y-2">
              <Label htmlFor="newPromptContent">Contenido</Label>
              <Textarea
                id="newPromptContent"
                rows={16}
                placeholder="Escribe el contenido del prompt aquí..."
                className="font-mono text-sm h-[400px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Usa [Variable] para definir variables que se reemplazarán al usar el prompt.
              </p>
            </div>

            {/* Columna derecha: Configuraciones */}
            <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="newPromptTitle">Título</Label>
                <Input id="newPromptTitle" placeholder="Título del prompt" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPromptCategory">Categoría</Label>
                <select
                  id="newPromptCategory"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="chatbot"
                >
                  {categories
                    .filter((c) => c.id !== "all")
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Configuración avanzada en acordeón */}
              <div className="border rounded-md">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => {
                    const accordionElement = document.getElementById("newPromptAdvancedSettings")
                    if (accordionElement) {
                      accordionElement.classList.toggle("hidden")
                      document.getElementById("newPromptAdvancedChevron")?.classList.toggle("rotate-90")
                    }
                  }}
                >
                  <Label className="cursor-pointer font-medium">Configuración avanzada</Label>
                  <ChevronRight id="newPromptAdvancedChevron" size={18} className="transition-transform" />
                </div>

                <div id="newPromptAdvancedSettings" className="p-3 pt-0 border-t space-y-4 hidden">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newTemperature" className="text-sm">
                          Temperatura: 0.7
                        </Label>
                        <span className="text-xs text-gray-500">(0.1 - 1.0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">0.1</span>
                        <input
                          id="newTemperature"
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="flex-1"
                        />
                        <span className="text-xs">1.0</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Controla la aleatoriedad de las respuestas. Valores más altos producen respuestas más creativas.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newTopP" className="text-sm">
                          Top P: 1.0
                        </Label>
                        <span className="text-xs text-gray-500">(0.1 - 1.0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">0.1</span>
                        <input
                          id="newTopP"
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          defaultValue="1"
                          className="flex-1"
                        />
                        <span className="text-xs">1.0</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Controla la diversidad mediante nucleus sampling. Valores más bajos = respuestas más enfocadas.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newMaxTokens" className="text-sm">
                          Máximo de tokens
                        </Label>
                      </div>
                      <Input id="newMaxTokens" type="number" min="1" max="4000" defaultValue="256" className="w-full" />
                      <p className="text-xs text-gray-500">
                        Limita la longitud de la respuesta generada. Un token es aproximadamente 4 caracteres.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPresencePenalty" className="text-sm">
                          Penalización de presencia: 0
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">0</span>
                          <input
                            id="newPresencePenalty"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            defaultValue="0"
                            className="flex-1"
                          />
                          <span className="text-xs">2.0</span>
                        </div>
                        <p className="text-xs text-gray-500">Reduce la repetición de temas.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newFrequencyPenalty" className="text-sm">
                          Penalización de frecuencia: 0
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">0</span>
                          <input
                            id="newFrequencyPenalty"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            defaultValue="0"
                            className="flex-1"
                          />
                          <span className="text-xs">2.0</span>
                        </div>
                        <p className="text-xs text-gray-500">Reduce la repetición de palabras.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newStopSequences" className="text-sm">
                        Secuencias de parada (una por línea)
                      </Label>
                      <Textarea
                        id="newStopSequences"
                        rows={2}
                        placeholder="Ejemplo: ###\nFIN"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Secuencias que detienen la generación de texto cuando aparecen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPromptModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-sidebar text-white hover:bg-sidebar/90"
              onClick={() => {
                const title = document.getElementById("newPromptTitle").value
                const category = document.getElementById("newPromptCategory").value
                const content = document.getElementById("newPromptContent").value
                const temperature = Number.parseFloat(document.getElementById("newTemperature").value)
                const topP = Number.parseFloat(document.getElementById("newTopP").value)
                const maxTokens = Number.parseInt(document.getElementById("newMaxTokens").value)
                const presencePenalty = Number.parseFloat(document.getElementById("newPresencePenalty").value)
                const frequencyPenalty = Number.parseFloat(document.getElementById("newFrequencyPenalty").value)
                const stopSequences = document
                  .getElementById("newStopSequences")
                  .value.split("\n")
                  .filter((seq) => seq.trim() !== "")

                if (!title || !content) return

                // Extraer variables del contenido
                const variables = (content.match(/\[(.*?)\]/g) || [])
                  .map((match) => match.replace(/[[\]]/g, ""))
                  .filter((value, index, self) => self.indexOf(value) === index)

                handleCreatePrompt({
                  title,
                  category,
                  content,
                  variables,
                  showAdvanced: false,
                  advancedSettings: {
                    temperature,
                    topP,
                    maxTokens,
                    presencePenalty,
                    frequencyPenalty,
                    stopSequences,
                  },
                })
              }}
            >
              Crear Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para probar prompt */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vista previa del Prompt</DialogTitle>
            <DialogDescription>Así es como se verá el prompt con las variables reemplazadas.</DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="bg-white border rounded-md p-4 whitespace-pre-line">{testResult}</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTestModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AIIntegrationsSettings() {
  const [activeTab, setActiveTab] = useState("openai")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState({ success: false, message: "" })
  const [showTestResult, setShowTestResult] = useState(false)
  const [isRevealed, setIsRevealed] = useState({
    openai: false,
    gemini: false,
    perplexity: false,
  })

  // Función para probar la conexión
  const testConnection = (provider) => {
    setIsTestingConnection(true)
    setShowTestResult(false)

    // Simulación de prueba de conexión
    setTimeout(() => {
      setIsTestingConnection(false)
      setShowTestResult(true)

      // Simulamos éxito para OpenAI y Gemini, error para Perplexity
      if (provider === "perplexity") {
        setTestResult({
          success: false,
          message: "Error de autenticación: API key inválida o expirada.",
        })
      } else {
        setTestResult({
          success: true,
          message: "Conexión exitosa. La API key es válida.",
        })
      }
    }, 1500)
  }

  // Función para alternar la visibilidad de la API key
  const toggleReveal = (provider) => {
    setIsRevealed({
      ...isRevealed,
      [provider]: !isRevealed[provider],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Integraciones de IA</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Guardar Cambios</Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-sm text-gray-600">
          Configura las API keys para los diferentes proveedores de IA que utilizas en tu plataforma. Estas
          integraciones te permitirán utilizar modelos de lenguaje avanzados en tus chatbots, generación de contenido y
          otras funcionalidades.
        </p>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "openai" ? "text-sidebar border-b-2 border-sidebar" : "text-gray-500 hover:text-sidebar"
          }`}
          onClick={() => setActiveTab("openai")}
        >
          OpenAI
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "gemini" ? "text-sidebar border-b-2 border-sidebar" : "text-gray-500 hover:text-sidebar"
          }`}
          onClick={() => setActiveTab("gemini")}
        >
          Gemini
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "perplexity" ? "text-sidebar border-b-2 border-sidebar" : "text-gray-500 hover:text-sidebar"
          }`}
          onClick={() => setActiveTab("perplexity")}
        >
          Perplexity
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "openai" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">OpenAI</h3>
                <p className="text-sm text-gray-500">
                  Configura tu API key de OpenAI para usar modelos como GPT-4o, GPT-4 y GPT-3.5
                </p>
              </div>
              <div className="w-12 h-12 bg-sidebar rounded-full flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-api-key"
                    type={isRevealed.openai ? "text" : "password"}
                    placeholder="sk-..."
                    defaultValue="sk-1234567890abcdefghijklmnopqrstuvwxyz"
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal("openai")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {isRevealed.openai ? (
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
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
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
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Puedes obtener tu API key en el{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sidebar hover:underline"
                  >
                    panel de OpenAI
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-org-id">ID de Organización (opcional)</Label>
                <Input id="openai-org-id" placeholder="org-..." />
                <p className="text-xs text-gray-500">
                  Si perteneces a múltiples organizaciones, especifica cuál quieres usar.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Modelos disponibles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-gpt4o" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-gpt4o" className="text-sm font-normal">
                      GPT-4o
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-gpt4" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-gpt4" className="text-sm font-normal">
                      GPT-4
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-gpt35" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-gpt35" className="text-sm font-normal">
                      GPT-3.5 Turbo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-dalle3" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-dalle3" className="text-sm font-normal">
                      DALL-E 3
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => testConnection("openai")}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && activeTab === "openai" ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-sidebar"
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
                  Probar conexión
                </Button>
                <div className="flex items-center space-x-2">
                  <Switch id="openai-active" defaultChecked />
                  <Label htmlFor="openai-active">Activo</Label>
                </div>
              </div>

              {showTestResult && activeTab === "openai" && (
                <div
                  className={`p-3 rounded-md text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "gemini" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Gemini</h3>
                <p className="text-sm text-gray-500">Configura tu API key de Google para usar modelos Gemini</p>
              </div>
              <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center text-sidebar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="gemini-api-key"
                    type={isRevealed.gemini ? "text" : "password"}
                    placeholder="AIza..."
                    defaultValue="AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz"
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal("gemini")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {isRevealed.gemini ? (
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
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
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
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Puedes obtener tu API key en la{" "}
                  <a
                    href="https://ai.google.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sidebar hover:underline"
                  >
                    consola de Google AI Studio
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <Label>Modelos disponibles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-gemini-pro" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-gemini-pro" className="text-sm font-normal">
                      Gemini Pro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="model-gemini-pro-vision"
                      className="rounded border-gray-300"
                      defaultChecked
                    />
                    <Label htmlFor="model-gemini-pro-vision" className="text-sm font-normal">
                      Gemini Pro Vision
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-gemini-ultra" className="rounded border-gray-300" />
                    <Label htmlFor="model-gemini-ultra" className="text-sm font-normal">
                      Gemini Ultra
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => testConnection("gemini")}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && activeTab === "gemini" ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-sidebar"
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
                  Probar conexión
                </Button>
                <div className="flex items-center space-x-2">
                  <Switch id="gemini-active" defaultChecked />
                  <Label htmlFor="gemini-active">Activo</Label>
                </div>
              </div>

              {showTestResult && activeTab === "gemini" && (
                <div
                  className={`p-3 rounded-md text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "perplexity" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Perplexity</h3>
                <p className="text-sm text-gray-500">Configura tu API key de Perplexity para usar modelos como Sonar</p>
              </div>
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="perplexity-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="perplexity-api-key"
                    type={isRevealed.perplexity ? "text" : "password"}
                    placeholder="pplx-..."
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal("perplexity")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {isRevealed.perplexity ? (
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
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
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
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Puedes obtener tu API key en el{" "}
                  <a
                    href="https://www.perplexity.ai/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sidebar hover:underline"
                  >
                    panel de Perplexity
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <Label>Modelos disponibles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-sonar-small" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-sonar-small" className="text-sm font-normal">
                      Sonar Small
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-sonar-medium" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-sonar-medium" className="text-sm font-normal">
                      Sonar Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="model-sonar-large" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="model-sonar-large" className="text-sm font-normal">
                      Sonar Large
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => testConnection("perplexity")}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && activeTab === "perplexity" ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-sidebar"
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
                  Probar conexión
                </Button>
                <div className="flex items-center space-x-2">
                  <Switch id="perplexity-active" />
                  <Label htmlFor="perplexity-active">Activo</Label>
                </div>
              </div>

              {showTestResult && activeTab === "perplexity" && (
                <div
                  className={`p-3 rounded-md text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WordPressSettings() {
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      <input type="checkbox" id="perm-comments" className="rounded border-gray-300" defaultChecked />
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

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sitios conectados</h3>

          {sites.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-300 mb-2"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11h.01" />
                <path d="M13 11h.01" />
                <path d="M10 11h.01" />
                <path d="M7 11h.01" />
                <path d="M7 15h.01" />
                <path d="M10 15h.01" />
                <path d="M13 15h.01" />
                <path d="M16 15h.01" />
                <path d="M7 8h.01" />
                <path d="M10 8h.01" />
                <path d="M13 8h.01" />
                <path d="M16 8h.01" />
              </svg>
              <h3 className="text-lg font-medium text-gray-500">No hay sitios conectados</h3>
              <p className="text-sm text-gray-400">Conecta tu primer sitio WordPress para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map((site) => (
                <div key={site.id} className="flex items-center justify-between p-4 bg-white border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sidebar rounded-full flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M12 8v1" />
                        <path d="M12 15v1" />
                        <path d="M16 12h-1" />
                        <path d="M9 12H8" />
                        <path d="m15 9-.88.88" />
                        <path d="M9.88 14.12 9 15" />
                        <path d="m15 15-.88-.88" />
                        <path d="M9.88 9.88 9 9" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">{site.name}</h4>
                      <p className="text-xs text-gray-500">{site.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        site.status === "connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {site.status === "connected" ? "Conectado" : "Desconectado"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (site.status === "connected" ? disconnectSite(site.id) : testConnection())}
                    >
                      {site.status === "connected" ? "Desconectar" : "Reconectar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-500"
                      onClick={() => removeSite(site.id)}
                    >
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
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración de sincronización</h3>

          <div className="space-y-4 p-4 bg-white border rounded-xl">
            <div className="space-y-2">
              <Label>Tipos de contenido a sincronizar</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-posts" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-posts" className="text-sm font-normal">
                    Entradas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-pages" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-pages" className="text-sm font-normal">
                    Páginas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-media" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-media" className="text-sm font-normal">
                    Medios
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-comments" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-comments" className="text-sm font-normal">
                    Comentarios
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-categories" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-categories" className="text-sm font-normal">
                    Categorías
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-tags" className="rounded border-gray-300" defaultChecked />
                  <Label htmlFor="sync-tags" className="text-sm font-normal">
                    Etiquetas
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Frecuencia de sincronización</Label>
              <select
                id="sync-frequency"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="hourly"
              >
                <option value="realtime">Tiempo real</option>
                <option value="hourly">Cada hora</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="manual">Manual</option>
              </select>
              <p className="text-xs text-gray-500">
                Determina con qué frecuencia se sincronizará el contenido entre esta plataforma y WordPress.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Switch id="sync-active" defaultChecked={isConnected} disabled={!isConnected} />
                <Label htmlFor="sync-active">Sincronización activa</Label>
              </div>
              <Button variant="outline" disabled={!isConnected}>
                Sincronizar ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
