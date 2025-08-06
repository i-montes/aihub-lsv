"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Shield, Settings, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

export default function UsuariosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Lista de Usuarios</h1>
        <p className="text-lg text-gray-600">
          Gestiona todos los usuarios de tu organización, sus roles, permisos y acceso a las herramientas de KIT.AI.
        </p>
      </div>

      {/* ¿Qué es la Lista de Usuarios? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>¿Qué es la Lista de Usuarios?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La Lista de Usuarios es el centro de control para gestionar todos los miembros de tu organización en KIT.AI. Desde aquí puedes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Ver todos los usuarios registrados en tu organización</li>
            <li>Invitar nuevos usuarios y gestionar invitaciones</li>
            <li>Asignar y modificar roles y permisos</li>
            <li>Monitorear la actividad y uso de herramientas</li>
            <li>Suspender o eliminar cuentas de usuario</li>
            <li>Configurar límites de uso y restricciones</li>
          </ul>
        </CardContent>
      </Card>

      {/* Roles y Permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Roles y Permisos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            KIT.AI utiliza un sistema de roles para controlar el acceso a funciones y herramientas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="destructive">Administrador</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acceso completo a todas las funciones</li>
                <li>• Gestión de usuarios y roles</li>
                <li>• Configuración de integraciones</li>
                <li>• Acceso a estadísticas y reportes</li>
                <li>• Gestión de facturación</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="default">Editor</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Uso de todas las herramientas de IA</li>
                <li>• Acceso a integraciones configuradas</li>
                <li>• Gestión de contenido propio</li>
                <li>• Visualización de estadísticas básicas</li>
                <li>• Sin acceso a configuración</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">Colaborador</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acceso limitado a herramientas</li>
                <li>• Solo herramientas asignadas</li>
                <li>• Sin acceso a integraciones</li>
                <li>• Límites de uso más restrictivos</li>
                <li>• Solo visualización de contenido propio</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline">Invitado</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acceso muy limitado</li>
                <li>• Solo herramientas específicas</li>
                <li>• Sin acceso a configuración</li>
                <li>• Límites de uso muy bajos</li>
                <li>• Acceso temporal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceder a la Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder a la Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Configuración"</strong></li>
            <li>Selecciona <strong>"Lista de usuarios"</strong> en el submenu</li>
            <li>Se mostrará la tabla con todos los usuarios de tu organización</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Configuración → Lista de usuarios
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interfaz de la Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Interfaz de la Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La interfaz principal incluye varios elementos para gestionar usuarios eficientemente:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Barra de Herramientas Superior</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Botón "Invitar Usuario":</strong> Para agregar nuevos miembros</li>
                <li><strong>Barra de búsqueda:</strong> Buscar por nombre, email o rol</li>
                <li><strong>Filtros:</strong> Filtrar por rol, estado, fecha de registro</li>
                <li><strong>Exportar:</strong> Descargar lista en CSV o Excel</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Tabla de Usuarios</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Avatar y Nombre:</strong> Foto de perfil y nombre completo</li>
                <li><strong>Email:</strong> Dirección de correo electrónico</li>
                <li><strong>Rol:</strong> Rol actual asignado con badge de color</li>
                <li><strong>Estado:</strong> Activo, Pendiente, Suspendido</li>
                <li><strong>Último acceso:</strong> Fecha y hora del último login</li>
                <li><strong>Acciones:</strong> Menú con opciones de gestión</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la interfaz completa de la lista de usuarios mostrando la tabla y herramientas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invitar Nuevos Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <span>Invitar Nuevos Usuarios</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Proceso de Invitación</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Haz clic en el botón <strong>"Invitar Usuario"</strong></li>
              <li>Se abrirá un formulario de invitación</li>
              <li>Completa la información requerida</li>
              <li>Selecciona el rol apropiado</li>
              <li>Configura permisos específicos (opcional)</li>
              <li>Envía la invitación</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Información Requerida</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Email del Usuario</p>
                <p className="text-sm text-gray-600">
                  Dirección de correo donde se enviará la invitación
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre Completo</p>
                <p className="text-sm text-gray-600">
                  Nombre y apellido del nuevo usuario
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Rol Inicial</p>
                <p className="text-sm text-gray-600">
                  Selecciona el rol que tendrá el usuario al aceptar la invitación
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Mensaje Personal (Opcional)</p>
                <p className="text-sm text-gray-600">
                  Mensaje personalizado que se incluirá en el email de invitación
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Configuración de Permisos</h3>
            <p className="text-gray-700">
              Puedes personalizar los permisos específicos para cada usuario:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded p-3">
                <h4 className="font-medium">Herramientas Permitidas</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Corrector de Texto</li>
                  <li>• Generador de Hilos</li>
                  <li>• Generador de Resúmenes</li>
                  <li>• Newsletter</li>
                </ul>
              </div>
              
              <div className="border rounded p-3">
                <h4 className="font-medium">Límites de Uso</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Requests por día</li>
                  <li>• Tokens máximos</li>
                  <li>• Archivos por mes</li>
                  <li>• Integraciones activas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del formulario de invitación de usuario con todos los campos visibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestionar Usuarios Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Usuarios Existentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Para cada usuario en la lista, puedes realizar varias acciones desde el menú de opciones:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Acciones Disponibles</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Eye className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Ver Perfil</p>
                    <p className="text-sm text-gray-600">
                      Visualiza información detallada del usuario, actividad reciente y estadísticas de uso
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Edit className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium">Editar Usuario</p>
                    <p className="text-sm text-gray-600">
                      Modifica información personal, rol, permisos y límites de uso
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Settings className="h-4 w-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium">Configurar Permisos</p>
                    <p className="text-sm text-gray-600">
                      Ajusta permisos específicos y acceso a herramientas individuales
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Trash2 className="h-4 w-4 text-red-600 mt-1" />
                  <div>
                    <p className="font-medium">Suspender/Eliminar</p>
                    <p className="text-sm text-gray-600">
                      Suspende temporalmente o elimina permanentemente la cuenta del usuario
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando el menú de acciones desplegado para un usuario
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda y Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-orange-600" />
            <span>Búsqueda y Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Búsqueda de Usuarios</h3>
              <p className="text-gray-700">
                Utiliza la barra de búsqueda para encontrar usuarios específicos:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Buscar por nombre completo</li>
                <li>Buscar por dirección de email</li>
                <li>Buscar por rol asignado</li>
                <li>Búsqueda en tiempo real mientras escribes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Filtros Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Por Rol</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Administradores</li>
                    <li>• Editores</li>
                    <li>• Colaboradores</li>
                    <li>• Invitados</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Por Estado</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Activos</li>
                    <li>• Pendientes</li>
                    <li>• Suspendidos</li>
                    <li>• Inactivos</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Por Fecha</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Registrados hoy</li>
                    <li>• Última semana</li>
                    <li>• Último mes</li>
                    <li>• Rango personalizado</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Por Actividad</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Activos hoy</li>
                    <li>• Activos esta semana</li>
                    <li>• Inactivos 30+ días</li>
                    <li>• Nunca han accedido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando los filtros aplicados y los resultados filtrados en la tabla
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas y Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas y Reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La sección de usuarios incluye estadísticas útiles para monitorear el uso de la plataforma:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Usuarios Totales</h4>
              <p className="text-2xl font-bold text-blue-900">156</p>
              <p className="text-sm text-blue-600">+12 este mes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Usuarios Activos</h4>
              <p className="text-2xl font-bold text-green-900">89</p>
              <p className="text-sm text-green-600">57% del total</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800">Invitaciones Pendientes</h4>
              <p className="text-2xl font-bold text-orange-900">7</p>
              <p className="text-sm text-orange-600">Enviadas esta semana</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Reportes Disponibles</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Reporte de Actividad:</strong> Uso de herramientas por usuario</li>
              <li><strong>Reporte de Accesos:</strong> Historial de logins y sesiones</li>
              <li><strong>Reporte de Permisos:</strong> Distribución de roles y permisos</li>
              <li><strong>Reporte de Uso:</strong> Consumo de tokens y recursos por usuario</li>
            </ul>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del dashboard de estadísticas de usuarios con gráficos y métricas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Mejores Prácticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Principio de menor privilegio:</strong> Asigna solo los permisos necesarios</li>
            <li><strong>Revisión regular:</strong> Audita usuarios y permisos mensualmente</li>
            <li><strong>Roles claros:</strong> Define roles específicos para diferentes funciones</li>
            <li><strong>Onboarding estructurado:</strong> Proceso claro para nuevos usuarios</li>
            <li><strong>Monitoreo de actividad:</strong> Revisa usuarios inactivos regularmente</li>
            <li><strong>Documentación:</strong> Mantén registro de cambios de permisos</li>
            <li><strong>Comunicación:</strong> Informa cambios de rol a los usuarios afectados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}