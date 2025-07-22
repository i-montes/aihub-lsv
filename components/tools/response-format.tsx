"use client"

import { Badge } from "@/components/ui/badge"

/**
 * Component for displaying the expected response format
 */
export function ResponseFormat({ jsonSchema }: { jsonSchema: any }) {

  // Function to render JSON with syntax highlighting
  const renderJsonWithHighlighting = (obj: any, indent = 0) => {
    return Object.entries(obj).map(([key, value], index) => {
      const isLast = index === Object.entries(obj).length - 1
      const padding = "  ".repeat(indent)

      if (key === "enum") {
        return (
          <div key={`${key}-${index}`} style={{ paddingLeft: indent * 8 }}>
            <span className="text-purple-600">"{key}"</span>
            <span className="text-gray-600">: </span>
            <span className="text-blue-600">[</span>
            {(value as string[]).map((item, i) => (
              <span key={i}>
                <span className="text-green-600">"{item}"</span>
                {i < (value as string[]).length - 1 && <span className="text-gray-600">, </span>}
              </span>
            ))}
            <span className="text-blue-600">]</span>
            {!isLast && <span className="text-gray-600">,</span>}
          </div>
        )
      }

      if (typeof value === "object" && value !== null) {
        return (
          <div key={`${key}-${index}`}>
            <div style={{ paddingLeft: indent * 8 }}>
              <span className="text-purple-600">"{key}"</span>
              <span className="text-gray-600">: </span>
              <span className="text-blue-600">{Array.isArray(value) ? "[" : "{"}</span>
            </div>
            {renderJsonWithHighlighting(value, indent + 1)}
            <div style={{ paddingLeft: indent * 8 }}>
              <span className="text-blue-600">{Array.isArray(value) ? "]" : "}"}</span>
              {!isLast && <span className="text-gray-600">,</span>}
            </div>
          </div>
        )
      }

      return (
        <div key={`${key}-${index}`} style={{ paddingLeft: indent * 8 }}>
          <span className="text-purple-600">"{key}"</span>
          <span className="text-gray-600">: </span>
          {typeof value === "string" ? (
            <>
              <span className="text-green-600">"{value}"</span>
              {!isLast && <span className="text-gray-600">,</span>}
            </>
          ) : (
            <>
              <span className="text-amber-600">{String(value)}</span>
              {!isLast && <span className="text-gray-600">,</span>}
            </>
          )}
        </div>
      )
    })
  }

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-800">Formato de Respuesta</h4>
          <Badge variant="outline" className="bg-white text-xs font-normal">
            Solo lectura
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            JSON Schema
          </Badge>
        </div>
      </div>

      <div className="overflow-auto max-h-[400px] bg-white bg-opacity-70">
        <div className="space-y-4">
          {/* Root object */}
          <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="font-medium text-slate-800">Objeto Principal</span>
            </div>

            {/* Correcciones array */}
            <div className="ml-4 mt-3 border-l-2 border-blue-200 pl-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="font-medium text-slate-800">correcciones</span>
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">requerido</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">array</span>
              </div>

              {/* Array items */}
              <div className="ml-4 mt-3 border-l-2 border-purple-200 pl-4">
                <div className="border border-slate-200 rounded-md p-3 bg-white">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium text-slate-800">Objeto de Corrección</span>
                  </div>

                  {/* Properties of correction object */}
                  <div className="ml-4 mt-3 space-y-3">
                    {/* Type property */}
                    <div className="border border-slate-200 rounded-md p-3 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">type</span>
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                          requerido
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Tipo de error</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-md">spelling</span>
                        <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-md">grammar</span>
                        <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-md">style</span>
                      </div>
                    </div>

                    {/* Original property */}
                    <div className="border border-slate-200 rounded-md p-3 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">original</span>
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                          requerido
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Fragmento del texto original con error</div>
                      <div className="mt-2 text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md inline-block">
                        string
                      </div>
                    </div>

                    {/* Suggestion property */}
                    <div className="border border-slate-200 rounded-md p-3 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">suggestion</span>
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                          requerido
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Corrección sugerida para el error</div>
                      <div className="mt-2 text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md inline-block">
                        string
                      </div>
                    </div>

                    {/* Explanation property */}
                    <div className="border border-slate-200 rounded-md p-3 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">explanation</span>
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                          requerido
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">Explicación de la corrección</div>
                      <div className="mt-2 text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md inline-block">
                        string
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          Este esquema define la estructura esperada para la respuesta de la IA. Los campos marcados como "required" son
          obligatorios.
        </p>
      </div>
    </div>
  )
}
