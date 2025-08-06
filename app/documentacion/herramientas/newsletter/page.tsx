"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Zap, Settings, Download, Copy, RefreshCw, AlertCircle, Lightbulb, Users, Calendar, Target, BarChart3, Filter, Eye, Send, Image, Link, Palette } from "lucide-react"

export default function NewsletterPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Generador de Newsletter</h1>
        <p className="text-lg text-gray-600">
          Crea newsletters profesionales y atractivos con IA, transformando contenido en comunicaciones efectivas para tu audiencia.
        </p>
      </div>

      {/* ¿Qué es el Newsletter Generator? */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Mail className="h-5 w-5" />
            <span>¿Qué es el Generador de Newsletter?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            El Generador de Newsletter utiliza IA para crear comunicaciones profesionales y atractivas, 
            transformando contenido bruto en newsletters bien estructurados que conectan con tu audiencia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800">Tipos de Newsletter</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Newsletter corporativo</li>
                <li>Boletín informativo</li>
                <li>Newsletter de producto</li>
                <li>Comunicación interna</li>
                <li>Newsletter educativo</li>
                <li>Promocional/Marketing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Casos de Uso</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Comunicación con clientes</li>
                <li>Updates de empresa</li>
                <li>Lanzamientos de producto</li>
                <li>Contenido educativo</li>
                <li>Eventos y noticias</li>
                <li>Campañas de marketing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceder al Generador */}
      <Card>
        <CardHeader>
          <CardTitle>Acceder al Generador de Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ve al menú lateral y haz clic en <strong>"Herramientas"</strong></li>
            <li>Selecciona <strong>"Newsletter"</strong> en el submenu</li>
            <li>Se abrirá la interfaz del generador de newsletter</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la navegación a Herramientas → Newsletter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interfaz del Generador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-green-600" />
            <span>Interfaz del Generador</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La interfaz está diseñada para crear newsletters profesionales de manera intuitiva:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Elementos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Panel de Contenido</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Editor de contenido principal</li>
                    <li>• Importación de fuentes múltiples</li>
                    <li>• Gestión de secciones</li>
                    <li>• Biblioteca de contenido</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Configuración de Newsletter</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Plantillas prediseñadas</li>
                    <li>• Configuración de audiencia</li>
                    <li>• Tono y estilo</li>
                    <li>• Frecuencia y timing</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Editor Visual</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Vista previa en tiempo real</li>
                    <li>• Editor drag & drop</li>
                    <li>• Personalización de diseño</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Herramientas de Optimización</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Análisis de engagement</li>
                    <li>• Optimización de subject line</li>
                    <li>• Test A/B automático</li>
                    <li>• Métricas de rendimiento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la interfaz completa del generador de newsletter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Crear un Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Cómo Crear un Newsletter Efectivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Paso 1: Definir Objetivo y Audiencia</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Seleccionar Tipo de Newsletter</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Informativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Noticias, updates y contenido educativo</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Promocional</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Ofertas, productos y campañas de marketing</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Corporativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Comunicación interna y updates de empresa</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">Educativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Tutoriales, tips y contenido de valor</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Configurar Audiencia</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Clientes</p>
                      <p className="text-xs text-gray-600">Usuarios actuales</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Prospects</p>
                      <p className="text-xs text-gray-600">Leads potenciales</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Empleados</p>
                      <p className="text-xs text-gray-600">Equipo interno</p>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <p className="font-medium">Partners</p>
                      <p className="text-xs text-gray-600">Socios comerciales</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Define claramente tu objetivo principal: ¿informar, vender, educar o fidelizar?
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 2: Recopilar y Organizar Contenido</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Fuentes de Contenido</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium text-green-600">Contenido Interno</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Blog posts de la empresa</li>
                        <li>• Noticias corporativas</li>
                        <li>• Lanzamientos de producto</li>
                        <li>• Casos de éxito</li>
                        <li>• Eventos y webinars</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium text-blue-600">Contenido Externo</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Noticias de la industria</li>
                        <li>• Tendencias del mercado</li>
                        <li>• Contenido curado</li>
                        <li>• Investigaciones relevantes</li>
                        <li>• Opiniones de expertos</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Métodos de Importación</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>WordPress Integration:</strong> Importa automáticamente posts de tu blog</li>
                    <li><strong>URL Scraping:</strong> Extrae contenido de páginas web específicas</li>
                    <li><strong>RSS Feeds:</strong> Conecta feeds de noticias relevantes</li>
                    <li><strong>Texto directo:</strong> Pega contenido manualmente</li>
                    <li><strong>Archivos:</strong> Sube documentos con información relevante</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Organización del Contenido</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border rounded p-3">
                      <h5 className="font-medium">Por Prioridad</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Alta (Noticias importantes)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Media (Updates regulares)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Baja (Contenido adicional)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded p-3">
                      <h5 className="font-medium">Por Sección</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Noticias principales</li>
                        <li>• Productos/Servicios</li>
                        <li>• Eventos</li>
                        <li>• Tips y consejos</li>
                        <li>• Recursos</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded p-3">
                      <h5 className="font-medium">Por Formato</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Artículos largos</li>
                        <li>• Noticias breves</li>
                        <li>• Listas y tips</li>
                        <li>• Imágenes/Infografías</li>
                        <li>• Videos/Enlaces</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 3: Seleccionar Plantilla y Diseño</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Plantillas Disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium text-purple-600">Plantillas Corporativas</h5>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Executive Brief</span>
                          <Badge variant="outline">Formal</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Company Update</span>
                          <Badge variant="outline">Profesional</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Internal News</span>
                          <Badge variant="outline">Interno</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium text-blue-600">Plantillas de Marketing</h5>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Product Launch</span>
                          <Badge variant="outline">Promocional</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Customer Stories</span>
                          <Badge variant="outline">Testimonial</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Educational</span>
                          <Badge variant="outline">Educativo</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Personalización de Diseño</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Palette className="h-4 w-4 text-pink-500" />
                        <h5 className="font-medium">Colores y Branding</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Colores corporativos</li>
                        <li>• Logo de la empresa</li>
                        <li>• Fuentes personalizadas</li>
                        <li>• Elementos de marca</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Image className="h-4 w-4 text-green-500" />
                        <h5 className="font-medium">Layout y Estructura</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Número de columnas</li>
                        <li>• Espaciado y márgenes</li>
                        <li>• Posición de imágenes</li>
                        <li>• Orden de secciones</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link className="h-4 w-4 text-blue-500" />
                        <h5 className="font-medium">Elementos Interactivos</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Botones de CTA</li>
                        <li>• Enlaces sociales</li>
                        <li>• Formularios integrados</li>
                        <li>• Elementos multimedia</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 4: Generar y Optimizar Contenido</h3>
              <div className="ml-4 space-y-3">
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Configura los parámetros de generación (tono, longitud, enfoque)</li>
                  <li>Haz clic en <strong>"Generar Newsletter"</strong></li>
                  <li>Revisa el contenido generado automáticamente</li>
                  <li>Utiliza las herramientas de optimización para mejorar engagement</li>
                  <li>Personaliza secciones específicas según necesidades</li>
                </ol>
                
                <div>
                  <h4 className="font-medium">Herramientas de Optimización</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium text-orange-600">Subject Line Optimizer</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Análisis de palabras clave</li>
                        <li>• Predicción de open rate</li>
                        <li>• Variaciones A/B automáticas</li>
                        <li>• Optimización por audiencia</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium text-green-600">Content Optimizer</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Análisis de legibilidad</li>
                        <li>• Optimización de CTAs</li>
                        <li>• Balance texto/imagen</li>
                        <li>• Personalización dinámica</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="text-sm text-yellow-700">
                    <strong>Tiempo de generación:</strong> Entre 2-5 minutos dependiendo de la cantidad de contenido y complejidad del diseño.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Paso 5: Revisar y Finalizar</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="font-medium">Checklist de Revisión</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Subject line optimizado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Preheader text configurado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Todos los enlaces funcionan</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Imágenes optimizadas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">CTAs claros y visibles</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Diseño responsive</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Información de contacto</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Opción de unsubscribe</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Ortografía y gramática</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Branding consistente</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Vista Previa Multi-dispositivo</h4>
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                      <span className="text-sm">📱 Mobile</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                      <span className="text-sm">💻 Desktop</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                      <span className="text-sm">📧 Email Client</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del proceso completo de creación de newsletter paso a paso
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plantillas y Estilos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <span>Plantillas y Estilos Disponibles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Elige entre una amplia variedad de plantillas profesionales diseñadas para diferentes propósitos:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Modern Corporate</h4>
                <Badge variant="outline">Profesional</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Diseño limpio y profesional ideal para comunicaciones corporativas
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• Header con logo prominente</div>
                <div>• Secciones bien definidas</div>
                <div>• Colores corporativos</div>
                <div>• Footer completo</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Marketing Pro</h4>
                <Badge variant="outline">Promocional</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Optimizado para campañas de marketing y promociones
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• CTAs prominentes</div>
                <div>• Diseño visual atractivo</div>
                <div>• Secciones de producto</div>
                <div>• Elementos de urgencia</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">News Digest</h4>
                <Badge variant="outline">Informativo</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Perfecto para boletines informativos y noticias
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• Layout tipo periódico</div>
                <div>• Múltiples artículos</div>
                <div>• Jerarquía visual clara</div>
                <div>• Enlaces a contenido completo</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Educational</h4>
                <Badge variant="outline">Educativo</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Diseñado para contenido educativo y tutoriales
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• Secciones de aprendizaje</div>
                <div>• Tips y consejos destacados</div>
                <div>• Recursos adicionales</div>
                <div>• Progresión de contenido</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Event Focused</h4>
                <Badge variant="outline">Eventos</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Especializado en promoción de eventos y actividades
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• Calendario integrado</div>
                <div>• Detalles de eventos</div>
                <div>• Registro/RSVP</div>
                <div>• Información de ubicación</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Minimalist</h4>
                <Badge variant="outline">Simple</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Diseño minimalista enfocado en el contenido
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>• Diseño limpio</div>
                <div>• Tipografía elegante</div>
                <div>• Espacios en blanco</div>
                <div>• Foco en el mensaje</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Personalización Avanzada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Elementos de Branding</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Logo:</strong> Posición, tamaño y variantes</li>
                  <li>• <strong>Colores:</strong> Paleta corporativa personalizada</li>
                  <li>• <strong>Fuentes:</strong> Tipografías de marca</li>
                  <li>• <strong>Elementos gráficos:</strong> Iconos y decoraciones</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Layout y Estructura</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Columnas:</strong> 1, 2 o 3 columnas</li>
                  <li>• <strong>Secciones:</strong> Orden y prioridad</li>
                  <li>• <strong>Espaciado:</strong> Márgenes y padding</li>
                  <li>• <strong>Responsive:</strong> Adaptación automática</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de la galería de plantillas con vista previa
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimización y Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>Optimización y Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Herramientas avanzadas para maximizar el impacto de tus newsletters:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Optimización de Subject Lines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-blue-600">Análisis Automático</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Longitud óptima (30-50 caracteres)</li>
                    <li>• Palabras de alto impacto</li>
                    <li>• Evitar spam triggers</li>
                    <li>• Personalización dinámica</li>
                    <li>• Emojis estratégicos</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-green-600">Predicción de Performance</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Open rate estimado</li>
                    <li>• Click-through rate predicho</li>
                    <li>• Score de engagement</li>
                    <li>• Comparación con benchmarks</li>
                    <li>• Recomendaciones de mejora</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">A/B Testing Automático</h3>
              <div className="space-y-3">
                <p className="text-gray-700">
                  El sistema genera automáticamente variaciones para probar diferentes elementos:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded p-3">
                    <h4 className="font-medium">Subject Lines</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• Versión A: "Nuevas funciones disponibles"</div>
                      <div>• Versión B: "🚀 Descubre las nuevas funciones"</div>
                      <div>• Versión C: "Ya están aquí: nuevas funciones"</div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-3">
                    <h4 className="font-medium">CTAs</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• "Leer más" vs "Descubrir ahora"</div>
                      <div>• Botón azul vs botón verde</div>
                      <div>• Posición arriba vs abajo</div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-3">
                    <h4 className="font-medium">Contenido</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• Orden de secciones</div>
                      <div>• Longitud de texto</div>
                      <div>• Imágenes vs sin imágenes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Métricas y Reportes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-purple-600">Métricas de Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Open Rate</span>
                      <span className="text-sm font-medium">24.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Click Rate</span>
                      <span className="text-sm font-medium">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unsubscribe Rate</span>
                      <span className="text-sm font-medium">0.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Forward Rate</span>
                      <span className="text-sm font-medium">1.1%</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-orange-600">Análisis de Contenido</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tiempo de lectura</span>
                      <span className="text-sm font-medium">2.3 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Enlaces más clickeados</span>
                      <span className="text-sm font-medium">CTA principal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sección más leída</span>
                      <span className="text-sm font-medium">Noticias</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dispositivo principal</span>
                      <span className="text-sm font-medium">Mobile (68%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Optimización Continua</h3>
              <div className="space-y-3">
                <p className="text-gray-700">
                  El sistema aprende de cada envío para mejorar automáticamente:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-green-600">Machine Learning</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Análisis de patrones de engagement</li>
                      <li>• Predicción de mejores horarios</li>
                      <li>• Segmentación automática</li>
                      <li>• Personalización de contenido</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-blue-600">Recomendaciones</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Mejores días para envío</li>
                      <li>• Frecuencia óptima</li>
                      <li>• Tipos de contenido preferidos</li>
                      <li>• Longitud ideal del newsletter</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla del dashboard de analytics con métricas y gráficos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exportación y Distribución */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-600" />
            <span>Exportación y Distribución</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Múltiples opciones para distribuir tu newsletter según tus necesidades:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Formatos de Exportación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">HTML Completo</p>
                      <p className="text-sm text-gray-600">Código listo para email marketing</p>
                    </div>
                    <Badge variant="outline">Recomendado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">PDF Interactivo</p>
                      <p className="text-sm text-gray-600">Con enlaces clickeables</p>
                    </div>
                    <Badge variant="outline">Profesional</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Imagen PNG/JPG</p>
                      <p className="text-sm text-gray-600">Para redes sociales</p>
                    </div>
                    <Badge variant="outline">Social</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Mailchimp Template</p>
                      <p className="text-sm text-gray-600">Importación directa</p>
                    </div>
                    <Badge variant="outline">Integración</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">WordPress Post</p>
                      <p className="text-sm text-gray-600">Publicación automática</p>
                    </div>
                    <Badge variant="outline">CMS</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Texto Plano</p>
                      <p className="text-sm text-gray-600">Para clientes básicos</p>
                    </div>
                    <Badge variant="outline">Básico</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Integraciones Directas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Plataformas de Email</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mailchimp</li>
                    <li>• Constant Contact</li>
                    <li>• SendGrid</li>
                    <li>• Campaign Monitor</li>
                    <li>• ConvertKit</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">CMS y Blogs</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• WordPress</li>
                    <li>• Drupal</li>
                    <li>• Joomla</li>
                    <li>• Medium</li>
                    <li>• Ghost</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Redes Sociales</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• LinkedIn</li>
                    <li>• Twitter/X</li>
                    <li>• Facebook</li>
                    <li>• Instagram</li>
                    <li>• Buffer/Hootsuite</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Programación y Automatización</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-blue-600">Envío Programado</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Fecha y hora específica</li>
                    <li>• Zona horaria del destinatario</li>
                    <li>• Envío escalonado por segmentos</li>
                    <li>• Reenvío automático a no abiertos</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-green-600">Automatización</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Newsletter semanal/mensual</li>
                    <li>• Triggers basados en eventos</li>
                    <li>• Contenido dinámico</li>
                    <li>• Segmentación automática</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Opciones de Distribución</h3>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                  <Send className="h-4 w-4" />
                  <span>Enviar ahora</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                  <Calendar className="h-4 w-4" />
                  <span>Programar envío</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  <span>Descargar HTML</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                  <Copy className="h-4 w-4" />
                  <span>Copiar código</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50">
                  <Eye className="h-4 w-4" />
                  <span>Vista previa</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla de las opciones de exportación y distribución
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos y Mejores Prácticas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Lightbulb className="h-5 w-5" />
            <span>Mejores Prácticas para Newsletters Exitosos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800">Contenido y Estructura</h4>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li><strong>Jerarquía clara:</strong> Organiza el contenido por importancia</li>
                <li><strong>Valor inmediato:</strong> Ofrece información útil desde el inicio</li>
                <li><strong>Llamadas a la acción:</strong> Máximo 2-3 CTAs principales</li>
                <li><strong>Personalización:</strong> Usa el nombre del destinatario</li>
                <li><strong>Consistencia:</strong> Mantén formato y frecuencia regulares</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800">Diseño y Usabilidad</h4>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li><strong>Mobile-first:</strong> Optimiza para dispositivos móviles</li>
                <li><strong>Carga rápida:</strong> Optimiza imágenes y código</li>
                <li><strong>Accesibilidad:</strong> Usa alt text y contraste adecuado</li>
                <li><strong>Branding coherente:</strong> Mantén identidad visual</li>
                <li><strong>Navegación simple:</strong> Enlaces claros y visibles</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800">Timing y Frecuencia</h4>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li><strong>Horarios óptimos:</strong> Martes-Jueves, 10AM-2PM</li>
                <li><strong>Frecuencia consistente:</strong> Semanal, quincenal o mensual</li>
                <li><strong>Evita spam:</strong> No más de 2-3 envíos por semana</li>
                <li><strong>Zona horaria:</strong> Considera la ubicación de tu audiencia</li>
                <li><strong>Días especiales:</strong> Adapta contenido a fechas relevantes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800">Engagement y Retención</h4>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li><strong>Segmentación:</strong> Envía contenido relevante por grupo</li>
                <li><strong>Feedback:</strong> Incluye encuestas y solicita opiniones</li>
                <li><strong>Exclusividad:</strong> Ofrece contenido único para suscriptores</li>
                <li><strong>Interactividad:</strong> Usa polls, quizzes y elementos dinámicos</li>
                <li><strong>Re-engagement:</strong> Campañas para suscriptores inactivos</li>
              </ul>
            </div>
          </div>
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
              <h4 className="font-medium">Bajas tasas de apertura</h4>
              <p className="text-sm text-gray-600">
                Optimiza el subject line, verifica que no esté en spam, mejora la reputación del dominio, 
                y segmenta mejor tu audiencia. Prueba diferentes horarios de envío.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Problemas de visualización en diferentes clientes</h4>
              <p className="text-sm text-gray-600">
                Usa la vista previa multi-cliente, evita CSS complejo, usa tablas para layout, 
                y prueba en Gmail, Outlook, Apple Mail y clientes móviles.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Alto rate de unsubscribe</h4>
              <p className="text-sm text-gray-600">
                Revisa la frecuencia de envío, mejora la relevancia del contenido, 
                ofrece opciones de preferencias en lugar de unsubscribe completo.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Imágenes que no cargan</h4>
              <p className="text-sm text-gray-600">
                Usa hosting confiable para imágenes, incluye alt text descriptivo, 
                optimiza el tamaño de archivos, y considera usar CDN.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Newsletter marcado como spam</h4>
              <p className="text-sm text-gray-600">
                Evita palabras spam, usa autenticación SPF/DKIM, mantén listas limpias, 
                incluye dirección física, y facilita el unsubscribe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}