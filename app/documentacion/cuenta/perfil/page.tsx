"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Camera, Mail, Phone, MapPin, Calendar, Shield, Settings, Bell, Palette } from "lucide-react"

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Perfil Personal</h1>
        <p className="text-lg text-gray-600">
          Gestiona tu información personal, preferencias de cuenta y configuraciones individuales en KIT.AI.
        </p>
      </div>

      {/* ¿Qué es el Perfil Personal? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>¿Qué es el Perfil Personal?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Tu Perfil Personal es el centro de control de tu cuenta individual en KIT.AI. Desde aquí puedes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Actualizar tu información personal y de contacto</li>
            <li>Cambiar tu foto de perfil y configuraciones visuales</li>
            <li>Gestionar tus preferencias de notificaciones</li>
            <li>Configurar tu zona horaria e idioma preferido</li>
            <li>Ver tu actividad reciente y estadísticas de uso</li>
            <li>Personalizar tu experiencia en la plataforma</li>
            <li>Gestionar conexiones con servicios externos</li>
          </ul>
        </CardContent>
      </Card>

      {/* Acceder al Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder a tu Perfil Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Hay varias formas de acceder a tu perfil personal:</p>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Método 1: Desde el Menú de Usuario</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Haz clic en tu avatar en la esquina superior derecha</li>
                <li>Selecciona <strong>"Mi Perfil"</strong> del menú desplegable</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold">Método 2: Desde Configuración</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Ve al menú lateral y haz clic en <strong>"Cuenta"</strong></li>
                <li>Selecciona <strong>"Perfil personal"</strong> en el submenu</li>
              </ol>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando ambos métodos de acceso al perfil personal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-green-600" />
            <span>Información Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Esta sección contiene tus datos personales básicos:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre Completo</p>
                <p className="text-sm text-gray-600">
                  Tu nombre y apellido como aparecerán en la plataforma
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre de Usuario</p>
                <p className="text-sm text-gray-600">
                  Identificador único para menciones y colaboración
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Email Principal</p>
                <p className="text-sm text-gray-600">
                  Dirección de correo para notificaciones y acceso
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Teléfono</p>
                <p className="text-sm text-gray-600">
                  Número de contacto (opcional)
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Cargo/Posición</p>
                <p className="text-sm text-gray-600">
                  Tu rol o posición en la organización
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Departamento</p>
                <p className="text-sm text-gray-600">
                  Área o departamento al que perteneces
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Ubicación</p>
                <p className="text-sm text-gray-600">
                  Ciudad y país donde trabajas
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Biografía</p>
                <p className="text-sm text-gray-600">
                  Breve descripción personal (opcional)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Algunos campos pueden estar bloqueados si tu organización gestiona esta información centralmente.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del formulario de información personal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-purple-600" />
            <span>Foto de Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Tu foto de perfil aparece en toda la plataforma y ayuda a otros usuarios a identificarte:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cambiar Foto de Perfil</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Haz clic en tu foto de perfil actual o en el ícono de cámara</li>
                <li>Selecciona <strong>"Cambiar foto"</strong></li>
                <li>Elige una imagen desde tu dispositivo</li>
                <li>Ajusta el recorte si es necesario</li>
                <li>Haz clic en <strong>"Guardar"</strong></li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold">Requisitos de la Imagen</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Formato:</strong> JPG, PNG, GIF (no animado)</li>
                <li><strong>Tamaño máximo:</strong> 5 MB</li>
                <li><strong>Dimensiones recomendadas:</strong> 400x400 píxeles mínimo</li>
                <li><strong>Aspecto:</strong> Cuadrado (se recortará automáticamente)</li>
                <li><strong>Contenido:</strong> Imagen profesional y apropiada</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Opciones Adicionales</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Avatar generado:</strong> Usar iniciales con color de fondo</li>
                <li><strong>Imagen por defecto:</strong> Usar el avatar estándar del sistema</li>
                <li><strong>Eliminar foto:</strong> Volver al avatar por defecto</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso de cambio de foto de perfil
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Preferencias Personales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Personaliza tu experiencia en KIT.AI según tus preferencias:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Configuraciones de Idioma y Región</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Idioma de Interfaz</p>
                  <p className="text-sm text-gray-600">Idioma principal de la plataforma</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Zona Horaria</p>
                  <p className="text-sm text-gray-600">Para fechas y horarios en reportes</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Formato de Fecha</p>
                  <p className="text-sm text-gray-600">DD/MM/YYYY o MM/DD/YYYY</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Formato de Hora</p>
                  <p className="text-sm text-gray-600">12 horas (AM/PM) o 24 horas</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Preferencias de Interfaz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-gray-600">Claro, oscuro o automático</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Densidad</p>
                  <p className="text-sm text-gray-600">Compacta, normal o espaciosa</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Sidebar</p>
                  <p className="text-sm text-gray-600">Expandido, colapsado o automático</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Animaciones</p>
                  <p className="text-sm text-gray-600">Habilitar o deshabilitar transiciones</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuraciones de Trabajo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Herramienta por Defecto</p>
                  <p className="text-sm text-gray-600">Herramienta que se abre al iniciar</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Autoguardado</p>
                  <p className="text-sm text-gray-600">Frecuencia de guardado automático</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Historial</p>
                  <p className="text-sm text-gray-600">Número de elementos en historial</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Atajos de Teclado</p>
                  <p className="text-sm text-gray-600">Personalizar combinaciones de teclas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las preferencias personales con todas las opciones
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Configuraciones de Notificaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Controla qué notificaciones recibes y cómo las recibes:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Notificaciones por Email</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Resumen diario de actividad</p>
                    <p className="text-sm text-gray-600">Recibe un resumen de tu actividad diaria</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Nuevas funciones</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre nuevas herramientas y características</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Alertas de seguridad</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre accesos y cambios de seguridad</p>
                  </div>
                  <Badge variant="destructive">Siempre activo</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Notificaciones en la Plataforma</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Tareas completadas</p>
                    <p className="text-sm text-gray-600">Cuando una herramienta termina de procesar</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Menciones</p>
                    <p className="text-sm text-gray-600">Cuando otros usuarios te mencionan</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Límites de uso</p>
                    <p className="text-sm text-gray-600">Alertas cuando te acercas a límites de tokens</p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Configuraciones Avanzadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="border rounded p-3">
                  <p className="font-medium">Horario de Notificaciones</p>
                  <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Frecuencia de Resúmenes</p>
                  <p className="text-sm text-gray-600">Diario, semanal o mensual</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">Método Preferido</p>
                  <p className="text-sm text-gray-600">Email, push o ambos</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium">No Molestar</p>
                  <p className="text-sm text-gray-600">Pausar notificaciones temporalmente</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las configuraciones de notificaciones
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actividad y Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad y Estadísticas Personales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Visualiza tu actividad reciente y estadísticas de uso personal:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Tokens Usados</h4>
              <p className="text-2xl font-bold text-blue-900">45,230</p>
              <p className="text-sm text-blue-600">Este mes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Herramientas Usadas</h4>
              <p className="text-2xl font-bold text-green-900">127</p>
              <p className="text-sm text-green-600">Ejecuciones este mes</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800">Tiempo Activo</h4>
              <p className="text-2xl font-bold text-orange-900">28h</p>
              <p className="text-sm text-orange-600">Esta semana</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Actividad Reciente</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Corrector de Texto ejecutado</p>
                    <p className="text-sm text-gray-600">Hace 2 horas</p>
                  </div>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Generador de Hilos usado</p>
                    <p className="text-sm text-gray-600">Hace 4 horas</p>
                  </div>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Perfil actualizado</p>
                    <p className="text-sm text-gray-600">Ayer</p>
                  </div>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las estadísticas personales y actividad reciente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conexiones Externas */}
      <Card>
        <CardHeader>
          <CardTitle>Conexiones con Servicios Externos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Gestiona tus conexiones personales con servicios externos:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Google Workspace</p>
                  <p className="text-sm text-gray-600">Conectado como usuario@empresa.com</p>
                </div>
              </div>
              <Badge variant="outline">Conectado</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-gray-600">Recibir notificaciones en Slack</p>
                </div>
              </div>
              <Badge variant="secondary">Desconectado</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Calendario</p>
                  <p className="text-sm text-gray-600">Sincronizar eventos y recordatorios</p>
                </div>
              </div>
              <Badge variant="secondary">Desconectado</Badge>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las conexiones con servicios externos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos y Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Consejos y Mejores Prácticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Foto profesional:</strong> Usa una imagen clara y profesional para tu perfil</li>
            <li><strong>Información actualizada:</strong> Mantén tus datos de contacto siempre actualizados</li>
            <li><strong>Configuración de notificaciones:</strong> Ajusta las notificaciones según tu flujo de trabajo</li>
            <li><strong>Zona horaria correcta:</strong> Asegúrate de que tu zona horaria esté bien configurada</li>
            <li><strong>Preferencias de idioma:</strong> Configura el idioma que mejor manejes</li>
            <li><strong>Seguridad:</strong> Revisa regularmente tu actividad reciente</li>
            <li><strong>Personalización:</strong> Ajusta la interfaz según tus preferencias de trabajo</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}