"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Zap, Settings, Share2, Download, Copy, RefreshCw, AlertCircle, Lightbulb, Hash, Users, Clock, TrendingUp } from "lucide-react"

export default function HilosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Generador de Hilos</h1>
        <p className="text-lg text-gray-600">
          Transforma tu contenido en hilos atractivos para redes sociales con IA, optimizados para maximizar el engagement y la viralidad.
        </p>
      </div>

      {/* ¿Qué son los Hilos? */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <MessageSquare className="h-5 w-5" />
            <span>¿Qué son los Hilos de Redes Sociales?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            Los hilos son secuencias de publicaciones conectadas que permiten desarrollar ideas complejas de manera digestible y atractiva. 
            Son especialmente populares en Twitter/X, LinkedIn y otras plataformas sociales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800">Características de un Buen Hilo</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Hook inicial atractivo</li>
                <li>Estructura clara y progresiva</li>
                <li>Cada tweet aporta valor</li>
                <li>Call-to-action efectivo</li>
                <li>Uso estratégico de hashtags</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Beneficios</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Mayor alcance orgánico</li>
                <li>Mejor engagement</li>
                <li>Posicionamiento como experto</li>
                <li>Generación de leads</li>
                <li>Viralidad potencial</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceder al Generador */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder al Generador de Hilos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Herramientas"</strong></li>
            <li>Selecciona <strong>"Hilos"</strong> en el submenu</li>
            <li>Se abrirá la interfaz del generador de hilos</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Herramientas → Hilos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interfaz del Generador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-green-600" />
            <span>Interfaz del Generador</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La interfaz está diseñada para facilitar la creación de hilos efectivos:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Elementos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Entrada</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Área para contenido fuente</li>
                    <li>• Selector de plataforma objetivo</li>
                    <li>• Configuración de longitud</li>
                    <li>• Opciones de tono y estilo</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Vista Previa del Hilo</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Simulación de tweets/posts</li>
                    <li>• Contador de caracteres por post</li>
                    <li>• Numeración automática</li>
                    <li>• Vista de hashtags y menciones</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Herramientas de Edición</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Editor de posts individuales</li>
                    <li>• Reordenamiento de secuencia</li>
                    <li>• Añadir/eliminar posts</li>
                    <li>• Optimizador de hashtags</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Análisis y Métricas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Puntuación de engagement</li>
                    <li>• Análisis de legibilidad</li>
                    <li>• Sugerencias de mejora</li>
                    <li>• Predicción de alcance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la interfaz completa del generador de hilos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Crear un Hilo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Cómo Crear un Hilo Efectivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Paso 1: Preparar el Contenido Fuente</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Puedes crear hilos a partir de:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Artículo completo:</strong> Pega el texto de un blog post o artículo</li>
                  <li><strong>Ideas principales:</strong> Lista los puntos clave que quieres desarrollar</li>
                  <li><strong>URL de contenido:</strong> Extrae automáticamente desde una página web</li>
                  <li><strong>Desde WordPress:</strong> Importa directamente desde tus posts</li>
                  <li><strong>Notas o esquemas:</strong> Desarrolla ideas básicas en hilos completos</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 2: Configurar Parámetros del Hilo</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Plataforma Objetivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Twitter/X</Badge>
                      </div>
                      <p className="text-sm text-gray-600">280 caracteres por tweet</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">LinkedIn</Badge>
                      </div>
                      <p className="text-sm text-gray-600">3000 caracteres por post</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Instagram</Badge>
                      </div>
                      <p className="text-sm text-gray-600">2200 caracteres por post</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Longitud del Hilo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Corto</p>
                      <p className="text-xs text-gray-600">3-5 posts</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Medio</p>
                      <p className="text-xs text-gray-600">6-10 posts</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Largo</p>
                      <p className="text-xs text-gray-600">11-15 posts</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Épico</p>
                      <p className="text-xs text-gray-600">16+ posts</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Tono y Estilo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Profesional</p>
                      <p className="text-xs text-gray-600">Formal y experto</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Conversacional</p>
                      <p className="text-xs text-gray-600">Cercano y amigable</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Educativo</p>
                      <p className="text-xs text-gray-600">Didáctico y claro</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Inspiracional</p>
                      <p className="text-xs text-gray-600">Motivador y positivo</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Audiencia Objetivo</h4>
                  <p className="text-gray-700">Define tu audiencia para personalizar el lenguaje y enfoque:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Profesionales del sector</li>
                    <li>Emprendedores y startups</li>
                    <li>Audiencia general</li>
                    <li>Estudiantes y principiantes</li>
                    <li>Expertos y especialistas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 3: Generar el Hilo</h3>
              <div className="ml-4 space-y-2">
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Haz clic en <strong>"Generar Hilo"</strong></li>
                  <li>Espera mientras la IA procesa tu contenido (15-45 segundos)</li>
                  <li>Revisa la vista previa del hilo generado</li>
                  <li>Analiza las métricas de engagement predichas</li>
                </ol>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 4: Editar y Optimizar</h3>
              <div className="ml-4 space-y-3">
                <p className="text-gray-700">El generador te permite refinar cada aspecto del hilo:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-green-600">Edición de Contenido</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Modificar texto de cada post</li>
                      <li>• Ajustar el hook inicial</li>
                      <li>• Mejorar las transiciones</li>
                      <li>• Optimizar el call-to-action final</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-blue-600">Estructura del Hilo</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Reordenar posts arrastrando</li>
                      <li>• Añadir posts adicionales</li>
                      <li>• Eliminar posts innecesarios</li>
                      <li>• Dividir posts muy largos</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-purple-600">Hashtags y Menciones</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sugerencias de hashtags relevantes</li>
                      <li>• Análisis de popularidad de hashtags</li>
                      <li>• Menciones estratégicas</li>
                      <li>• Distribución óptima en el hilo</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-orange-600">Optimización SEO</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Palabras clave estratégicas</li>
                      <li>• Mejora de discoverabilidad</li>
                      <li>• Análisis de competencia</li>
                      <li>• Timing de publicación sugerido</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 5: Analizar y Publicar</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Antes de publicar, revisa las métricas predictivas:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Puntuación de engagement:</strong> Predicción de interacciones</li>
                  <li><strong>Potencial viral:</strong> Probabilidad de ser compartido</li>
                  <li><strong>Legibilidad:</strong> Facilidad de comprensión</li>
                  <li><strong>Optimización móvil:</strong> Experiencia en dispositivos móviles</li>
                  <li><strong>Timing sugerido:</strong> Mejor momento para publicar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso paso a paso de creación de un hilo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Hilos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Tipos de Hilos Populares</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            El generador incluye plantillas para los tipos de hilos más efectivos:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo Educativo</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Enseña conceptos complejos de manera simple y progresiva
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Hook → Problema → Solución paso a paso → Resumen → CTA
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Cómo crear una estrategia de marketing en 7 pasos"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo de Experiencia</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Comparte lecciones aprendidas y experiencias personales
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Situación → Desafío → Acciones → Resultados → Lecciones
                </div>
                <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Cómo perdí $10K y qué aprendí sobre inversiones"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo de Lista</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Enumera recursos, herramientas o consejos útiles
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Introducción → Elemento 1 → Elemento 2... → Conclusión
                </div>
                <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "10 herramientas gratuitas que todo emprendedor debe conocer"
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo de Debate</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Presenta diferentes perspectivas sobre un tema controversial
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Planteamiento → Perspectiva A → Perspectiva B → Análisis → Conclusión
                </div>
                <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "¿Es el trabajo remoto mejor que el presencial?"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo de Predicción</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Analiza tendencias y hace predicciones sobre el futuro
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Contexto actual → Tendencias → Predicciones → Implicaciones
                </div>
                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "5 predicciones sobre la IA en los próximos 2 años"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium">Hilo de Storytelling</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Cuenta una historia personal o de la empresa de manera atractiva
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Estructura:</strong> Contexto → Conflicto → Desarrollo → Clímax → Resolución → Moraleja
                </div>
                <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "La historia detrás de nuestro primer cliente"
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las plantillas de tipos de hilos disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimización y Análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>Optimización para Engagement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            El generador incluye herramientas avanzadas para maximizar el engagement:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Análisis de Engagement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Métricas Predictivas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Potencial de likes</span>
                      <Badge variant="outline">Alto (85%)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Probabilidad de retweets</span>
                      <Badge variant="outline">Medio (67%)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Engagement rate esperado</span>
                      <Badge variant="outline">4.2%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Alcance estimado</span>
                      <Badge variant="outline">2.5K usuarios</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Factores de Optimización</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Hook strength:</strong> Qué tan atractivo es el primer tweet</li>
                    <li>• <strong>Value density:</strong> Cantidad de valor por tweet</li>
                    <li>• <strong>Flow quality:</strong> Fluidez entre tweets</li>
                    <li>• <strong>CTA effectiveness:</strong> Calidad del call-to-action</li>
                    <li>• <strong>Hashtag relevance:</strong> Relevancia de hashtags</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Optimizaciones Automáticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded p-3">
                  <h4 className="font-medium">Hook Optimization</h4>
                  <p className="text-sm text-gray-600">Mejora automática del primer tweet para maximizar clics</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Hashtag Research</h4>
                  <p className="text-sm text-gray-600">Selección de hashtags basada en tendencias actuales</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Timing Suggestions</h4>
                  <p className="text-sm text-gray-600">Mejor momento para publicar según tu audiencia</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">A/B Testing de Hilos</h3>
              <p className="text-gray-700">
                Genera múltiples versiones del mismo hilo para probar diferentes enfoques:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Versión A:</strong> Enfoque educativo formal</li>
                <li><strong>Versión B:</strong> Enfoque conversacional con storytelling</li>
                <li><strong>Versión C:</strong> Enfoque de lista con datos y estadísticas</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del panel de análisis de engagement y optimización
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exportar y Programar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-green-600" />
            <span>Exportar y Programar Publicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Una vez completado tu hilo, tienes múltiples opciones para publicarlo:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Opciones de Exportación</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Copiar al portapapeles</p>
                    <p className="text-sm text-gray-600">Texto listo para pegar</p>
                  </div>
                  <Copy className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Exportar como imagen</p>
                    <p className="text-sm text-gray-600">Carrusel visual del hilo</p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Archivo de texto</p>
                    <p className="text-sm text-gray-600">Documento .txt numerado</p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">JSON estructurado</p>
                    <p className="text-sm text-gray-600">Para herramientas de automatización</p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Programación de Publicación</h3>
              <div className="space-y-2">
                <div className="border rounded p-3">
                  <h4 className="font-medium">Integración con Herramientas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Buffer</li>
                    <li>• Hootsuite</li>
                    <li>• Later</li>
                    <li>• Sprout Social</li>
                  </ul>
                </div>
                
                <div className="border rounded p-3">
                  <h4 className="font-medium">Configuración de Timing</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Publicación inmediata</li>
                    <li>• Programar fecha y hora</li>
                    <li>• Mejor momento sugerido</li>
                    <li>• Publicación escalonada</li>
                  </ul>
                </div>
                
                <div className="border rounded p-3">
                  <h4 className="font-medium">Opciones Avanzadas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Intervalos entre tweets</li>
                    <li>• Promoción cruzada</li>
                    <li>• Seguimiento automático</li>
                    <li>• Respuestas programadas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Formatos de Salida por Plataforma</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded p-3">
                <h4 className="font-medium">Twitter/X</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Numeración automática (1/n)</li>
                  <li>• Hashtags optimizados</li>
                  <li>• Menciones estratégicas</li>
                  <li>• Emojis para engagement</li>
                </ul>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-medium">LinkedIn</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato de carrusel</li>
                  <li>• Lenguaje profesional</li>
                  <li>• Call-to-action para conexiones</li>
                  <li>• Hashtags de industria</li>
                </ul>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-medium">Instagram</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato de stories</li>
                  <li>• Diseño visual atractivo</li>
                  <li>• Hashtags populares</li>
                  <li>• Stickers interactivos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las opciones de exportación y programación
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos y Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Lightbulb className="h-5 w-5" />
            <span>Consejos para Hilos Virales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Hook poderoso:</strong> Los primeros 5 segundos determinan si leen el resto</li>
            <li><strong>Una idea por tweet:</strong> Mantén cada post enfocado en un solo concepto</li>
            <li><strong>Usa números:</strong> "5 formas de..." funciona mejor que "Formas de..."</li>
            <li><strong>Incluye datos:</strong> Estadísticas y números aumentan la credibilidad</li>
            <li><strong>Storytelling personal:</strong> Las experiencias personales generan más engagement</li>
            <li><strong>Call-to-action claro:</strong> Dile a la audiencia exactamente qué hacer</li>
            <li><strong>Timing perfecto:</strong> Publica cuando tu audiencia está más activa</li>
            <li><strong>Interactúa rápido:</strong> Responde a los primeros comentarios inmediatamente</li>
            <li><strong>Reutiliza contenido:</strong> Un buen hilo puede adaptarse a múltiples formatos</li>
            <li><strong>Mide y aprende:</strong> Analiza qué hilos funcionan mejor y replica el éxito</li>
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
              <h4 className="font-medium">El hilo generado es muy genérico</h4>
              <p className="text-sm text-gray-600">
                Proporciona más contexto específico sobre tu audiencia y añade ejemplos concretos en el contenido fuente.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Los tweets exceden el límite de caracteres</h4>
              <p className="text-sm text-gray-600">
                Ajusta la configuración de longitud a "Corto" o edita manualmente los tweets más largos dividiéndolos.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El tono no coincide con mi marca</h4>
              <p className="text-sm text-gray-600">
                Personaliza las configuraciones de tono y crea una plantilla de estilo específica para tu marca.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Los hashtags no son relevantes</h4>
              <p className="text-sm text-gray-600">
                Revisa las configuraciones de hashtags y añade palabras clave específicas de tu industria en el contenido fuente.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El hilo no tiene suficiente engagement</h4>
              <p className="text-sm text-gray-600">
                Usa el análisis predictivo para identificar debilidades y aplica las sugerencias de optimización automática.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}