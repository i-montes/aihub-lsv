"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/**
 * Component for configuring the expected response format
 */
export function ResponseFormat() {
  const [useJsonSchema, setUseJsonSchema] = useState(true)
  const [jsonSchema, setJsonSchema] = useState(`{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Resumen conciso del contenido analizado"
    },
    "keyPoints": {
      "type": "array",
      "description": "Puntos clave identificados",
      "items": {
        "type": "string"
      }
    },
    "bias": {
      "type": "object",
      "description": "Análisis de posibles sesgos",
      "properties": {
        "detected": {
          "type": "boolean"
        },
        "explanation": {
          "type": "string"
        }
      }
    }
  },
  "required": ["summary", "keyPoints"]
}`)

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Formato de Respuesta</h4>
        <div className="flex items-center space-x-2">
          <Label htmlFor="use-json-schema" className="text-sm">
            Usar JSON Schema
          </Label>
          <Switch id="use-json-schema" checked={useJsonSchema} onCheckedChange={setUseJsonSchema} />
        </div>
      </div>

      {useJsonSchema && (
        <div className="space-y-2">
          <div className="rounded-md bg-gray-50 p-2 text-sm font-mono overflow-auto max-h-[300px]">
            <pre className="text-xs">{jsonSchema}</pre>
          </div>
          <div className="text-xs text-gray-500">
            Este esquema define la estructura esperada para la respuesta de la IA
          </div>
        </div>
      )}
    </div>
  )
}
