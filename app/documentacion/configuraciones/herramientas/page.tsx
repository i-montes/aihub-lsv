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
                <li><strong>Variables:</strong> Placeholders dinámicos como {"{contenido}"}, {"{idioma}"}, etc.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">4. Parámetros del Modelo</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li><strong>Temperatura:</strong> Controla la creatividad (0.0 = conservador, 1.0 = creativo)</li>
                <li><strong>Tokens Máximos:</strong> Límite de longitud de la respuesta</li>
                <li><strong>Top P:</strong> Control adicional de aleatoriedad</li>
                <li><strong>Penalización de Frecuencia:</strong> Evita repeticiones</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del panel de configuración de una herramienta mostrando todas las secciones mencionadas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo: Configurar el Corrector de Textos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Veamos un ejemplo práctico de cómo configurar el corrector de textos:</p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Configuración General</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Nombre:</strong> "Corrector Académico Español"</li>
                <li><strong>Descripción:</strong> "Para textos académicos y formales en español"</li>
                <li><strong>Estado:</strong> Activo</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Modelo Seleccionado</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Proveedor:</strong> OpenAI</li>
                <li><strong>Modelo:</strong> GPT-4</li>
                <li><strong>Versión:</strong> gpt-4-turbo-preview</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Prompt del Sistema</h4>
              <div className="bg-white p-3 rounded border text-sm font-mono">
                Eres un corrector experto en español académico. Tu tarea es revisar textos y proporcionar correcciones precisas manteniendo el estilo formal y académico. Enfócate en:
                <br />- Gramática y sintaxis
                <br />- Ortografía y acentuación  
                <br />- Coherencia y cohesión
                <br />- Registro académico apropiado
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Parámetros</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Temperatura:</strong> 0.3 (respuestas consistentes)</li>
                <li><strong>Tokens Máximos:</strong> 2000</li>
                <li><strong>Top P:</strong> 0.9</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la configuración completa del ejemplo del corrector académico
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Probar Configuraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Probar Configuraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Antes de guardar una configuración, es importante probarla:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>En el panel de configuración, busca el botón <strong>"Probar Configuración"</strong></li>
            <li>Ingresa un texto de ejemplo en el campo de prueba</li>
            <li>Haz clic en <strong>"Ejecutar Prueba"</strong></li>
            <li>Revisa el resultado para verificar que cumple tus expectativas</li>
            <li>Ajusta los parámetros si es necesario y vuelve a probar</li>
            <li>Una vez satisfecho, guarda la configuración</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del área de prueba mostrando un texto de ejemplo y su resultado procesado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Configuraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Configuraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Puedes crear múltiples configuraciones para cada herramienta:
          </p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Configuraciones Múltiples</h4>
              <p className="text-sm text-gray-600">
                Crea diferentes configuraciones para distintos casos de uso (ej: "Corrector Formal", "Corrector Creativo")
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Configuración por Defecto</h4>
              <p className="text-sm text-gray-600">
                Marca una configuración como predeterminada para que se use automáticamente
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Duplicar Configuración</h4>
              <p className="text-sm text-gray-600">
                Crea copias de configuraciones existentes para hacer variaciones rápidas
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Exportar/Importar</h4>
              <p className="text-sm text-gray-600">
                Comparte configuraciones entre diferentes organizaciones o haz respaldos
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la lista de configuraciones múltiples para una herramienta con opciones de gestión
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
            <li><strong>Prueba siempre:</strong> Nunca guardes una configuración sin probarla primero</li>
            <li><strong>Nombres descriptivos:</strong> Usa nombres que indiquen claramente el propósito</li>
            <li><strong>Documenta cambios:</strong> Usa el campo descripción para explicar modificaciones</li>
            <li><strong>Temperatura baja:</strong> Para tareas precisas usa 0.1-0.3, para creatividad 0.7-0.9</li>
            <li><strong>Prompts específicos:</strong> Sé claro y específico en las instrucciones</li>
            <li><strong>Respaldos:</strong> Exporta configuraciones importantes regularmente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}