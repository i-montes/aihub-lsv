"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Zap, Settings, Eye, Download, Copy, RefreshCw, AlertCircle, Lightbulb } from "lucide-react"

export default function CorrectorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Corrector de Textos</h1>
        <p className="text-lg text-gray-600">
          Mejora la calidad de tus textos con corrección automática de gramática, ortografía, estilo y coherencia usando IA avanzada.
        </p>
      </div>

      {/* ¿Qué es el Corrector? */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            <span>¿Qué es el Corrector de Textos?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            El Corrector es una herramienta de IA que analiza y mejora tus textos de manera integral. Va más allá de la simple corrección ortográfica, 
            ofreciendo sugerencias de estilo, coherencia, claridad y estructura.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800">Tipos de Corrección</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Ortografía y gramática</li>
                <li>Estilo y tono</li>
                <li>Coherencia y fluidez</li>
                <li>Estructura y organización</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Casos de Uso</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Artículos y blogs</li>
                <li>Emails profesionales</li>
                <li>Documentos corporativos</li>
                <li>Contenido para redes sociales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceder al Corrector */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder al Corrector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Herramientas"</strong></li>
            <li>Selecciona <strong>"Corrector"</strong> en el submenu</li>
            <li>Se abrirá la interfaz del corrector de textos</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Herramientas → Corrector
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interfaz del Corrector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>Interfaz del Corrector</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La interfaz del corrector está diseñada para ser intuitiva y eficiente:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Elementos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Entrada</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Área de texto para pegar o escribir</li>
                    <li>• Contador de palabras y caracteres</li>
                    <li>• Botón para cargar archivos</li>
                    <li>• Selector de idioma</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Resultados</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Texto corregido con resaltados</li>
                    <li>• Lista de cambios sugeridos</li>
                    <li>• Explicaciones de las correcciones</li>
                    <li>• Opciones de exportación</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Barra de Herramientas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Configuraciones de corrección</li>
                    <li>• Nivel de corrección (básico/avanzado)</li>
                    <li>• Tipo de texto (formal/informal)</li>
                    <li>• Botones de acción rápida</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Estadísticas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Número de errores encontrados</li>
                    <li>• Puntuación de calidad</li>
                    <li>• Tiempo de procesamiento</li>
                    <li>• Sugerencias de mejora</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la interfaz completa del corrector con todos sus paneles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Usar el Corrector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Cómo Usar el Corrector</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Paso 1: Preparar el Texto</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Puedes introducir texto de varias maneras:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Escribir directamente:</strong> Escribe o pega tu texto en el área de entrada</li>
                </ul>
              </div>
            </div>
          
            <div>
              <h3 className="font-semibold">Paso 2: Ejecutar Corrección</h3>
              <div className="ml-4 space-y-2">
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Haz clic en el botón <strong>"Analizar texto"</strong></li>
                  <li>Espera mientras la IA procesa tu texto (puede tomar 10-30 segundos)</li>
                  <li>Revisa los cambios sugeridos en el panel de resultados</li>
                </ol>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 4: Revisar Resultados</h3>
              <div className="ml-4 space-y-3">
                <p className="text-gray-700">El corrector te mostrará:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-green-600">Texto Corregido</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cambios resaltados en colores</li>
                      <li>• Texto original tachado</li>
                      <li>• Nuevas sugerencias en verde</li>
                      <li>• Notas explicativas al pasar el cursor</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-blue-600">Lista de Cambios</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Categorización por tipo de error</li>
                      <li>• Explicación de cada corrección</li>
                      <li>• Opción de aceptar/rechazar individualmente</li>
                      <li>• Sugerencias alternativas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 5: Aplicar Cambios</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Tienes varias opciones para aplicar las correcciones:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Revisar una por una:</strong> Acepta o rechaza cada sugerencia individualmente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso paso a paso de corrección de un texto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos y Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Lightbulb className="h-5 w-5" />
            <span>Consejos y Mejores Prácticas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Revisa antes de corregir:</strong> Lee tu texto una vez antes de usar el corrector</li>
            <li><strong>Configura el contexto:</strong> Selecciona el tipo de texto y audiencia correctos</li>
            <li><strong>No aceptes todo automáticamente:</strong> Revisa las sugerencias una por una</li>
            <li><strong>Mantén tu estilo:</strong> El corrector debe mejorar, no cambiar tu voz</li>
            <li><strong>Usa diccionarios personalizados:</strong> Añade términos específicos de tu área</li>
            <li><strong>Guarda plantillas:</strong> Crea configuraciones para diferentes tipos de contenido</li>
            <li><strong>Verifica el contexto:</strong> Algunas correcciones pueden cambiar el significado</li>
            <li><strong>Aprende de las sugerencias:</strong> Usa el corrector como herramienta de aprendizaje</li>
          </ul>
        </CardContent>
      </Card>

      {/* Solución de Problemas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Solución de Problemas Comunes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El corrector no detecta errores obvios</h4>
              <p className="text-sm text-gray-600">
                Verifica que el idioma seleccionado sea correcto y que el nivel de corrección esté en "Intermedio" o "Avanzado".
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Las sugerencias cambian demasiado mi estilo</h4>
              <p className="text-sm text-gray-600">
                Activa "Preservar estilo personal" en configuraciones avanzadas y selecciona un nivel de corrección más conservador.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El procesamiento es muy lento</h4>
              <p className="text-sm text-gray-600">
                Divide textos muy largos en secciones más pequeñas o reduce el nivel de corrección para textos extensos.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">No reconoce términos técnicos</h4>
              <p className="text-sm text-gray-600">
                Añade estos términos a tu diccionario personalizado o crea una plantilla específica para tu área de trabajo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}