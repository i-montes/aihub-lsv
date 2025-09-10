"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Settings, Brain, FileText, MessageSquare, Edit3, Rss } from "lucide-react"

export default function HerramientasPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Herramientas</h1>
        <p className="text-lg text-gray-600">
          Personaliza los prompts, modelos y configuraciones específicas para cada herramienta de IA de la plataforma.
        </p>
      </div>

      {/* ¿Qué es la Configuración de Herramientas? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <span>¿Qué es la Configuración de Herramientas?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La configuración de herramientas te permite personalizar cómo funciona cada herramienta de IA en la plataforma. 
            Aquí puedes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Modificar los prompts que se envían a los modelos de IA</li>
            <li>Seleccionar qué modelo de IA usar para cada herramienta</li>
            <li>Ajustar parámetros como temperatura, tokens máximos, etc.</li>
            <li>Crear variaciones personalizadas de las herramientas</li>
            <li>Configurar formatos de respuesta específicos</li>
          </ul>
        </CardContent>
      </Card>

      {/* Cómo acceder */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo acceder a la Configuración de Herramientas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>Ve al menú lateral y haz clic en <strong>"Configuración"</strong></li>
            <li>Selecciona <strong>"Herramientas"</strong> en el submenu</li>
            <li>Verás una lista de todas las herramientas disponibles</li>
            <li>Haz clic en <strong>"Configurar"</strong> junto a la herramienta que deseas personalizar</li>
          </ol>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación: Sidebar → Configuración → Herramientas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Herramientas Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas Disponibles para Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Corrector de Textos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              <span>Corrector de Textos</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Herramienta para revisar y corregir textos, detectando errores gramaticales, ortográficos y de estilo.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Configuraciones disponibles:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>Prompt de corrección personalizado</li>
                <li>Nivel de corrección (básico, intermedio, avanzado)</li>
                <li>Tipo de texto (formal, informal, académico, creativo)</li>
                <li>Idioma de corrección</li>
                <li>Modelo de IA preferido</li>
              </ul>
            </div>
          </div>

          {/* Generador de Hilos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Generador de Hilos</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Convierte contenido largo en hilos optimizados para redes sociales como Twitter/X.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Configuraciones disponibles:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>Prompt de generación de hilos</li>
                <li>Número máximo de tweets por hilo</li>
                <li>Tono y estilo (profesional, casual, educativo)</li>
                <li>Inclusión de hashtags y menciones</li>
                <li>Formato de numeración</li>
              </ul>
            </div>
          </div>

          {/* Generador de Resúmenes */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Generador de Resúmenes</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Crea resúmenes concisos y precisos de contenido largo como artículos, documentos o videos.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Configuraciones disponibles:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>Prompt de resumen personalizado</li>
                <li>Longitud del resumen (corto, medio, largo)</li>
                <li>Tipo de resumen (ejecutivo, técnico, general)</li>
                <li>Puntos clave a destacar</li>
                <li>Formato de salida</li>
              </ul>
            </div>
          </div>

          {/* Generador de Newsletter */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center space-x-2">
              <Rss className="h-5 w-5 text-orange-600" />
              <span>Generador de Newsletter</span>
            </h3>
            <p className="text-gray-700 mb-3">
              Transforma contenido en newsletters atractivos y bien estructurados para email marketing.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Configuraciones disponibles:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>Plantilla de newsletter personalizada</li>
                <li>Estructura de secciones</li>
                <li>Tono de comunicación</li>
                <li>Call-to-actions predefinidos</li>
                <li>Formato HTML/texto plano</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la lista de herramientas con botones de "Configurar" para cada una
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurar una Herramienta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-yellow-600" />
            <span>Configurar una Herramienta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Al hacer clic en "Configurar" junto a una herramienta, se abrirá el panel de configuración con las siguientes secciones:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">1. Configuración General</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li><strong>Nombre:</strong> Asigna un nombre descriptivo a esta configuración</li>
                <li><strong>Descripción:</strong> Breve descripción de para qué usarás esta configuración</li>
                <li><strong>Estado:</strong> Activa o desactiva esta configuración</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">2. Selección de Modelo</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li><strong>Proveedor:</strong> Elige entre las integraciones configuradas (OpenAI, Claude, etc.)</li>
                <li><strong>Modelo:</strong> Selecciona el modelo específico (GPT-4, Claude-3, etc.)</li>
                <li><strong>Versión:</strong> Elige la versión del modelo si hay múltiples disponibles</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">3. Configuración del Prompt</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li><strong>Prompt del Sistema:</strong> Instrucciones base que definen el comportamiento</li>
                <li><strong>Prompt del Usuario:</strong> Template que se combina con el contenido del usuario</li>
                <li><strong>Variables:</strong> Placeholders dinámicos como {"contenido"}, {"idioma"}, etc.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}