"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
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
          <div className="w-8 h-8 bg-whatsapp rounded-full flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span className="font-bold text-xl">Gabbler</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-700 hover:text-whatsapp">
            Producto
          </Link>
          <Link href="#" className="text-gray-700 hover:text-whatsapp">
            Clientes
          </Link>
          <Link href="#" className="text-gray-700 hover:text-whatsapp">
            Recursos
          </Link>
          <Link href="#" className="text-gray-700 hover:text-whatsapp">
            Partners
          </Link>
          <Link href="#" className="text-gray-700 hover:text-whatsapp">
            Empresa
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-md">
              Iniciar Sesión
            </Button>
          </Link>
          <Button className="bg-whatsapp text-white hover:bg-whatsapp-dark rounded-md">Solicitar Demo</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Impulsa Más Ventas
              <br />
              Con Conversaciones
              <br />
              Activas Con Tus{" "}
              <span className="bg-whatsapp-light px-2 py-1 inline-block transform -rotate-1">Clientes</span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              La solución de mensajería de Gabbler genera un 18.5% del total de ingresos en línea para marcas líderes.
              Obtén una demo gratuita hoy.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Input type="email" placeholder="Ingresa tu Email" className="w-full sm:w-64 rounded-md" />
              <Button className="bg-whatsapp text-white hover:bg-whatsapp-dark rounded-md">Solicitar Demo</Button>
            </div>
          </div>

          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gray-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gray-300"></div>

            {/* Main image with chat */}
            <div className="relative z-10">
              <div className="bg-whatsapp-light/30 rounded-3xl p-4 relative">
                <Image
                  src="/woman-video-call.png"
                  alt="Cliente usando la aplicación"
                  width={350}
                  height={400}
                  className="rounded-2xl"
                />

                {/* Chat bubble */}
                <div className="absolute top-1/4 -left-36 bg-white p-4 rounded-2xl shadow-lg w-64 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-whatsapp-dark rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">CB</span>
                    </div>
                    <span className="font-medium">Cici Beauty</span>
                  </div>
                  <p className="text-sm">
                    Hola Hailey! Te encantará nuestro último producto, ¿te gustaría agregarlo al carrito?
                  </p>
                </div>

                {/* Customer count badge */}
                <div className="absolute bottom-10 right-0 translate-x-1/2 bg-whatsapp-dark text-white px-3 py-2 rounded-full flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white">
                      <span className="text-xs">A</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-whatsapp-light flex items-center justify-center text-whatsapp-dark">
                      <span className="text-xs">B</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    +120k
                    <br />
                    Clientes
                  </span>
                </div>

                {/* Response bubble */}
                <div className="absolute -bottom-20 left-0 right-0 bg-whatsapp-light p-4 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Hailey Jones</span>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image src="/serene-gaze.png" alt="Hailey" width={24} height={24} />
                    </div>
                  </div>
                  <p className="text-sm">
                    ¡Lo revisaré! Gracias, lo agregaré al carrito ahora mismo. Avísame cuando tengan nuevos productos.
                  </p>
                </div>
              </div>
            </div>

            {/* Circular element */}
            <div className="absolute top-1/3 right-0 translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-whatsapp flex items-center justify-center relative">
                <div className="w-12 h-12 bg-whatsapp rounded-l-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[8px] text-gray-500 rotate-[30deg]">SCROLL TO EXPLORE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 rounded-3xl p-8 relative">
            <div className="w-10 h-10 bg-whatsapp text-white rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Escala con nuestro manual</h3>
            <p className="text-gray-600">
              Accede a nuestras mejores prácticas y soporte para convertir rápidamente los SMS en uno de tus 3
              principales canales de ingresos.
            </p>
          </div>

          <div className="bg-whatsapp-dark text-white rounded-3xl p-8 relative">
            <div className="w-10 h-10 bg-white text-whatsapp-dark rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Automatiza conversaciones</h3>
            <p className="text-white/80">
              Configura flujos de trabajo inteligentes que responden a las acciones de los clientes y aumentan las
              conversiones.
            </p>
          </div>

          <div className="bg-whatsapp-light rounded-3xl p-8 relative">
            <div className="w-10 h-10 bg-whatsapp text-white rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Analiza resultados</h3>
            <p className="text-gray-700">
              Obtén insights detallados sobre el rendimiento de tus campañas y optimiza tus estrategias en tiempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center text-white">
                <span className="font-bold">M</span>
              </div>
              <div>
                <p className="font-bold">María Rodríguez</p>
                <p className="text-sm text-gray-500">Directora de Marketing, FashionCo</p>
              </div>
            </div>
            <p className="text-gray-700">
              "Desde que implementamos Gabbler, nuestras conversiones aumentaron un 32%. La capacidad de comunicarnos
              directamente con nuestros clientes ha transformado nuestra estrategia de ventas."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-whatsapp-light rounded-full flex items-center justify-center text-whatsapp-dark">
                <span className="font-bold">J</span>
              </div>
              <div>
                <p className="font-bold">Juan Méndez</p>
                <p className="text-sm text-gray-500">CEO, TechSolutions</p>
              </div>
            </div>
            <p className="text-gray-700">
              "La plataforma es increíblemente intuitiva y los resultados hablan por sí mismos. Hemos visto un ROI de
              300% en nuestras campañas de mensajería."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-whatsapp rounded-full flex items-center justify-center text-white">
                <span className="font-bold">C</span>
              </div>
              <div>
                <p className="font-bold">Carolina Vega</p>
                <p className="text-sm text-gray-500">Gerente de E-commerce, HomeStyle</p>
              </div>
            </div>
            <p className="text-gray-700">
              "Gabbler nos ha permitido recuperar carritos abandonados y aumentar nuestras ventas en un 25%. El soporte
              al cliente es excepcional y siempre están disponibles para ayudar."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-whatsapp-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Comienza a impulsar tus ventas hoy mismo</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a más de 120,000 empresas que ya están transformando sus conversaciones en ventas
          </p>
          <Button className="bg-whatsapp text-white hover:bg-whatsapp/90 text-lg px-8 py-6 rounded-md">
            Solicitar una Demo Gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-whatsapp rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">G</span>
                </div>
                <span className="font-bold text-xl">Gabbler</span>
              </div>
              <p className="text-gray-600">La plataforma de mensajería que transforma conversaciones en ventas.</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Integraciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Casos de uso
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Guías
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Centro de ayuda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-whatsapp">
                    Prensa
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2023 Gabbler. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-whatsapp">
                Términos
              </Link>
              <Link href="#" className="text-gray-600 hover:text-whatsapp">
                Privacidad
              </Link>
              <Link href="#" className="text-gray-600 hover:text-whatsapp">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
