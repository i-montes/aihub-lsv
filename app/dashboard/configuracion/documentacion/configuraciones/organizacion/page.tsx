"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Settings, Users, CreditCard, BarChart3, Shield, Globe, Mail, Phone, MapPin } from "lucide-react"

export default function OrganizacionPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Información General de la Organización</h1>
        <p className="text-lg text-gray-600">
          Configura y gestiona la información básica de tu organización, incluyendo datos de contacto, configuraciones generales y preferencias del sistema.
        </p>
      </div>

      {/* ¿Qué es la Información de Organización? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>¿Qué es la Información de Organización?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La sección de Información General de la Organización centraliza todos los datos y configuraciones principales de tu cuenta empresarial en KIT.AI. Incluye:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Datos básicos de la empresa (nombre, dirección, contacto)</li>
            <li>Configuraciones generales del sistema</li>
            <li>Preferencias de idioma y zona horaria</li>
            <li>Información de facturación y suscripción</li>
            <li>Límites de uso y cuotas</li>
            <li>Configuraciones de seguridad organizacional</li>
            <li>Branding y personalización</li>
          </ul>
        </CardContent>
      </Card>

      {/* Acceder a la Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder a la Configuración de Organización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Configuración"</strong></li>
            <li>Selecciona <strong>"Información general de la organización"</strong> en el submenu</li>
            <li>Se mostrará el panel de configuración con todas las secciones disponibles</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Solo los usuarios con rol de Administrador pueden acceder y modificar esta configuración.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Configuración → Información general de la organización
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-green-600" />
            <span>Información Básica de la Empresa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Esta sección contiene los datos fundamentales de tu organización:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre de la Organización</p>
                <p className="text-sm text-gray-600">
                  Nombre oficial de tu empresa o organización
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre Comercial</p>
                <p className="text-sm text-gray-600">
                  Nombre comercial o marca (si es diferente al oficial)
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Tipo de Organización</p>
                <p className="text-sm text-gray-600">
                  Empresa, Agencia, Freelancer, ONG, etc.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Tamaño de la Organización</p>
                <p className="text-sm text-gray-600">
                  Número aproximado de empleados
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Sitio Web</p>
                <p className="text-sm text-gray-600">
                  URL principal de tu sitio web
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Industria/Sector</p>
                <p className="text-sm text-gray-600">
                  Sector al que pertenece tu organización
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Descripción</p>
                <p className="text-sm text-gray-600">
                  Breve descripción de tu organización
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Logo de la Empresa</p>
                <p className="text-sm text-gray-600">
                  Imagen del logo (formato PNG, JPG, SVG)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del formulario de información básica de la empresa
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <span>Información de Contacto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Configura los datos de contacto principales de tu organización:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Email Principal</p>
                  <p className="text-sm text-gray-600">
                    Dirección de correo principal para comunicaciones oficiales
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Email de Soporte</p>
                  <p className="text-sm text-gray-600">
                    Email específico para consultas de soporte técnico
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Teléfono Principal</p>
                  <p className="text-sm text-gray-600">
                    Número de teléfono principal de la organización
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium">Dirección Física</p>
                  <p className="text-sm text-gray-600">
                    Dirección completa de la sede principal
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <p className="font-medium">País/Región</p>
                  <p className="text-sm text-gray-600">
                    País donde está registrada la organización
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <p className="font-medium">Zona Horaria</p>
                  <p className="text-sm text-gray-600">
                    Zona horaria principal para reportes y notificaciones
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la sección de información de contacto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Configuraciones Generales del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Ajusta las configuraciones que afectan a toda la organización:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Idioma y Localización</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Idioma Principal</p>
                  <p className="text-sm text-gray-600">Idioma por defecto de la interfaz</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Formato de Fecha</p>
                  <p className="text-sm text-gray-600">DD/MM/YYYY, MM/DD/YYYY, etc.</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Formato de Hora</p>
                  <p className="text-sm text-gray-600">12 horas (AM/PM) o 24 horas</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Moneda</p>
                  <p className="text-sm text-gray-600">Moneda para reportes y facturación</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuraciones de Uso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Límite de Usuarios</p>
                  <p className="text-sm text-gray-600">Máximo número de usuarios permitidos</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Límite de Tokens Mensual</p>
                  <p className="text-sm text-gray-600">Cuota mensual de tokens para la organización</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Retención de Datos</p>
                  <p className="text-sm text-gray-600">Tiempo de conservación de historiales</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Backup Automático</p>
                  <p className="text-sm text-gray-600">Frecuencia de respaldos automáticos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las configuraciones generales del sistema
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información de Suscripción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span>Información de Suscripción y Facturación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Visualiza y gestiona la información de tu plan y facturación:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Plan Actual</h4>
              <p className="text-2xl font-bold text-blue-900">Pro</p>
              <p className="text-sm text-blue-600">$99/mes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Próxima Facturación</h4>
              <p className="text-lg font-bold text-green-900">15 Dic 2024</p>
              <p className="text-sm text-green-600">Renovación automática</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800">Uso Actual</h4>
              <p className="text-lg font-bold text-orange-900">75%</p>
              <p className="text-sm text-orange-600">De tu cuota mensual</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Detalles del Plan</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Usuarios Incluidos</p>
                  <p className="text-sm text-gray-600">50 usuarios activos</p>
                </div>
                <div>
                  <p className="font-medium">Tokens Mensuales</p>
                  <p className="text-sm text-gray-600">1,000,000 tokens</p>
                </div>
                <div>
                  <p className="font-medium">Integraciones</p>
                  <p className="text-sm text-gray-600">Ilimitadas</p>
                </div>
                <div>
                  <p className="font-medium">Soporte</p>
                  <p className="text-sm text-gray-600">Prioritario 24/7</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la sección de suscripción y facturación
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Configuraciones de Seguridad Organizacional</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Configura las políticas de seguridad que se aplicarán a toda la organización:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Políticas de Contraseñas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Longitud Mínima</p>
                  <p className="text-sm text-gray-600">Número mínimo de caracteres</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Complejidad</p>
                  <p className="text-sm text-gray-600">Mayúsculas, números, símbolos</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Expiración</p>
                  <p className="text-sm text-gray-600">Tiempo antes de requerir cambio</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Historial</p>
                  <p className="text-sm text-gray-600">Contraseñas anteriores a recordar</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuraciones de Sesión</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Tiempo de Sesión</p>
                  <p className="text-sm text-gray-600">Duración máxima de sesión activa</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Sesiones Concurrentes</p>
                  <p className="text-sm text-gray-600">Máximo de sesiones por usuario</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Bloqueo por Inactividad</p>
                  <p className="text-sm text-gray-600">Tiempo antes de bloquear por inactividad</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Autenticación 2FA</p>
                  <p className="text-sm text-gray-600">Requerir autenticación de dos factores</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Restricciones de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">IPs Permitidas</p>
                  <p className="text-sm text-gray-600">Lista blanca de direcciones IP</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Horarios de Acceso</p>
                  <p className="text-sm text-gray-600">Restricciones por horario</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Países Bloqueados</p>
                  <p className="text-sm text-gray-600">Países desde donde no se permite acceso</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Dispositivos</p>
                  <p className="text-sm text-gray-600">Gestión de dispositivos autorizados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las configuraciones de seguridad organizacional
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding y Personalización */}
      <Card>
        <CardHeader>
          <CardTitle>Branding y Personalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Personaliza la apariencia de KIT.AI para que refleje la identidad de tu organización:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Elementos Visuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Logo Principal</p>
                  <p className="text-sm text-gray-600">Logo que aparece en la barra superior</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Favicon</p>
                  <p className="text-sm text-gray-600">Icono que aparece en la pestaña del navegador</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Colores Primarios</p>
                  <p className="text-sm text-gray-600">Paleta de colores de tu marca</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Tema Personalizado</p>
                  <p className="text-sm text-gray-600">Tema claro/oscuro personalizado</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuraciones de Interfaz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Nombre de la Aplicación</p>
                  <p className="text-sm text-gray-600">Título personalizado en lugar de "KIT.AI"</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Mensaje de Bienvenida</p>
                  <p className="text-sm text-gray-600">Texto personalizado en la página de inicio</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Footer Personalizado</p>
                  <p className="text-sm text-gray-600">Información adicional en el pie de página</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Enlaces Personalizados</p>
                  <p className="text-sm text-gray-600">Enlaces a recursos de tu organización</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las opciones de branding y personalización
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de la Organización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Estadísticas de la Organización</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Visualiza métricas importantes sobre el uso de KIT.AI en tu organización:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Usuarios Totales</h4>
              <p className="text-2xl font-bold text-blue-900">156</p>
              <p className="text-sm text-blue-600">+12 este mes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Tokens Usados</h4>
              <p className="text-2xl font-bold text-green-900">750K</p>
              <p className="text-sm text-green-600">75% del límite</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800">Herramientas Activas</h4>
              <p className="text-2xl font-bold text-orange-900">4</p>
              <p className="text-sm text-orange-600">Todas configuradas</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800">Integraciones</h4>
              <p className="text-2xl font-bold text-purple-900">8</p>
              <p className="text-sm text-purple-600">Conectadas</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del dashboard de estadísticas organizacionales
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
            <li><strong>Información actualizada:</strong> Mantén los datos de contacto siempre actualizados</li>
            <li><strong>Configuración de seguridad:</strong> Revisa y ajusta las políticas de seguridad regularmente</li>
            <li><strong>Monitoreo de uso:</strong> Supervisa el consumo de tokens y usuarios activos</li>
            <li><strong>Backup de configuración:</strong> Exporta la configuración periódicamente</li>
            <li><strong>Documentación interna:</strong> Mantén registro de cambios importantes</li>
            <li><strong>Comunicación de cambios:</strong> Informa a los usuarios sobre modificaciones relevantes</li>
            <li><strong>Revisión de permisos:</strong> Audita los accesos y permisos trimestralmente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}