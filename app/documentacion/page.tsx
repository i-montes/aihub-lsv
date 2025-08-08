"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Plug,
  Wrench,
  Globe,
  Users,
  Building,
  User,
  Shield,
  FileCheck,
  MessageSquare,
  FileText,
  Mail,
  BookOpen,
  ArrowRight,
  Zap,
  Star,
  HelpCircle
} from "lucide-react"

export default function DocumentacionPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header de Bienvenida */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Documentación de KIT.AI</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Bienvenido a la documentación completa de KIT.AI. Aquí encontrarás toda la información necesaria 
          para aprovechar al máximo nuestras herramientas de IA para periodismo digital.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Comienza configurando las integraciones para usar todas las herramientas</span>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-6 w-6 text-primary-600" />
            Inicio Rápido
          </CardTitle>
          <CardDescription className="text-base">
            Sigue estos pasos para comenzar a usar KIT.AI de manera efectiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/documentacion/configuraciones/integraciones" className="group">
              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <span className="font-semibold group-hover:text-primary-600">Configurar Integraciones</span>
                </div>
                <p className="text-sm text-gray-600">Conecta OpenAI, Anthropic o Gemini</p>
              </div>
            </Link>
            <Link href="/documentacion/configuraciones/herramientas" className="group">
              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <span className="font-semibold group-hover:text-blue-600">Personalizar Herramientas</span>
                </div>
                <p className="text-sm text-gray-600">Ajusta prompts y configuraciones</p>
              </div>
            </Link>
            <Link href="/documentacion/herramientas/corrector" className="group">
              <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <span className="font-semibold group-hover:text-green-600">Comenzar a Usar</span>
                </div>
                <p className="text-sm text-gray-600">Prueba el corrector de textos</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Secciones de Documentación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuraciones */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="h-6 w-6" />
              Configuraciones
            </CardTitle>
            <CardDescription>
              Configura integraciones, herramientas y ajustes de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/documentacion/configuraciones/integraciones" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Plug className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium group-hover:text-green-600">Integraciones</p>
                  <p className="text-sm text-gray-600">OpenAI, Anthropic, Gemini</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
            </Link>

            <Link href="/documentacion/configuraciones/herramientas" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium group-hover:text-blue-600">Herramientas</p>
                  <p className="text-sm text-gray-600">Personalizar prompts y modelos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link href="/documentacion/configuraciones/wordpress" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-800" />
                <div>
                  <p className="font-medium group-hover:text-blue-800">WordPress</p>
                  <p className="text-sm text-gray-600">Integración con tu sitio web</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-800" />
            </Link>

            <Link href="/documentacion/configuraciones/usuarios" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium group-hover:text-purple-600">Lista de Usuarios</p>
                  <p className="text-sm text-gray-600">Gestión de usuarios y permisos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
            </Link>

            <Link href="/documentacion/configuraciones/organizacion" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium group-hover:text-gray-600">Organización</p>
                  <p className="text-sm text-gray-600">Información general de empresa</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>
          </CardContent>
        </Card>

        {/* Cuenta */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-6 w-6" />
              Cuenta
            </CardTitle>
            <CardDescription>
              Gestiona tu perfil personal y configuraciones de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/documentacion/cuenta/perfil" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium group-hover:text-blue-600">Perfil Personal</p>
                  <p className="text-sm text-gray-600">Información y preferencias</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link href="/documentacion/cuenta/seguridad" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium group-hover:text-green-600">Seguridad</p>
                  <p className="text-sm text-gray-600">Contraseñas, 2FA y sesiones</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
            </Link>
          </CardContent>
        </Card>

        {/* Herramientas */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-6 w-6" />
              Herramientas
            </CardTitle>
            <CardDescription>
              Aprende a usar cada herramienta de IA de manera efectiva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/documentacion/herramientas/corrector" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium group-hover:text-red-600">Corrector</p>
                  <p className="text-sm text-gray-600">Corrección y mejora de textos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
            </Link>

            <Link href="/documentacion/herramientas/hilos" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium group-hover:text-blue-600">Hilos</p>
                  <p className="text-sm text-gray-600">Generador de threads para Twitter</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link href="/documentacion/herramientas/resumenes" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium group-hover:text-yellow-600">Resúmenes</p>
                  <p className="text-sm text-gray-600">Síntesis de contenido extenso</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-600" />
            </Link>

            <Link href="/documentacion/herramientas/newsletter" className="group flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium group-hover:text-purple-600">Newsletter</p>
                  <p className="text-sm text-gray-600">Creador de newsletters</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
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
    </div>
  )
}