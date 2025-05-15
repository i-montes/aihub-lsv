import { getPromptById } from "@/lib/supabase/prompts"
import { PromptForm } from "../prompt-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { Layout } from "@/components/layout"

interface PromptEditPageProps {
  params: {
    id: string
  }
}

export default async function PromptEditPage({ params }: PromptEditPageProps) {
  // Si el ID es "new", estamos creando un nuevo prompt
  const isNewPrompt = params.id === "new"

  let prompt = null
  if (!isNewPrompt) {
    prompt = await getPromptById(params.id)
    if (!prompt) {
      notFound()
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">{isNewPrompt ? "Crear nuevo prompt" : "Editar prompt"}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{isNewPrompt ? "Nuevo prompt" : "Editar prompt"}</CardTitle>
            <CardDescription>
              {isNewPrompt ? "Crea un nuevo prompt para tu organización" : "Actualiza la información de este prompt"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromptForm prompt={prompt} isNew={isNewPrompt} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
