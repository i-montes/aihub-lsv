"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Edit3, FileText, MessageSquare, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  useEffect(() => {
    // Asegurar que el scroll esté habilitado
    document.body.style.overflow = "auto"
    document.body.style.height = "auto"
    document.documentElement.style.overflow = "auto"
    document.documentElement.style.height = "auto"

    return () => {
      // Restaurar los estilos originales al desmontar
      document.body.style.overflow = ""
      document.body.style.height = ""
      document.documentElement.style.overflow = ""
      document.documentElement.style.height = ""
    }
  }, [])

  return (
    <div className="min-h-full bg-white">
      {/* Navigation */}
      <nav className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="font-bold text-xl">PressTools</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-700 hover:text-primary">
            Herramientas
          </Link>
          <Link href="#benefits" className="text-gray-700 hover:text-primary">
            Beneficios
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-md">
              Iniciar Sesión
            </Button>
          </Link>
          <Button className="bg-primary text-white hover:bg-primary/90 rounded-md">Prueba Gratuita</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Potencia tu
              <br />
              <span className="text-primary">Redacción Periodística</span>
              <br />
              con Inteligencia Artificial
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              Suite completa de herramientas diseñadas específicamente para periodistas que buscan mejorar su redacción,
              ahorrar tiempo y conectar mejor con sus audiencias.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Input type="email" placeholder="Tu correo electrónico" className="w-full sm:w-64 rounded-md" />
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-md">
                Comenzar Ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-100 rounded-3xl p-6 relative">
              <Image
                src="/placeholder.svg?key=dwp1y"
                alt="Periodista trabajando"
                width={500}
                height={400}
                className="rounded-2xl"
              />

              {/* Floating elements */}
              <div className="absolute top-10 -left-10 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Corrección inteligente</span>
                </div>
              </div>

              <div className="absolute bottom-20 -right-10 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">Hilos optimizados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Herramientas Especializadas para Periodistas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Newsletters con IA</h3>
            <p className="text-gray-600 mb-4">
              Genera newsletters atractivos y personalizados con ayuda de IA. Optimiza tu contenido para diferentes
              audiencias y aumenta las tasas de apertura.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Plantillas personalizables</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Sugerencias de titulares</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Análisis de engagement</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Explorar Función
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Edit3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Corrección con Guías de Estilo</h3>
            <p className="text-gray-600 mb-4">
              Corrige tus textos según las guías de estilo más reconocidas en periodismo. Detecta errores gramaticales,
              de estilo y mejora la claridad.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Múltiples guías de estilo</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Corrección en tiempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Sugerencias de mejora</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Explorar Función
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hilos de Tweets</h3>
            <p className="text-gray-600 mb-4">
              Convierte tus artículos en hilos de tweets atractivos y optimizados para maximizar el alcance y engagement
              en redes sociales.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">División inteligente de contenido</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Optimización para engagement</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">Programación de publicaciones</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Explorar Función
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/placeholder.svg?key=o7xgw"
              alt="Equipo de periodistas colaborando"
              width={500}
              height={400}
              className="rounded-3xl"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Beneficios para Periodistas y Redacciones</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Ahorra hasta 10 horas semanales</h3>
                  <p className="text-gray-600">
                    Automatiza tareas repetitivas y enfócate en lo que realmente importa: crear contenido de calidad y
                    contar historias impactantes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Edit3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Mejora la calidad editorial</h3>
                  <p className="text-gray-600">
                    Mantén consistencia en el estilo y tono de tus publicaciones. Reduce errores y mejora la claridad de
                    tus textos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Amplifica tu alcance</h3>
                  <p className="text-gray-600">
                    Distribuye tu contenido en múltiples formatos y canales para llegar a más audiencia y aumentar el
                    engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Potencia tu trabajo periodístico hoy mismo</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a cientos de periodistas que ya están mejorando su redacción y optimizando su flujo de trabajo
          </p>
          <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-md">
            Comenzar Prueba Gratuita de 14 Días
          </Button>
          <p className="mt-4 text-white/80 text-sm">No se requiere tarjeta de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-xl">PressTools</span>
              </div>
              <p className="text-gray-600">Herramientas de IA para periodistas que buscan mejorar su redacción.</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Newsletters con IA
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Corrección de Textos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Hilos de Tweets
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Guías de Estilo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Centro de ayuda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary">
                    Términos de servicio
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2023 PressTools. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-primary">
                Twitter
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                LinkedIn
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
