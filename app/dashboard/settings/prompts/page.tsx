"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function PromptsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestión de Prompts</h2>
        <Button className="bg-sidebar text-white hover:bg-sidebar/90">Crear Prompt</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Prompts Guardados</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Análisis de Noticias</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Analiza esta noticia y proporciona un resumen de los puntos clave, posibles sesgos y contexto histórico
                relevante.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Análisis</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Noticias</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Generador de Titulares</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Genera 5 titulares atractivos para este artículo, optimizados para SEO y engagement en redes sociales.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Titulares</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">SEO</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Verificación de Hechos</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Verifica los hechos presentados en este artículo e identifica posibles afirmaciones que requieran más
                investigación.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fact-checking</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Investigación</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-medium">Categorías de Prompts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <p className="font-medium">Análisis</p>
              </div>
              <p className="text-sm text-gray-500">3 prompts</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <p className="font-medium">Titulares</p>
              </div>
              <p className="text-sm text-gray-500">2 prompts</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <p className="font-medium">Fact-checking</p>
              </div>
              <p className="text-sm text-gray-500">1 prompt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
