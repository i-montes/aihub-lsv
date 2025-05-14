"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPrompt, updatePrompt } from "@/lib/supabase/prompts"
import { useToast } from "@/components/ui/use-toast"

interface PromptFormProps {
  prompt?: any // Tipo del prompt
  isNew?: boolean
}

export function PromptForm({ prompt, isNew = false }: PromptFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: prompt?.title || "",
    description: prompt?.description || "",
    content: prompt?.content || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (isNew) {
        result = await createPrompt({
          ...formData,
          is_shareable: false,
          is_public: false,
        })
      } else {
        result = await updatePrompt(prompt.id, formData)
      }

      if (result.success) {
        toast({
          title: isNew ? "Prompt creado" : "Prompt actualizado",
          description: isNew ? "El prompt ha sido creado correctamente" : "El prompt ha sido actualizado correctamente",
        })
        router.push("/dashboard/settings/prompts")
      } else {
        toast({
          title: "Error",
          description: result.error || `Error al ${isNew ? "crear" : "actualizar"} el prompt`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(`Error al ${isNew ? "crear" : "actualizar"} prompt:`, err)
      toast({
        title: "Error",
        description: `Ocurrió un error al ${isNew ? "crear" : "actualizar"} el prompt`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Título del prompt"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Breve descripción del prompt"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          placeholder="Escribe aquí el contenido del prompt..."
          rows={10}
          className="font-mono"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/settings/prompts")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-sidebar text-white hover:bg-sidebar/90">
          {isLoading ? (isNew ? "Creando..." : "Actualizando...") : isNew ? "Crear prompt" : "Actualizar prompt"}
        </Button>
      </div>
    </form>
  )
}
