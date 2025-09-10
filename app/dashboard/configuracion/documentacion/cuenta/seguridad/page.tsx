"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Key, Smartphone, Eye, AlertTriangle, CheckCircle, Clock, Globe, Monitor } from "lucide-react"

export default function SeguridadPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Seguridad de la Cuenta</h1>
        <p className="text-lg text-gray-600">
          Protege tu cuenta con configuraciones de seguridad avanzadas, autenticación de dos factores y monitoreo de actividad.
        </p>
      </div>

      {/* Importancia de la Seguridad */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <Shield className="h-5 w-5" />
            <span>¿Por qué es Importante la Seguridad?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700">
            La seguridad de tu cuenta es fundamental para proteger tu información y la de tu organización. Una cuenta comprometida puede resultar en:
          </p>
          <ul className="list-disc list-inside space-y-2 text-red-700 ml-4">
            <li>Acceso no autorizado a datos sensibles de la empresa</li>
            <li>Uso indebido de herramientas de IA y consumo de tokens</li>
            <li>Modificación o eliminación de configuraciones importantes</li>
            <li>Compromiso de integraciones con servicios externos</li>
            <li>Posible propagación a otros sistemas conectados</li>
          </ul>
        </CardContent>
      </Card>

      {/* Acceder a Configuraciones de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder a Configuraciones de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Cuenta"</strong></li>
            <li>Selecciona <strong>"Seguridad"</strong> en el submenu</li>
            <li>Se mostrará el panel de seguridad con todas las opciones disponibles</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Cuenta → Seguridad
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cambio de Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <span>Cambio de Contraseña</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Mantén tu cuenta segura cambiando tu contraseña regularmente:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cómo Cambiar tu Contraseña</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>En la sección de seguridad, busca <strong>"Cambiar Contraseña"</strong></li>
                <li>Ingresa tu contraseña actual</li>
                <li>Escribe tu nueva contraseña</li>
                <li>Confirma la nueva contraseña</li>
                <li>Haz clic en <strong>"Actualizar Contraseña"</strong></li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold">Requisitos de Contraseña Segura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="font-medium">Longitud Mínima</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Al menos 8 caracteres</p>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="font-medium">Mayúsculas y Minúsculas</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Al menos una de cada</p>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="font-medium">Números</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Al menos un dígito</p>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="font-medium">Caracteres Especiales</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Al menos uno (!@#$%^&*)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Consejo:</strong> Usa un gestor de contraseñas para generar y almacenar contraseñas seguras únicas.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del formulario de cambio de contraseña
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Autenticación de Dos Factores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span>Autenticación de Dos Factores (2FA)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La autenticación de dos factores añade una capa extra de seguridad a tu cuenta:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">¿Qué es 2FA?</h3>
              <p className="text-gray-700">
                2FA requiere dos formas de verificación para acceder a tu cuenta:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Algo que sabes:</strong> Tu contraseña</li>
                <li><strong>Algo que tienes:</strong> Tu teléfono móvil o aplicación autenticadora</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Configurar 2FA</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>En la sección de seguridad, busca <strong>"Autenticación de Dos Factores"</strong></li>
                <li>Haz clic en <strong>"Habilitar 2FA"</strong></li>
                <li>Elige tu método preferido (aplicación o SMS)</li>
                <li>Sigue las instrucciones específicas del método elegido</li>
                <li>Verifica la configuración con un código de prueba</li>
                <li>Guarda los códigos de respaldo en un lugar seguro</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold">Métodos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Aplicación Autenticadora</h4>
                    <Badge variant="outline">Recomendado</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Usa apps como Google Authenticator, Authy o Microsoft Authenticator
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Funciona sin conexión a internet</li>
                    <li>• Más seguro que SMS</li>
                    <li>• Códigos que cambian cada 30 segundos</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium">SMS</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Recibe códigos por mensaje de texto
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Fácil de configurar</li>
                    <li>• Requiere señal móvil</li>
                    <li>• Menos seguro que aplicaciones</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Códigos de Respaldo</h3>
              <p className="text-gray-700">
                Al habilitar 2FA, recibirás códigos de respaldo únicos:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Guárdalos en un lugar seguro (no en tu teléfono)</li>
                <li>Cada código solo se puede usar una vez</li>
                <li>Úsalos si pierdes acceso a tu método principal</li>
                <li>Genera nuevos códigos si usas todos</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso de configuración de 2FA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sesiones Activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-purple-600" />
            <span>Sesiones Activas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Monitorea y gestiona todas las sesiones activas de tu cuenta:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Información de Sesiones</h3>
              <p className="text-gray-700">
                Para cada sesión activa puedes ver:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Dispositivo:</strong> Tipo de dispositivo y navegador</li>
                <li><strong>Ubicación:</strong> Ciudad y país aproximados</li>
                <li><strong>Dirección IP:</strong> Dirección IP de la conexión</li>
                <li><strong>Última actividad:</strong> Fecha y hora del último acceso</li>
                <li><strong>Estado:</strong> Activa o inactiva</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Sesiones Actuales</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Chrome en Windows</p>
                        <p className="text-sm text-gray-600">Madrid, España • 192.168.1.100</p>
                        <p className="text-xs text-gray-500">Última actividad: Ahora</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Sesión actual</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Safari en iPhone</p>
                        <p className="text-sm text-gray-600">Madrid, España • 192.168.1.101</p>
                        <p className="text-xs text-gray-500">Última actividad: Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Cerrar sesión</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Firefox en Linux</p>
                        <p className="text-sm text-gray-600">Barcelona, España • 85.123.45.67</p>
                        <p className="text-xs text-gray-500">Última actividad: Hace 1 día</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">Ubicación inusual</Badge>
                      <Badge variant="secondary">Cerrar sesión</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Acciones Disponibles</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Cerrar sesión individual:</strong> Termina una sesión específica</li>
                <li><strong>Cerrar todas las sesiones:</strong> Termina todas las sesiones excepto la actual</li>
                <li><strong>Reportar actividad sospechosa:</strong> Marca sesiones no autorizadas</li>
                <li><strong>Configurar alertas:</strong> Recibe notificaciones de nuevas sesiones</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la lista de sesiones activas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <span>Historial de Actividad de Seguridad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Revisa el historial de eventos de seguridad de tu cuenta:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Tipos de Eventos Registrados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <p className="font-medium">Inicios de Sesión</p>
                  <p className="text-sm text-gray-600">Exitosos y fallidos</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Cambios de Contraseña</p>
                  <p className="text-sm text-gray-600">Actualizaciones de credenciales</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Configuración 2FA</p>
                  <p className="text-sm text-gray-600">Habilitación y deshabilitación</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Accesos Sospechosos</p>
                  <p className="text-sm text-gray-600">Intentos desde ubicaciones inusuales</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Actividad Reciente</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Inicio de sesión exitoso</p>
                      <p className="text-sm text-gray-600">Chrome en Windows • Madrid, España</p>
                      <p className="text-xs text-gray-500">Hoy a las 09:15</p>
                    </div>
                  </div>
                  <Badge variant="outline">Normal</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Contraseña actualizada</p>
                      <p className="text-sm text-gray-600">Cambio realizado por el usuario</p>
                      <p className="text-xs text-gray-500">Ayer a las 14:30</p>
                    </div>
                  </div>
                  <Badge variant="outline">Seguridad</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Intento de acceso fallido</p>
                      <p className="text-sm text-gray-600">Contraseña incorrecta • IP: 85.123.45.67</p>
                      <p className="text-xs text-gray-500">Hace 3 días a las 22:45</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Sospechoso</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Filtros y Búsqueda</h3>
              <p className="text-gray-700">
                Puedes filtrar el historial por:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Tipo de evento:</strong> Logins, cambios, configuración</li>
                <li><strong>Fecha:</strong> Rango de fechas específico</li>
                <li><strong>Ubicación:</strong> País o ciudad</li>
                <li><strong>Dispositivo:</strong> Tipo de dispositivo o navegador</li>
                <li><strong>Estado:</strong> Exitoso, fallido, sospechoso</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del historial de actividad de seguridad con filtros
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones Avanzadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Avanzadas de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Configuraciones adicionales para usuarios avanzados:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Restricciones de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <p className="font-medium">IPs Permitidas</p>
                  <p className="text-sm text-gray-600">Limitar acceso a IPs específicas</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Horarios de Acceso</p>
                  <p className="text-sm text-gray-600">Restringir por horario laboral</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Países Bloqueados</p>
                  <p className="text-sm text-gray-600">Bloquear acceso desde ciertos países</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Dispositivos Confiables</p>
                  <p className="text-sm text-gray-600">Marcar dispositivos como seguros</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Notificaciones de Seguridad</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Nuevos inicios de sesión</p>
                    <p className="text-sm text-gray-600">Notificar cuando accedas desde un nuevo dispositivo</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Ubicaciones inusuales</p>
                    <p className="text-sm text-gray-600">Alertar sobre accesos desde ubicaciones no habituales</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Intentos fallidos</p>
                    <p className="text-sm text-gray-600">Notificar múltiples intentos de acceso fallidos</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuración de Sesiones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <p className="font-medium">Tiempo de Expiración</p>
                  <p className="text-sm text-gray-600">8 horas de inactividad</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Sesiones Concurrentes</p>
                  <p className="text-sm text-gray-600">Máximo 3 dispositivos</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Recordar Dispositivo</p>
                  <p className="text-sm text-gray-600">30 días para dispositivos confiables</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Cierre Automático</p>
                  <p className="text-sm text-gray-600">Cerrar sesiones inactivas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las configuraciones avanzadas de seguridad
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Mejores Prácticas de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Contraseña única:</strong> Usa una contraseña diferente para KIT.AI</li>
            <li><strong>Habilita 2FA:</strong> Siempre activa la autenticación de dos factores</li>
            <li><strong>Revisa sesiones:</strong> Verifica regularmente las sesiones activas</li>
            <li><strong>Actualiza contraseñas:</strong> Cambia tu contraseña cada 3-6 meses</li>
            <li><strong>Monitorea actividad:</strong> Revisa el historial de seguridad mensualmente</li>
            <li><strong>Dispositivos seguros:</strong> Solo accede desde dispositivos confiables</li>
            <li><strong>Redes seguras:</strong> Evita WiFi público para acceder a la cuenta</li>
            <li><strong>Mantén códigos seguros:</strong> Guarda los códigos de respaldo en lugar seguro</li>
            <li><strong>Reporta problemas:</strong> Informa inmediatamente cualquier actividad sospechosa</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}