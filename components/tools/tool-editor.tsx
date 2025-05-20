"use client"
import { Textarea } from "@/components/ui/textarea"

interface ToolEditorProps {
  promptText: string
  onPromptChange: (text: string) => void
  title?: string
  onTitleChange?: (title: string) => void
  lastEdited: string
}

/**
 * Editor component for tool prompts
 */
export function ToolEditor({ promptText, onPromptChange, lastEdited }: ToolEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <Textarea
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Escribe tu prompt aquí..."
        className="flex-1 resize-none font-mono text-sm"
      />
    </div>
  )
}
