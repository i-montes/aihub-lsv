"use client";

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
  ExternalLink,
  ChevronDown,
  Edit,
  Search,
  UserSearch,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import UsefulLinksModal from "@/components/useful-links-modal";
import { useAuth } from "@/hooks/use-auth";

interface UsefulLink {
  id: number;
  name: string;
  description: string | null;
  link: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const { profile, organization } = useAuth();

  // Cargar enlaces útiles al montar el componente
  useEffect(() => {
    fetchUsefulLinks();
  }, []);

  const fetchUsefulLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch("/api/useful-links");
      if (response.ok) {
        const data = await response.json();
        setUsefulLinks(data.links || []);
      } else {
        console.error("Error fetching useful links");
      }
    } catch (error) {
      console.error("Error fetching useful links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleLinksUpdated = () => {
    fetchUsefulLinks();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kit de herramientas para periodistas</h1>
          <p className="text-gray-500">Soluciones editoriales basadas en inteligencia artificial generativa</p>
        </div>
      </div>

      {/* Main Tools Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Style Checker */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Corrector de estilo</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Optimiza tu texto según pautas de la RAE, Fundéu y tu manual de estilo.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/corrector">
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
                </div>
                <h3 className="text-xl font-bold mb-2">Generador de hilos</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Convierte tus artículos en hilos de X listos para publicar. 🧵
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/generador-hilos">
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
                </div>
                <h3 className="text-xl font-bold mb-2">Resumen</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Haz tus resúmenes de noticias en base a los últimos artículos
                  publicados.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Link href="/dashboard/generador-resumen">
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

          {/* Detector de mentiras — restringido igual que en el sidebar */}
          {organization?.name == "La Silla Vacía" && (
            <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                      <Search className="h-6 w-6 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Nuevo
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Detector de mentiras</h3>
                  <p className="text-gray-500 mb-4 flex-grow">
                    Redacta el borrador de tu chequeo a partir de la
                    desinformación y tus evidencias de verificación.
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Link href="/dashboard/detector-de-mentiras">
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
          )}

          {/* Quién es quién — mismo alcance que el detector */}
          {organization?.name == "La Silla Vacía" && (
            <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                      <UserSearch className="h-6 w-6 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Nuevo
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quién es quién</h3>
                  <p className="text-gray-500 mb-4 flex-grow">
                    Genera perfiles tipo ‘Quién es quién’ con el archivo de La
                    Silla Vacía y la base de datos de leyes de Orza.
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Link href="/dashboard/quien-es-quien">
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
          )}
        </div>
      </section>

      {/* Learning Center and Updates Log */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Useful Links */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Enlaces útiles</CardTitle>
              <div className="flex items-center gap-2">
                {profile?.role == "OWNER" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
                <ChevronDown className="h-4 w-4 text-gray-400 animate-bounce" />
              </div>
            </div>
            <CardDescription>
              Herramientas externas recomendadas para periodistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-3 pr-2">
                {isLoadingLinks ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Cargando enlaces...</p>
                  </div>
                ) : usefulLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      Aquí aparecerán los enlaces a herramientas externas útiles
                    </p>
                    <p className="text-sm text-gray-400">
                      Haz clic en "Editar" para añadir enlaces personalizados
                    </p>
                  </div>
                ) : (
                  usefulLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{link.name}</p>
                        {link.description && (
                          <p className="text-sm text-gray-500">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Log */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimas actualizaciones</CardTitle>
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
                        <p className="font-medium">
                          Nueva página de analíticas
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                          Nuevo
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ahora puedes acceder a métricas detalladas de uso,
                        estadísticas de herramientas y análisis de rendimiento
                        en la nueva sección de analíticas.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          Mejoras en el botón de colapso del sidebar
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          Actualizado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        El botón de colapso del sidebar ahora está visualmente
                        integrado con el título y ofrece una mejor experiencia
                        de usuario.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Nuevo generador de hilos</p>
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                          Disponible
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hemos lanzado una nueva versión del generador de hilos
                        con soporte para múltiples plataformas.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">
                        Mejoras en el corrector de estilo
                      </p>
                      <p className="text-sm text-gray-600">
                        El corrector de estilo ahora admite más guías
                        editoriales y ofrece sugerencias más precisas.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">
                        Lanzamiento del generador de resúmenes
                      </p>
                      <p className="text-sm text-gray-600">
                        Nueva herramienta para crear resúmenes automáticos de
                        noticias basados en artículos recientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal para gestionar enlaces útiles */}
      <UsefulLinksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLinksUpdated={handleLinksUpdated}
      />
    </div>
  );
}
