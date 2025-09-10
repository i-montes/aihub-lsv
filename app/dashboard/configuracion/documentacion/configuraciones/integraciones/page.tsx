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

          {/* Google Gemini */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
              <span>Google Gemini</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Modelos de IA de Google, destacados por su capacidad multimodal y razonamiento avanzado.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Modelos disponibles:</strong> Gemini Pro, Gemini Pro Vision, Gemini Ultra</p>
              <p className="text-sm"><strong>Ideal para:</strong> Análisis multimodal, generación de contenido y tareas complejas</p>
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
              
              <div>
                <h4 className="font-medium">Para Google Gemini:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 ml-4">
                  <li>Ve a <a href="https://makersuite.google.com/app/apikey" className="text-blue-600 underline">Google AI Studio</a></li>
                  <li>Inicia sesión con tu cuenta de Google</li>
                  <li>Haz clic en "Create API Key"</li>
                  <li>Selecciona un proyecto de Google Cloud o crea uno nuevo</li>
                  <li>Copia la API Key generada</li>
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
        </CardContent>
      </Card>
    </div>
  )
}