"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Zap, Settings, Download, Copy, RefreshCw, AlertCircle, Lightbulb, BookOpen, Clock, Target, BarChart3, Filter, Eye } from "lucide-react"

export default function ResumenesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Generador de Resúmenes</h1>
        <p className="text-lg text-gray-600">
          Extrae los puntos clave de cualquier contenido largo con IA avanzada, creando resúmenes precisos y útiles en segundos.
        </p>
      </div>

      {/* ¿Qué son los Resúmenes? */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <BookOpen className="h-5 w-5" />
            <span>¿Qué es el Generador de Resúmenes?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            El Generador de Resúmenes utiliza IA avanzada para analizar contenido extenso y extraer los puntos más importantes, 
            creando resúmenes concisos que mantienen la esencia y el valor del contenido original.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800">Tipos de Resúmenes</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Resúmenes ejecutivos</li>
                <li>Puntos clave (bullet points)</li>
                <li>Resúmenes narrativos</li>
                <li>Abstracts académicos</li>
                <li>Síntesis temáticas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Casos de Uso</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Artículos de investigación</li>
                <li>Informes empresariales</li>
                <li>Documentos legales</li>
                <li>Contenido web extenso</li>
                <li>Libros y ebooks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceder al Generador */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder al Generador de Resúmenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Herramientas"</strong></li>
            <li>Selecciona <strong>"Resúmenes"</strong> en el submenu</li>
            <li>Se abrirá la interfaz del generador de resúmenes</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Herramientas → Resúmenes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interfaz del Generador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>Interfaz del Generador</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La interfaz está diseñada para procesar eficientemente contenido de cualquier longitud:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Elementos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Entrada</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Área de texto para contenido largo</li>
                    <li>• Carga de archivos (PDF, DOCX, TXT)</li>
                    <li>• Importación desde URL</li>
                    <li>• Contador de palabras y páginas</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Configuración de Resumen</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tipo de resumen deseado</li>
                    <li>• Longitud objetivo</li>
                    <li>• Nivel de detalle</li>
                    <li>• Enfoque temático</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Resultados</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Resumen generado</li>
                    <li>• Puntos clave destacados</li>
                    <li>• Estadísticas de compresión</li>
                    <li>• Opciones de refinamiento</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Herramientas de Análisis</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Análisis de temas principales</li>
                    <li>• Extracción de entidades</li>
                    <li>• Mapa conceptual</li>
                    <li>• Métricas de legibilidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la interfaz completa del generador de resúmenes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Crear un Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Cómo Crear un Resumen Efectivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Paso 1: Cargar el Contenido</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Puedes introducir contenido de múltiples formas:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Texto directo:</strong> Pega el contenido en el área de texto</li>
                  <li><strong>Archivos:</strong> Sube documentos PDF, DOCX, TXT, o RTF</li>
                  <li><strong>URLs:</strong> Extrae contenido directamente de páginas web</li>
                  <li><strong>WordPress:</strong> Importa posts desde tu sitio web</li>
                  <li><strong>Múltiples fuentes:</strong> Combina varios documentos en un resumen</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Límites:</strong> Hasta 50,000 palabras por documento individual, 
                    o hasta 200 páginas en formato PDF.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 2: Configurar Parámetros</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Tipo de Resumen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Ejecutivo</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Resumen para directivos y tomadores de decisiones</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Académico</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Abstract formal con metodología y conclusiones</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Puntos Clave</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Lista estructurada de ideas principales</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Narrativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Resumen en formato de historia coherente</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Longitud del Resumen</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Ultra Corto</p>
                      <p className="text-xs text-gray-600">1-2 párrafos</p>
                      <p className="text-xs text-gray-500">~100 palabras</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Corto</p>
                      <p className="text-xs text-gray-600">3-4 párrafos</p>
                      <p className="text-xs text-gray-500">~250 palabras</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Medio</p>
                      <p className="text-xs text-gray-600">5-7 párrafos</p>
                      <p className="text-xs text-gray-500">~500 palabras</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Detallado</p>
                      <p className="text-xs text-gray-600">8+ párrafos</p>
                      <p className="text-xs text-gray-500">~1000 palabras</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Enfoque Temático</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">General</p>
                      <p className="text-xs text-gray-600">Todos los temas</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Técnico</p>
                      <p className="text-xs text-gray-600">Aspectos técnicos</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Comercial</p>
                      <p className="text-xs text-gray-600">Impacto de negocio</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Estratégico</p>
                      <p className="text-xs text-gray-600">Decisiones clave</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Operativo</p>
                      <p className="text-xs text-gray-600">Implementación</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Personalizado</p>
                      <p className="text-xs text-gray-600">Temas específicos</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Audiencia Objetivo</h4>
                  <p className="text-gray-700">Selecciona el nivel de conocimiento de tu audiencia:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">Ejecutivos</Badge>
                    <Badge variant="outline">Técnicos</Badge>
                    <Badge variant="outline">Académicos</Badge>
                    <Badge variant="outline">Público general</Badge>
                    <Badge variant="outline">Estudiantes</Badge>
                    <Badge variant="outline">Especialistas</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 3: Generar el Resumen</h3>
              <div className="ml-4 space-y-2">
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Haz clic en <strong>"Generar Resumen"</strong></li>
                  <li>Observa la barra de progreso del análisis (puede tomar 30-90 segundos)</li>
                  <li>Revisa el resumen generado y las estadísticas</li>
                  <li>Analiza los temas principales identificados</li>
                </ol>
                
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="text-sm text-yellow-700">
                    <strong>Tiempo de procesamiento:</strong> Depende de la longitud del contenido. 
                    Documentos de 10,000+ palabras pueden tomar hasta 2 minutos.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 4: Revisar y Refinar</h3>
              <div className="ml-4 space-y-3">
                <p className="text-gray-700">El generador te proporciona herramientas para mejorar el resumen:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-green-600">Análisis de Calidad</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cobertura de temas principales</li>
                      <li>• Coherencia narrativa</li>
                      <li>• Precisión de la información</li>
                      <li>• Nivel de compresión logrado</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-blue-600">Opciones de Refinamiento</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ajustar longitud específica</li>
                      <li>• Enfocarse en temas particulares</li>
                      <li>• Cambiar el tono o estilo</li>
                      <li>• Añadir o quitar secciones</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 5: Personalizar y Exportar</h3>
              <div className="ml-4 space-y-2">
                <p className="text-gray-700">Finaliza tu resumen con opciones avanzadas:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Edición manual:</strong> Modifica cualquier parte del resumen</li>
                  <li><strong>Añadir contexto:</strong> Incluye información adicional relevante</li>
                  <li><strong>Formateo:</strong> Aplica estilos y estructura profesional</li>
                  <li><strong>Verificación:</strong> Comprueba la precisión contra el original</li>
                  <li><strong>Exportación:</strong> Descarga en múltiples formatos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso paso a paso de creación de un resumen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Análisis Avanzado de Contenido</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            El generador incluye herramientas de análisis profundo para entender mejor el contenido:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium">Análisis Temático</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Identificación de temas principales</li>
                  <li>• Peso relativo de cada tema</li>
                  <li>• Relaciones entre conceptos</li>
                  <li>• Evolución temática en el texto</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Marketing Digital (35%), SEO (25%), Redes Sociales (20%)"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">Extracción de Entidades</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personas mencionadas</li>
                  <li>• Organizaciones relevantes</li>
                  <li>• Ubicaciones geográficas</li>
                  <li>• Fechas y eventos importantes</li>
                </ul>
                <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Google (empresa), 2023 (fecha), California (lugar)"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-medium">Análisis de Sentimiento</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tono general del documento</li>
                  <li>• Sentimientos por sección</li>
                  <li>• Palabras clave emocionales</li>
                  <li>• Nivel de objetividad</li>
                </ul>
                <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Positivo (70%), Neutral (25%), Crítico (5%)"
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-medium">Estructura del Documento</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Jerarquía de secciones</li>
                  <li>• Flujo lógico de ideas</li>
                  <li>• Puntos de transición</li>
                  <li>• Conclusiones principales</li>
                </ul>
                <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Introducción → Desarrollo → Casos → Conclusión"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-medium">Métricas de Legibilidad</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Índice de Flesch-Kincaid</li>
                  <li>• Complejidad de vocabulario</li>
                  <li>• Longitud promedio de oraciones</li>
                  <li>• Nivel educativo requerido</li>
                </ul>
                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "Nivel universitario, 16.2 palabras/oración"
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium">Palabras Clave</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Términos más frecuentes</li>
                  <li>• Conceptos técnicos importantes</li>
                  <li>• Frases clave relevantes</li>
                  <li>• Densidad de palabras clave</li>
                </ul>
                <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                  <strong>Ejemplo:</strong> "inteligencia artificial (12x), machine learning (8x)"
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del panel de análisis avanzado con gráficos y métricas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y Personalización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <span>Filtros y Personalización Avanzada</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Personaliza exactamente qué información incluir en tu resumen:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Filtros de Contenido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Por Sección</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Introducción</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Metodología</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Resultados principales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Detalles técnicos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Conclusiones</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Por Tipo de Información</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Datos y estadísticas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Citas y referencias</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Ejemplos específicos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Recomendaciones</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Información histórica</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Filtros Temáticos</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Incluir Solo Estos Temas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Marketing</Badge>
                    <Badge variant="outline">Tecnología</Badge>
                    <Badge variant="outline">Finanzas</Badge>
                    <Badge variant="outline">Operaciones</Badge>
                    <Badge variant="outline">Recursos Humanos</Badge>
                    <Badge variant="outline">+ Añadir tema personalizado</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Excluir Estos Temas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Detalles técnicos</Badge>
                    <Badge variant="secondary">Información legal</Badge>
                    <Badge variant="secondary">Datos históricos</Badge>
                    <Badge variant="secondary">+ Añadir exclusión</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Personalización de Formato</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-3">
                  <h4 className="font-medium">Estructura</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="structure" className="rounded" defaultChecked />
                      <span>Párrafos narrativos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="structure" className="rounded" />
                      <span>Lista de puntos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="structure" className="rounded" />
                      <span>Formato mixto</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-3">
                  <h4 className="font-medium">Nivel de Detalle</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="detail" className="rounded" />
                      <span>Solo ideas principales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="detail" className="rounded" defaultChecked />
                      <span>Ideas + contexto</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="detail" className="rounded" />
                      <span>Análisis detallado</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-3">
                  <h4 className="font-medium">Tono</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="tone" className="rounded" defaultChecked />
                      <span>Neutral/Objetivo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="tone" className="rounded" />
                      <span>Profesional/Formal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="tone" className="rounded" />
                      <span>Conversacional</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las opciones de filtros y personalización avanzada
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exportación y Formatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-green-600" />
            <span>Exportación y Formatos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Exporta tus resúmenes en múltiples formatos según tus necesidades:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Formatos de Exportación</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Documento Word (.docx)</p>
                    <p className="text-sm text-gray-600">Con formato profesional y estilos</p>
                  </div>
                  <Badge variant="outline">Recomendado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">PDF</p>
                    <p className="text-sm text-gray-600">Documento final listo para compartir</p>
                  </div>
                  <Badge variant="outline">Profesional</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Texto Plano (.txt)</p>
                    <p className="text-sm text-gray-600">Solo contenido sin formato</p>
                  </div>
                  <Badge variant="outline">Básico</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Markdown (.md)</p>
                    <p className="text-sm text-gray-600">Para documentación técnica</p>
                  </div>
                  <Badge variant="outline">Técnico</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">HTML</p>
                    <p className="text-sm text-gray-600">Para publicación web</p>
                  </div>
                  <Badge variant="outline">Web</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Opciones de Contenido</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <div>
                    <p className="font-medium">Resumen principal</p>
                    <p className="text-xs text-gray-600">El resumen generado</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <div>
                    <p className="font-medium">Puntos clave</p>
                    <p className="text-xs text-gray-600">Lista de ideas principales</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="font-medium">Análisis temático</p>
                    <p className="text-xs text-gray-600">Gráficos y estadísticas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="font-medium">Entidades extraídas</p>
                    <p className="text-xs text-gray-600">Personas, lugares, fechas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="font-medium">Métricas de calidad</p>
                    <p className="text-xs text-gray-600">Estadísticas del análisis</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="font-medium">Información del documento original</p>
                    <p className="text-xs text-gray-600">Metadatos y fuente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Plantillas Predefinidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded p-3">
                <h4 className="font-medium">Informe Ejecutivo</h4>
                <p className="text-sm text-gray-600">Formato corporativo con logo y branding</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-medium">Resumen Académico</h4>
                <p className="text-sm text-gray-600">Formato de paper científico</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-medium">Brief de Proyecto</h4>
                <p className="text-sm text-gray-600">Formato para presentaciones</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                <Copy className="h-4 w-4" />
                <span>Copiar resumen</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                <Eye className="h-4 w-4" />
                <span>Vista previa</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
                <span>Regenerar</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las opciones de exportación y plantillas disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos y Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Lightbulb className="h-5 w-5" />
            <span>Consejos para Resúmenes Efectivos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Define tu audiencia:</strong> Ajusta el nivel de detalle según quién leerá el resumen</li>
            <li><strong>Establece el propósito:</strong> ¿Es para tomar decisiones, informar o educar?</li>
            <li><strong>Revisa la fuente:</strong> Asegúrate de que el documento original esté bien estructurado</li>
            <li><strong>Usa filtros temáticos:</strong> Enfócate en los temas más relevantes para tu objetivo</li>
            <li><strong>Verifica la precisión:</strong> Compara el resumen con puntos clave del original</li>
            <li><strong>Personaliza el formato:</strong> Adapta la estructura al uso que le darás</li>
            <li><strong>Incluye contexto necesario:</strong> Añade información de fondo si es importante</li>
            <li><strong>Mantén la objetividad:</strong> Preserva el tono neutral del contenido original</li>
            <li><strong>Optimiza la longitud:</strong> Ni muy corto que pierda información, ni muy largo que pierda propósito</li>
            <li><strong>Guarda configuraciones:</strong> Crea plantillas para tipos de documentos recurrentes</li>
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
              <h4 className="font-medium">El resumen omite información importante</h4>
              <p className="text-sm text-gray-600">
                Aumenta el nivel de detalle, verifica que los filtros temáticos incluyan todos los temas relevantes, 
                o usa el enfoque "Personalizado" especificando qué información es crítica.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El resumen es demasiado técnico o complejo</h4>
              <p className="text-sm text-gray-600">
                Cambia la audiencia objetivo a "Público general" y selecciona un tono más conversacional. 
                También puedes usar filtros para excluir detalles técnicos específicos.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El procesamiento falla con documentos muy largos</h4>
              <p className="text-sm text-gray-600">
                Divide el documento en secciones más pequeñas (máximo 25,000 palabras por sección) 
                o usa la función de resumen por capítulos para documentos muy extensos.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El análisis temático no es preciso</h4>
              <p className="text-sm text-gray-600">
                Verifica que el documento tenga una estructura clara con títulos y subtítulos. 
                Para documentos mal estructurados, usa la opción de "Pre-procesamiento" para mejorar el análisis.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">El resumen no mantiene el contexto original</h4>
              <p className="text-sm text-gray-600">
                Selecciona "Narrativo" como tipo de resumen y asegúrate de incluir la introducción y conclusiones 
                del documento original en los filtros de contenido.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}