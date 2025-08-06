"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileCheck, 
  FileText, 
  RssIcon, 
  Settings, 
  Search, 
  Download, 
  Copy, 
  ExternalLink,
  BookOpen,
  Lightbulb,
  Zap,
  Users,
  Shield,
  HelpCircle
} from "lucide-react"

// Componente para el icono de X/Twitter
function XIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0.254 0.25 500 451.954" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function DocumentacionPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro */}
      <div className="space-y-4">
        <p className="text-lg text-gray-600">
          Bienvenido a la documentación completa de KIT.AI. Aquí encontrarás toda la información necesaria 
          para aprovechar al máximo nuestras herramientas de IA para periodismo digital.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <CardTitle className="text-lg">Primeros Pasos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Aprende los conceptos básicos y configura tu cuenta para comenzar a usar las herramientas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Mejores Prácticas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Consejos y técnicas para obtener los mejores resultados con cada herramienta.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Flujos de Trabajo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Ejemplos de flujos de trabajo completos para diferentes tipos de contenido.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Documentation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="corrector">Corrector</TabsTrigger>
          <TabsTrigger value="hilos">Hilos</TabsTrigger>
          <TabsTrigger value="resumenes">Resúmenes</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6" id="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Bienvenido a KIT.AI
              </CardTitle>
              <CardDescription>
                Tu plataforma integral de herramientas de IA para periodismo digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                KIT.AI es una suite completa de herramientas diseñadas específicamente para periodistas y creadores de contenido. 
                Nuestra plataforma utiliza inteligencia artificial avanzada para ayudarte a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Corregir y mejorar textos con sugerencias inteligentes</li>
                <li>Generar hilos de Twitter atractivos desde artículos largos</li>
                <li>Crear resúmenes ejecutivos de contenido extenso</li>
                <li>Formatear newsletters profesionales</li>
                <li>Integrar contenido desde WordPress</li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Para Quién es KIT.AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Periodistas digitales</li>
                  <li>• Editores de contenido</li>
                  <li>• Community managers</li>
                  <li>• Bloggers profesionales</li>
                  <li>• Equipos de marketing de contenidos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Seguridad y Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Encriptación de extremo a extremo</li>
                  <li>• No almacenamos tu contenido</li>
                  <li>• Cumplimiento con GDPR</li>
                  <li>• Autenticación segura</li>
                  <li>• Backups automáticos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Corrector Tab */}
        <TabsContent value="corrector" className="space-y-6" id="corrector">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary-600" />
                Corrector de Textos
              </CardTitle>
              <CardDescription>
                Herramienta de corrección y mejora de textos con IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Características Principales:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Corrección ortográfica y gramatical</li>
                    <li>• Sugerencias de estilo y tono</li>
                    <li>• Mejora de legibilidad</li>
                    <li>• Detección de redundancias</li>
                    <li>• Optimización de estructura</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cómo Usar:</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>1. Pega o escribe tu texto en el editor</li>
                    <li>2. Haz clic en "Analizar texto"</li>
                    <li>3. Revisa las sugerencias marcadas</li>
                    <li>4. Acepta o rechaza cada sugerencia</li>
                    <li>5. Exporta el texto corregido</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Consejo Pro:</h4>
                <p className="text-sm text-blue-800">
                  Para mejores resultados, especifica el tipo de audiencia y el tono deseado antes de analizar el texto.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integración con WordPress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                El corrector se integra perfectamente con WordPress para importar y corregir contenido directamente:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <span>Busca artículos por título o URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-gray-500" />
                  <span>Importa contenido automáticamente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-gray-500" />
                  <span>Copia el texto corregido de vuelta</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hilos Tab */}
        <TabsContent value="hilos" className="space-y-6" id="hilos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XIcon className="h-5 w-5" />
                Generador de Hilos
              </CardTitle>
              <CardDescription>
                Convierte artículos largos en hilos de Twitter atractivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Funcionalidades:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Extracción automática de puntos clave</li>
                    <li>• Optimización para engagement</li>
                    <li>• Sugerencias de hashtags</li>
                    <li>• Numeración automática de tweets</li>
                    <li>• Preservación del mensaje principal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Proceso:</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>1. Importa contenido desde WordPress o pega texto</li>
                    <li>2. Selecciona el número de tweets deseado</li>
                    <li>3. Ajusta el tono y estilo</li>
                    <li>4. Genera el hilo automáticamente</li>
                    <li>5. Edita y personaliza cada tweet</li>
                    <li>6. Copia para publicar en Twitter</li>
                  </ol>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✨ Mejores Prácticas:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Mantén el primer tweet como gancho atractivo</li>
                  <li>• Usa emojis para mejorar la legibilidad</li>
                  <li>• Incluye una llamada a la acción al final</li>
                  <li>• Revisa que cada tweet tenga sentido por sí solo</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opciones de Personalización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Tono</h5>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">Profesional</Badge>
                    <Badge variant="outline">Casual</Badge>
                    <Badge variant="outline">Educativo</Badge>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Longitud</h5>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">5-7 tweets</Badge>
                    <Badge variant="outline">8-12 tweets</Badge>
                    <Badge variant="outline">13+ tweets</Badge>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Estilo</h5>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">Narrativo</Badge>
                    <Badge variant="outline">Lista</Badge>
                    <Badge variant="outline">Pregunta-Respuesta</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resúmenes Tab */}
        <TabsContent value="resumenes" className="space-y-6" id="resumenes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Generador de Resúmenes
              </CardTitle>
              <CardDescription>
                Crea resúmenes ejecutivos y síntesis de contenido extenso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Tipos de Resumen:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Ejecutivo:</strong> Para directivos y tomadores de decisiones</li>
                    <li>• <strong>Técnico:</strong> Mantiene terminología especializada</li>
                    <li>• <strong>General:</strong> Para audiencia amplia</li>
                    <li>• <strong>Académico:</strong> Con referencias y estructura formal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Configuraciones:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Longitud del resumen (palabras/párrafos)</li>
                    <li>• Nivel de detalle técnico</li>
                    <li>• Inclusión de datos y estadísticas</li>
                    <li>• Formato de salida (párrafos/bullets)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚡ Funciones Avanzadas:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Extracción automática de puntos clave</li>
                  <li>• Identificación de conclusiones principales</li>
                  <li>• Preservación de datos importantes</li>
                  <li>• Generación de títulos sugeridos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-6" id="newsletter">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RssIcon className="h-5 w-5 text-primary-600" />
                Generador de Newsletter
              </CardTitle>
              <CardDescription>
                Formatea contenido para newsletters profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Elementos Incluidos:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Encabezado atractivo</li>
                    <li>• Secciones organizadas</li>
                    <li>• Llamadas a la acción (CTAs)</li>
                    <li>• Enlaces y referencias</li>
                    <li>• Pie de página profesional</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Plantillas Disponibles:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Newsletter informativo</li>
                    <li>• Boletín corporativo</li>
                    <li>• Newsletter de noticias</li>
                    <li>• Resumen semanal</li>
                    <li>• Plantilla personalizada</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">📧 Optimización para Email:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Formato compatible con clientes de email</li>
                  <li>• Líneas de asunto sugeridas</li>
                  <li>• Previsualización de texto</li>
                  <li>• Optimización para móviles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración Tab */}
        <TabsContent value="configuracion" className="space-y-6" id="configuracion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-600" />
                Configuración de la Plataforma
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia y configura integraciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Configuración de Perfil</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Información personal y profesional</li>
                    <li>• Preferencias de idioma</li>
                    <li>• Configuración de notificaciones</li>
                    <li>• Zona horaria</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Integraciones</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Conexión con WordPress</li>
                    <li>• APIs de redes sociales</li>
                    <li>• Herramientas de analytics</li>
                    <li>• Servicios de almacenamiento</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Configuración de WordPress</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li>1. Ve a Configuración → Integraciones</li>
                    <li>2. Haz clic en "Conectar WordPress"</li>
                    <li>3. Ingresa la URL de tu sitio WordPress</li>
                    <li>4. Proporciona las credenciales de API</li>
                    <li>5. Prueba la conexión</li>
                  </ol>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Gestión de API Keys</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Administra las claves de API para diferentes servicios y herramientas.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>OpenAI API</span>
                    <Badge variant="outline" className="text-green-600">Activa</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>WordPress API</span>
                    <Badge variant="outline" className="text-green-600">Configurada</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-600" />
            Preguntas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-primary-600 pl-4">
              <h5 className="font-semibold">¿Cómo puedo mejorar la calidad de los resultados?</h5>
              <p className="text-sm text-gray-600 mt-1">
                Proporciona contexto claro, especifica el tipo de audiencia y revisa las configuraciones de cada herramienta antes de generar contenido.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-600 pl-4">
              <h5 className="font-semibold">¿Se almacena mi contenido en los servidores?</h5>
              <p className="text-sm text-gray-600 mt-1">
                No, tu contenido se procesa en tiempo real y no se almacena permanentemente en nuestros servidores por motivos de privacidad.
              </p>
            </div>
            
            <div className="border-l-4 border-green-600 pl-4">
              <h5 className="font-semibold">¿Puedo usar las herramientas sin conexión a internet?</h5>
              <p className="text-sm text-gray-600 mt-1">
                No, todas las herramientas requieren conexión a internet ya que utilizan servicios de IA en la nube para el procesamiento.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-600 pl-4">
              <h5 className="font-semibold">¿Hay límites en el uso de las herramientas?</h5>
              <p className="text-sm text-gray-600 mt-1">
                Los límites dependen de tu plan de suscripción. Consulta la sección de configuración para ver tu uso actual y límites.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">¿Necesitas más ayuda?</h3>
            <p className="text-gray-600">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta o problema.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary-100">
                <ExternalLink className="h-3 w-3 mr-1" />
                Contactar Soporte
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-100">
                <BookOpen className="h-3 w-3 mr-1" />
                Tutoriales en Video
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}