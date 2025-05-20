"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ResponseFormat } from "@/components/tools/response-format"

interface ToolConfigProps {
  schema?: any
  onSchemaChange?: (schema: any) => void
  temperature?: number
  onTemperatureChange?: (temperature: number) => void
  topP?: number
  onTopPChange?: (topP: number) => void
}

/**
 * Configuration component for tool settings
 */
export function ToolConfig({
  schema,
  onSchemaChange,
  temperature = 0.7,
  onTemperatureChange,
  topP = 1,
  onTopPChange,
}: ToolConfigProps) {
  const [schemaText, setSchemaText] = useState<string>(
    schema
      ? JSON.stringify(schema, null, 2)
      : JSON.stringify(
          {
            type: "object",
            required: ["correcciones"],
            properties: {
              correcciones: {
                type: "array",
                items: {
                  type: "object",
                  required: ["original", "suggestion", "type", "explanation"],
                  properties: {
                    type: {
                      enum: ["spelling", "grammar", "style"],
                      type: "string",
                      description: "Tipo de error: spelling | grammar | style",
                    },
                    original: {
                      type: "string",
                      description: "Fragmento del texto original con error",
                    },
                    suggestion: {
                      type: "string",
                      description: "Corrección sugerida para el error",
                    },
                    explanation: {
                      type: "string",
                      description: "Explicación de la corrección",
                    },
                  },
                },
              },
            },
          },
          null,
          2,
        ),
  )

  const handleSchemaChange = (text: string) => {
    setSchemaText(text)
    try {
      const parsedSchema = JSON.parse(text)
      onSchemaChange && onSchemaChange(parsedSchema)
    } catch (e) {
      // Invalid JSON, don't update the schema
      console.error("Invalid JSON schema:", e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 mb-1 block">
          Temperatura: {temperature.toFixed(1)}
        </Label>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[temperature]}
          onValueChange={(values) => onTemperatureChange && onTemperatureChange(values[0])}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controla la aleatoriedad de las respuestas. Valores más bajos generan respuestas más predecibles.
        </p>
      </div>

      <div>
        <Label htmlFor="top-p" className="text-sm font-medium text-gray-700 mb-1 block">
          Top P: {topP.toFixed(1)}
        </Label>
        <Slider
          id="top-p"
          min={0}
          max={1}
          step={0.1}
          value={[topP]}
          onValueChange={(values) => onTopPChange && onTopPChange(values[0])}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controla la diversidad de las respuestas. Valores más bajos generan respuestas más enfocadas.
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">Formato de Respuesta</Label>
        <ResponseFormat />
      </div>

      {onSchemaChange && (
        <div>
          <Label htmlFor="schema" className="text-sm font-medium text-gray-700 mb-1 block">
            Esquema JSON
          </Label>
          <Textarea
            id="schema"
            value={schemaText}
            onChange={(e) => handleSchemaChange(e.target.value)}
            className="font-mono text-xs h-[200px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Define la estructura de la respuesta esperada en formato JSON Schema.
          </p>
        </div>
      )}
    </div>
  )
}
