"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HelpCircle,
  Mail,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Users,
} from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const faqs = [
    {
      question: "¿Cómo puedo empezar a usar las herramientas de AI?",
      answer: "Para comenzar, simplemente navega a cualquiera de nuestras herramientas desde el dashboard principal. Cada herramienta tiene una interfaz intuitiva con instrucciones paso a paso. Te recomendamos empezar con el Corrector de estilo o el Generador de hilos."
    },
    {
      question: "¿Qué tipos de contenido puedo analizar con el corrector de estilo?",
      answer: "El corrector de estilo puede analizar artículos periodísticos, noticias, reportajes, entrevistas y cualquier tipo de contenido editorial. Soporta múltiples formatos y se adapta a diferentes estilos editoriales según tus configuraciones."
    },
    {
      question: "¿Cómo funciona el generador de hilos para Twitter?",
      answer: "El generador de hilos toma tu artículo completo y lo divide automáticamente en tweets coherentes y atractivos. Puedes personalizar el tono, la longitud y el estilo de los hilos según tu audiencia objetivo."
    },
    {
      question: "¿Puedo integrar mis cuentas de WordPress?",
      answer: "Sí, puedes conectar múltiples sitios de WordPress para importar contenido directamente. Ve a Configuración > Integraciones para configurar tus conexiones de WordPress."
    },
    {
      question: "¿Hay límites en el uso de las herramientas?",
      answer: "Los límites dependen de tu plan de suscripción. El plan básico incluye un número determinado de análisis mensuales, mientras que los planes premium ofrecen uso ilimitado de todas las herramientas."
    },
    {
      question: "¿Cómo puedo personalizar las configuraciones editoriales?",
      answer: "Puedes personalizar las configuraciones editoriales en la sección de Configuración. Allí puedes definir tu manual de estilo, preferencias de tono, reglas específicas y criterios de calidad personalizados."
    },
    {
      question: "¿Los datos de mis artículos están seguros?",
      answer: "Absolutamente. Todos tus datos están encriptados y almacenados de forma segura. No compartimos tu contenido con terceros y puedes eliminar tus datos en cualquier momento desde la configuración de tu cuenta."
    },
    {
      question: "¿Puedo exportar los resultados de las herramientas?",
      answer: "Sí, puedes exportar los resultados en múltiples formatos incluyendo PDF, Word, y texto plano. También puedes copiar directamente el contenido optimizado para usar en tus plataformas."
    }
  ]

  const resources = [
    {
      icon: BookOpen,
      title: "Guías de usuario",
      description: "Tutoriales paso a paso para cada herramienta",
      link: "/documentacion"
    },
    {
      icon: Video,
      title: "Videos tutoriales",
      description: "Aprende visualmente cómo usar las herramientas",
      link: "#"
    },
    {
      icon: FileText,
      title: "Base de conocimientos",
      description: "Artículos detallados y mejores prácticas",
      link: "#"
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Conecta con otros periodistas y comparte experiencias",
      link: "#"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary-600" />
            Centro de ayuda
          </h1>
          <p className="text-gray-500">
            Encuentra respuestas a tus preguntas y obtén el soporte que necesitas
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Preguntas frecuentes</CardTitle>
          <CardDescription>
            Encuentra respuestas rápidas a las preguntas más comunes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form Section */}
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>¿No encuentras lo que buscas?</CardTitle>
          <CardDescription>
            Contáctanos directamente y te ayudaremos a resolver tu consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary-600" />
                <span className="font-medium">Contacto por email</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Envía tu consulta a: <span className="font-medium text-primary-600">labdeia@lasillavacia.com</span></p>
                <p>Te responderemos lo antes posible</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Tiempo promedio de respuesta: <span className="font-medium text-green-600">24 horas</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a href="mailto:labdeia@lasillavacia.com">
                <Button className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar consulta
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}