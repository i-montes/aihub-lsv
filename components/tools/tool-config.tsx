"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ResponseFormat } from "@/components/tools/response-format"

/**
 * Configuration component for tool settings
 */
export function ToolConfig() {
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)

  return (
    <div className="space-y-6">
      {/* AI Parameters */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium mb-3">Parámetros de IA</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperatura: {temperature}</Label>
              <span className="text-xs text-gray-500">Controla la aleatoriedad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">0</span>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <span className="text-xs">1</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="top-p">Top P: {topP}</Label>
              <span className="text-xs text-gray-500">Controla la diversidad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">0</span>
              <Slider
                id="top-p"
                min={0}
                max={1}
                step={0.1}
                value={[topP]}
                onValueChange={(value) => setTopP(value[0])}
              />
              <span className="text-xs">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Format */}
      <ResponseFormat />
    </div>
  )
}
