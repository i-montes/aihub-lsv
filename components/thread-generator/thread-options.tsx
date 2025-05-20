"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

interface ThreadOptionsProps {
  tweetCount: number
  setTweetCount: (value: number) => void
  tone: string
  setTone: (value: string) => void
  includeHashtags: boolean
  setIncludeHashtags: (value: boolean) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function ThreadOptions({
  tweetCount,
  setTweetCount,
  tone,
  setTone,
  includeHashtags,
  setIncludeHashtags,
  onGenerate,
  isGenerating,
}: ThreadOptionsProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="tweet-count">Número de tweets</Label>
          <span className="text-sm font-medium">{tweetCount}</span>
        </div>
        <Slider
          id="tweet-count"
          min={2}
          max={10}
          step={1}
          value={[tweetCount]}
          onValueChange={(value) => setTweetCount(value[0])}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone">Tono del hilo</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger id="tone">
            <SelectValue placeholder="Selecciona un tono" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informative">Informativo</SelectItem>
            <SelectItem value="conversational">Conversacional</SelectItem>
            <SelectItem value="professional">Profesional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="humorous">Humorístico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="hashtags" className="cursor-pointer">
          Incluir hashtags
        </Label>
        <Switch id="hashtags" checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
      </div>

      <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? "Generando..." : "Generar hilo"}
      </Button>
    </div>
  )
}
