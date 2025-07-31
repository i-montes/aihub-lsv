import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  RssIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hub de AI para periodistas</h1>
          <p className="text-gray-500">Un kit de herramientas a medida</p>
        </div>
      </div>

      {/* Main Tools Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Style Checker */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Activo
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Corrector de estilo</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Optimiza tu texto según pautas editoriales y ortográficas,
                  personalizadas
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/proofreader">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
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
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Activo
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Generador de hilos</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Convierte tus artículos en hilos de X listos para publicar. 🧵
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/thread-generator">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
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
                    <RssIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Activo
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Newsletter</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Crea newsletter con formatos personalizados.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/newsletter">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      Usar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Activo
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Resumen</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Haz tus resúmenes de noticias en base a los últimos artículos
                  publicados.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/summary-generator">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      Usar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Learning Center and Updates Log */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Useful Links */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Enlaces útiles</CardTitle>
              <ChevronDown className="h-4 w-4 text-gray-400 animate-bounce" />
            </div>
            <CardDescription>
              Herramientas externas recomendadas para periodistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-3 pr-2">
                <a
                  href="https://notebooklm.google/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">NotebookLM</p>
                    <p className="text-sm text-gray-500">
                      Asistente de investigación con IA para analizar documentos y generar pódcasts
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>

                <a
                  href="https://journaliststudio.google.com/pinpoint/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">Pinpoint</p>
                    <p className="text-sm text-gray-500">
                      Herramienta para analizar grandes cantidades de datos
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>

                <a
                  href="https://godds.ads.northwestern.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">GODDS</p>
                    <p className="text-sm text-gray-500">
                      Sistema de detección de deepfakes para verificar autenticidad de contenido multimedia
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Log */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ultimas actualizaciones</CardTitle>
              <ChevronDown className="h-4 w-4 text-gray-400 animate-bounce" />
            </div>
            <CardDescription>
              Mejoras y cambios en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="relative pl-6 border-l border-gray-200 pr-2">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Nueva Herramienta de Newsletter</p>
                        <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                          Nuevo
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ya puedes crear newsletters personalizados con formatos optimizados.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Nuevo Generador de Hilos</p>
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                          Disponible
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hemos lanzado una nueva versión del generador de hilos con
                        soporte para múltiples plataformas.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">
                        Mejoras en el Corrector de Estilo
                      </p>
                      <p className="text-sm text-gray-600">
                        El corrector de estilo ahora admite más guías editoriales
                        y ofrece sugerencias más precisas.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">
                        Lanzamiento del Generador de Resúmenes
                      </p>
                      <p className="text-sm text-gray-600">
                        Nueva herramienta para crear resúmenes automáticos de noticias basados en artículos recientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}