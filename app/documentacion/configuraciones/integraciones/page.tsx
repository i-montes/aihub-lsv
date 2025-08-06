"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Key, Zap } from "lucide-react"

export default function IntegracionesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>CONFIGURACIÓN CRÍTICA</span>
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
        <p className="text-lg text-gray-600">
          Las integraciones son la configuración más importante de la plataforma. Sin estas conexiones configuradas correctamente, 
          las herramientas de IA no funcionarán.
        </p>
      </div>

      {/* Alerta importante */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>¡Importante!</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            Debes configurar al menos una integración de IA antes de poder usar cualquier herramienta de la plataforma.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ¿Qué son las Integraciones? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>¿Qué son las Integraciones?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Las integraciones conectan KIT.AI con los modelos de inteligencia artificial externos que procesan tus contenidos. 
            Estas conexiones son esenciales porque:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Permiten que las herramientas accedan a los modelos de IA (OpenAI, Claude, etc.)</li>
            <li>Autentican tu acceso a estos servicios mediante API Keys</li>
            <li>Determinan qué modelos están disponibles para cada herramienta</li>
            <li>Controlan los límites de uso y costos</li>
          </ul>
        </CardContent>
      </Card>

      {/* Cómo acceder a las Integraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo acceder a las Integraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-gray-700">Para configurar las integraciones:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Ve al menú lateral y haz clic en <strong>"Configuración"</strong></li>
              <li>Selecciona <strong>"Integraciones"</strong> en el submenu</li>
              <li>Verás una lista de proveedores de IA disponibles</li>
            </ol>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación: Sidebar → Configuración → Integraciones
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Proveedores Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores de IA Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
              <span>OpenAI</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Proveedor de GPT-4, GPT-3.5 y otros modelos avanzados de OpenAI.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Modelos disponibles:</strong> GPT-4, GPT-4 Turbo, GPT-3.5 Turbo</p>
              <p className="text-sm"><strong>Ideal para:</strong> Todas las herramientas de la plataforma</p>
              <p className="text-sm"><strong>Costo:</strong> Por tokens utilizados</p>
            </div>
          </div>

          {/* Anthropic */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-600 rounded"></div>
              <span>Anthropic (Claude)</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Proveedor de los modelos Claude, conocidos por su precisión y seguridad.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Modelos disponibles:</strong> Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku</p>
              <p className="text-sm"><strong>Ideal para:</strong> Análisis de texto, corrección y tareas complejas</p>
              <p className="text-sm"><strong>Costo:</strong> Por tokens utilizados</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la lista de proveedores disponibles con sus estados (conectado/desconectado)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurar una Integración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-yellow-600" />
            <span>Configurar una Integración</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Paso 1: Obtener la API Key</h3>
            <p className="text-gray-700">
              Antes de configurar la integración en KIT.AI, necesitas obtener una API Key del proveedor:
            </p>
            
            <div className="ml-4 space-y-3">
              <div>
                <h4 className="font-medium">Para OpenAI:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 ml-4">
                  <li>Ve a <a href="https://platform.openai.com" className="text-blue-600 underline">platform.openai.com</a></li>
                  <li>Inicia sesión o crea una cuenta</li>
                  <li>Ve a "API Keys" en tu dashboard</li>
                  <li>Haz clic en "Create new secret key"</li>
                  <li>Copia la clave generada (guárdala de forma segura)</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium">Para Anthropic:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 ml-4">
                  <li>Ve a <a href="https://console.anthropic.com" className="text-blue-600 underline">console.anthropic.com</a></li>
                  <li>Inicia sesión o solicita acceso</li>
                  <li>Ve a "API Keys"</li>
                  <li>Genera una nueva clave</li>
                  <li>Copia la clave generada</li>
                </ol>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla del dashboard de OpenAI mostrando cómo crear una API Key
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Paso 2: Configurar en KIT.AI</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>En la página de Integraciones, haz clic en <strong>"Configurar"</strong> junto al proveedor deseado</li>
              <li>Se abrirá un modal de configuración</li>
              <li>Pega tu API Key en el campo correspondiente</li>
              <li>Opcionalmente, asigna un nombre descriptivo a la integración</li>
              <li>Haz clic en <strong>"Probar Conexión"</strong> para verificar que funciona</li>
              <li>Si la prueba es exitosa, haz clic en <strong>"Guardar"</strong></li>
            </ol>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla del modal de configuración de integración mostrando los campos de API Key y nombre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estados de las Integraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Estados de las Integraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Las integraciones pueden tener diferentes estados:</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Conectado</p>
                <p className="text-sm text-gray-600">La integración está funcionando correctamente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Error de Conexión</p>
                <p className="text-sm text-gray-600">Hay un problema con la API Key o la conexión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full bg-gray-400"></div>
              <div>
                <p className="font-medium text-gray-800">No Configurado</p>
                <p className="text-sm text-gray-600">La integración no ha sido configurada aún</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la lista de integraciones con diferentes estados (conectado, error, no configurado)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Integraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Integraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Una vez configuradas, puedes gestionar tus integraciones:</p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Editar Integración</h4>
              <p className="text-sm text-gray-600">Actualiza la API Key o cambia el nombre de la integración</p>
            </div>
            
            <div>
              <h4 className="font-medium">Probar Conexión</h4>
              <p className="text-sm text-gray-600">Verifica que la integración sigue funcionando correctamente</p>
            </div>
            
            <div>
              <h4 className="font-medium">Desactivar/Activar</h4>
              <p className="text-sm text-gray-600">Temporalmente deshabilita una integración sin eliminarla</p>
            </div>
            
            <div>
              <h4 className="font-medium">Eliminar</h4>
              <p className="text-sm text-gray-600">Elimina permanentemente la integración (requiere confirmación)</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del menú de acciones de una integración (editar, probar, desactivar, eliminar)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Solución de Problemas */}
      <Card>
        <CardHeader>
          <CardTitle>Solución de Problemas Comunes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-800">Error: "API Key inválida"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Verifica que copiaste la API Key completa</li>
                <li>Asegúrate de que la clave no haya expirado</li>
                <li>Confirma que tienes créditos disponibles en tu cuenta del proveedor</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-800">Error: "Sin conexión"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Verifica tu conexión a internet</li>
                <li>Comprueba si el servicio del proveedor está disponible</li>
                <li>Intenta probar la conexión nuevamente en unos minutos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-800">Error: "Límite de cuota excedido"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Has alcanzado el límite de uso de tu plan</li>
                <li>Espera a que se renueve tu cuota o actualiza tu plan</li>
                <li>Revisa el uso en el dashboard del proveedor</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Pasos */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-3">
            Una vez que hayas configurado al menos una integración:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-green-700 ml-4">
            <li>Configura las herramientas específicas en "Configuraciones → Herramientas"</li>
            <li>Asigna qué modelos usar para cada herramienta</li>
            <li>Comienza a usar las herramientas de IA de la plataforma</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}