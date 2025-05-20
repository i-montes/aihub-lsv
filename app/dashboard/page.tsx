import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileCheck,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowRight,
  FileUp,
  Users,
  Library,
  TrendingUp,
  Bell,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido a PressAI</h1>
          <p className="text-gray-500">Tu kit de herramientas de periodismo con IA</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Hoy</span>
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">Nuevo Proyecto</Button>
        </div>
      </div>

      {/* Main Tools Section */}
      <section>
        <h2 className="text-lg font-bold mb-4">Herramientas Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Style Checker */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Activo</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Corrector de Estilo</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Verifica y corrige tu texto según pautas editoriales personalizadas.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Último uso: Hoy</div>
                  <Link href="/dashboard/proofreader">
                    <Button variant="outline" className="flex items-center gap-1">
                      Usar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thread Generator */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Activo</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Generador de Hilos</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Convierte artículos en atractivos hilos de redes sociales con un solo clic.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Último uso: Ayer</div>
                  <Link href="/dashboard/thread-generator">
                    <Button variant="outline" className="flex items-center gap-1">
                      Usar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Activo</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Boletín</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Crea boletines atractivos con formatos optimizados para correo electrónico.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Último uso: Hace 3 días</div>
                  <Link href="/dashboard/newsletter-generator">
                    <Button variant="outline" className="flex items-center gap-1">
                      Usar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Organization Activity and Resource Library */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Activity */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad de la Organización</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todo
              </Button>
            </div>
            <CardDescription>Actividad reciente de tu equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileUp className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">María García subió un nuevo artículo</p>
                  <p className="text-xs text-gray-500">hace 35 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Carlos Rodríguez generó un hilo de Twitter</p>
                  <p className="text-xs text-gray-500">hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ana Martínez creó un boletín</p>
                  <p className="text-xs text-gray-500">hace 5 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Juan López invitó a un nuevo miembro</p>
                  <p className="text-xs text-gray-500">Ayer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Library */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Biblioteca de Recursos</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todo
              </Button>
            </div>
            <CardDescription>Recursos y plantillas disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <Library className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Guía de Estilo Editorial</p>
                    <p className="text-xs text-gray-500">PDF • Actualizado hace 2 semanas</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Descargar
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Plantilla de Boletín Semanal</p>
                    <p className="text-xs text-gray-500">Plantilla • Usada 24 veces</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Usar
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Estructura de Hilo Viral</p>
                    <p className="text-xs text-gray-500">Plantilla • Usada 18 veces</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Usar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Performance Metrics and Usage Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Métricas de Rendimiento</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Este mes
              </Button>
            </div>
            <CardDescription>Estadísticas de uso y eficiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Artículos creados</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +12% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Hilos generados</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +8% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Boletines enviados</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +5% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Tiempo ahorrado</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">36h</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +15% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[150px] flex items-end justify-between gap-2 px-2">
              {/* Simplified chart */}
              {Array.from({ length: 14 }).map((_, i) => {
                const height = 30 + Math.random() * 70
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary-100 rounded-t-sm" style={{ height: `${height}px` }}></div>
                    {i % 2 === 0 && <div className="text-[10px] text-gray-400 mt-1">{i + 1}</div>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tendencias de Uso</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Este mes
              </Button>
            </div>
            <CardDescription>Uso de herramientas por tu equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Corrector de Estilo</span>
                  </div>
                  <span className="text-sm">42%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Generador de Hilos</span>
                  </div>
                  <span className="text-sm">35%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Boletines</span>
                  </div>
                  <span className="text-sm">23%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "23%" }}></div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Usuario más activo</p>
                    <p className="text-xs text-gray-500">María García • 28 usos esta semana</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src="/professional-woman-journalist.png"
                      alt="María García"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Learning Center and Updates Log */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Center */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Centro de Aprendizaje</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todo
              </Button>
            </div>
            <CardDescription>Recursos para mejorar tus habilidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Cómo Escribir Titulares que Convierten</p>
                  <p className="text-xs text-gray-500 mb-2">Tutorial • 8 min de lectura</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver tutorial
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Estructura de Hilos Virales en Twitter</p>
                  <p className="text-xs text-gray-500 mb-2">Webinar • 22 min</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver webinar
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Optimización de Boletines para Conversión</p>
                  <p className="text-xs text-gray-500 mb-2">Guía • 15 min de lectura</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Leer guía
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Log */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registro de Actualizaciones</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todo
              </Button>
            </div>
            <CardDescription>Últimas mejoras y cambios en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-gray-200">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Nuevo Generador de Hilos</p>
                      <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">Nuevo</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">hace 2 días</p>
                    <p className="text-sm text-gray-600">
                      Hemos lanzado una nueva versión del generador de hilos con soporte para múltiples plataformas.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-medium">Mejoras en el Corrector de Estilo</p>
                    <p className="text-xs text-gray-500 mb-1">hace 1 semana</p>
                    <p className="text-sm text-gray-600">
                      El corrector de estilo ahora admite más guías editoriales y ofrece sugerencias más precisas.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-medium">Integración con Google Docs</p>
                    <p className="text-xs text-gray-500 mb-1">hace 2 semanas</p>
                    <p className="text-sm text-gray-600">
                      Ahora puedes importar y exportar documentos directamente desde Google Docs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Status Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium">Todos los Sistemas Operativos</h3>
            <p className="text-sm text-gray-500">Última verificación hace 5 minutos</p>
          </div>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">3 Notificaciones sin Leer</h3>
            <p className="text-sm text-gray-500">Revisa tu bandeja de entrada</p>
          </div>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium">La Suscripción se Renueva Pronto</h3>
            <p className="text-sm text-gray-500">15 días restantes</p>
          </div>
        </Card>
      </section>
    </div>
  )
}
