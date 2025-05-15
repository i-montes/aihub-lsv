"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, FileText } from "lucide-react"

export default function PromptsPage() {
  // Estado para los prompts
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [testResult, setTestResult] = useState("")

  // Datos de ejemplo para las categorías
  const categories = [
    { id: "all", name: "Todos" },
    { id: "chatbot", name: "Chatbot" },
    { id: "email", name: "Correos" },
    { id: "social", name: "Redes Sociales" },
    { id: "support", name: "Soporte" },
    { id: "sales", name: "Ventas" },
  ]

  // Datos de ejemplo para los prompts
  const prompts = [
    {
      id: 1,
      title: "Bienvenida al chatbot",
      content: "Hola, soy el asistente virtual de [Nombre de la Empresa]. ¿En qué puedo ayudarte hoy?",
      category: "chatbot",
      variables: ["Nombre de la Empresa"],
      lastEdited: "Hace 2 días",
      status: "active",
    },
    {
      id: 2,
      title: "Respuesta a consulta de producto",
      content: "Gracias por tu interés en [Nombre del Producto]. Este producto ofrece [Características].",
      category: "chatbot",
      variables: ["Nombre del Producto", "Características"],
      lastEdited: "Hace 1 semana",
      status: "active",
    },
    {
      id: 3,
      title: "Plantilla de correo de bienvenida",
      content: "Estimado/a [Nombre del Cliente],\n\nBienvenido/a a [Nombre de la Empresa].",
      category: "email",
      variables: ["Nombre del Cliente", "Nombre de la Empresa"],
      lastEdited: "Hace 3 días",
      status: "active",
    },
  ]

  // Filtrar prompts según la búsqueda y categoría
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || prompt.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Prompts</h2>
            <Button className="bg-sidebar text-white hover:bg-sidebar/90" onClick={() => setIsNewPromptModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Nuevo Prompt
            </Button>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-9 bg-white"
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="flex overflow-x-auto py-1 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className={activeCategory === category.id ? "bg-sidebar text-white" : ""}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de prompts */}
          <div className="space-y-4">
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-500">No se encontraron prompts</h3>
                <p className="text-sm text-gray-400">Intenta con otra búsqueda o categoría</p>
              </div>
            ) : (
              filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-white border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          prompt.category === "chatbot"
                            ? "bg-sidebar"
                            : prompt.category === "email"
                              ? "bg-yellow"
                              : prompt.category === "social"
                                ? "bg-coral"
                                : prompt.category === "support"
                                  ? "bg-green-600"
                                  : "bg-accent"
                        }`}
                      >
                        <FileText size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium">{prompt.title}</h3>
                        <p className="text-xs text-gray-500">
                          {categories.find((c) => c.id === prompt.category)?.name} • Editado: {prompt.lastEdited}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Probar
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="bg-white border rounded-md p-3 whitespace-pre-line text-sm">{prompt.content}</div>
                    {prompt.variables.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {prompt.variables.map((variable, index) => (
                            <div key={index} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                              {variable}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal para crear nuevo prompt */}
          <Dialog open={isNewPromptModalOpen} onOpenChange={setIsNewPromptModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Prompt</DialogTitle>
                <DialogDescription>Añade un nuevo prompt a tu biblioteca.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newPromptTitle">Título</Label>
                  <Input id="newPromptTitle" placeholder="Título del prompt" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPromptCategory">Categoría</Label>
                  <select
                    id="newPromptCategory"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="chatbot"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPromptContent">Contenido</Label>
                  <Textarea
                    id="newPromptContent"
                    rows={6}
                    placeholder="Escribe el contenido del prompt aquí..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Usa [Variable] para definir variables que se reemplazarán al usar el prompt.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewPromptModalOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-sidebar text-white hover:bg-sidebar/90">Crear Prompt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal para probar prompt */}
          <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Vista previa del Prompt</DialogTitle>
                <DialogDescription>Así es como se verá el prompt con las variables reemplazadas.</DialogDescription>
              </DialogHeader>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="bg-white border rounded-md p-4 whitespace-pre-line">{testResult}</div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsTestModalOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
