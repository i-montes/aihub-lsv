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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header de Bienvenida */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Documentación de KIT.AI</h1>
        </div>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
          Bienvenido a la documentación completa de KIT.AI. Aquí encontrarás toda la información necesaria 
          para aprovechar al máximo nuestras herramientas de IA para periodismo digital.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 sm:mt-6 px-2 sm:px-0">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          <span className="text-sm text-gray-600 text-center leading-relaxed">Comienza configurando las integraciones para usar todas las herramientas</span>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            Inicio Rápido
          </CardTitle>
          <CardDescription className="text-sm sm:text-base leading-relaxed">
            Sigue estos pasos para comenzar a usar KIT.AI de manera efectiva
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4">
            <Link href="/documentacion/configuraciones/integraciones" className="group">
              <div className="p-3 sm:p-4 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[80px] sm:min-h-[90px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span className="font-semibold group-hover:text-primary-600 text-sm sm:text-base leading-tight">Configurar Integraciones</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Conecta OpenAI, Anthropic o Gemini</p>
              </div>
            </Link>
            <Link href="/documentacion/configuraciones/herramientas" className="group">
              <div className="p-3 sm:p-4 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[80px] sm:min-h-[90px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span className="font-semibold group-hover:text-blue-600 text-sm sm:text-base leading-tight">Personalizar Herramientas</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Ajusta prompts y configuraciones</p>
              </div>
            </Link>
            <Link href="/documentacion/herramientas/corrector" className="group">
              <div className="p-3 sm:p-4 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[80px] sm:min-h-[90px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span className="font-semibold group-hover:text-green-600 text-sm sm:text-base leading-tight">Comenzar a Usar</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Prueba el corrector de textos</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Documentation Sections */}
      <div className="flex flex-col gap-4">
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
          <CardContent className="space-y-2 sm:space-y-3">
            <Link href="/documentacion/configuraciones/integraciones" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Plug className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-green-600 text-sm sm:text-base leading-tight">Integraciones</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">OpenAI, Anthropic, Gemini</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/configuraciones/herramientas" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-blue-600 text-sm sm:text-base leading-tight">Herramientas</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Personalizar prompts y modelos</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/configuraciones/wordpress" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-800 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-blue-800 text-sm sm:text-base leading-tight">WordPress</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Integración con tu sitio web</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-800 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/configuraciones/usuarios" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-purple-600 text-sm sm:text-base leading-tight">Lista de Usuarios</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Gestión de usuarios y permisos</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/configuraciones/organizacion" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-gray-600 text-sm sm:text-base leading-tight">Organización</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Información general de empresa</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
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
          <CardContent className="space-y-2 sm:space-y-3">
            <Link href="/documentacion/cuenta/perfil" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-blue-600 text-sm sm:text-base leading-tight">Perfil Personal</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Información y preferencias</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/cuenta/seguridad" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-green-600 text-sm sm:text-base leading-tight">Seguridad</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Contraseñas, 2FA y sesiones</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
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
          <CardContent className="space-y-2 sm:space-y-3">
            <Link href="/documentacion/herramientas/corrector" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-red-600 text-sm sm:text-base leading-tight">Corrector</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Corrección y mejora de textos</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-red-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/herramientas/hilos" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-blue-600 text-sm sm:text-base leading-tight">Hilos</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Generador de threads para Twitter</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/herramientas/resumenes" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-yellow-600 text-sm sm:text-base leading-tight">Resúmenes</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Síntesis de contenido extenso</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-yellow-600 flex-shrink-0" />
            </Link>

            <Link href="/documentacion/herramientas/newsletter" className="group flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:shadow-md transition-shadow min-h-[60px] sm:min-h-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-purple-600 text-sm sm:text-base leading-tight">Newsletter</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Creador de newsletters</p>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
            </Link>
          </CardContent>
        </Card></div>
      </div>
    </div>
  )
}