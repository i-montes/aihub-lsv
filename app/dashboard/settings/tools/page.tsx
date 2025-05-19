"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BookOpen, BarChart2, MessageSquare, CheckCircle } from "lucide-react"
import { Header } from "@/components/tools/header"
import { SearchBar } from "@/components/tools/search-bar"
import { EmptyState } from "@/components/tools/empty-state"
import { ToolCard } from "@/components/tools/tool-card"
import { ToolListItem } from "@/components/tools/tool-list-item"
import { CreateToolDialog } from "@/components/tools/create-tool-dialog"
import { EditToolDialog } from "@/components/tools/edit-tool-dialog"
import { DeleteToolDialog } from "@/components/tools/delete-tool-dialog"
import type { Tool } from "@/types/tool"

// Datos de ejemplo
const toolsData: Tool[] = [
  {
    id: 1,
    title: "Análisis de Noticias",
    description:
      "Analiza esta noticia y proporciona un resumen de los puntos clave, posibles sesgos y contexto histórico relevante.",
    tags: ["Análisis", "Noticias"],
    category: "analysis",
    favorite: true,
    usageCount: 28,
    lastUsed: "2 días atrás",
  },
  {
    id: 2,
    title: "Generador de Titulares",
    description:
      "Genera 5 titulares atractivos para este artículo, optimizados para SEO y engagement en redes sociales.",
    tags: ["Titulares", "SEO"],
    category: "headlines",
    favorite: false,
    usageCount: 15,
    lastUsed: "5 días atrás",
  },
  {
    id: 3,
    title: "Verificación de Hechos",
    description:
      "Verifica los hechos presentados en este artículo e identifica posibles afirmaciones que requieran más investigación.",
    tags: ["Fact-checking", "Investigación"],
    category: "factcheck",
    favorite: true,
    usageCount: 42,
    lastUsed: "Ayer",
  },
  {
    id: 4,
    title: "Resumen Ejecutivo",
    description: "Crea un resumen ejecutivo de 3 párrafos destacando los puntos más importantes de este informe.",
    tags: ["Resumen", "Ejecutivo"],
    category: "summary",
    favorite: false,
    usageCount: 8,
    lastUsed: "1 semana atrás",
  },
  {
    id: 5,
    title: "Análisis de Sentimiento",
    description:
      "Analiza el sentimiento general de este texto e identifica las emociones predominantes y su intensidad.",
    tags: ["Análisis", "Sentimiento"],
    category: "analysis",
    favorite: false,
    usageCount: 19,
    lastUsed: "3 días atrás",
  },
]

const categories: Category[] = [
  { id: "all", name: "Todas las Herramientas", icon: BookOpen, count: 5, color: "blue" },
  { id: "analysis", name: "Análisis", icon: BarChart2, count: 2, color: "blue" },
  { id: "headlines", name: "Titulares", icon: MessageSquare, count: 1, color: "purple" },
  { id: "factcheck", name: "Fact-checking", icon: CheckCircle, count: 1, color: "red" },
  { id: "summary", name: "Resumen", icon: FileText, count: 1, color: "green" },
]

const tagColors: Record<string, string> = {
  Análisis: "bg-blue-100 text-blue-800",
  Noticias: "bg-green-100 text-green-800",
  Titulares: "bg-purple-100 text-purple-800",
  SEO: "bg-yellow-100 text-yellow-800",
  "Fact-checking": "bg-red-100 text-red-800",
  Investigación: "bg-gray-100 text-gray-800",
  Resumen: "bg-green-100 text-green-800",
  Ejecutivo: "bg-indigo-100 text-indigo-800",
  Sentimiento: "bg-pink-100 text-pink-800",
}

/**
 * Main page component for tool settings
 */
export default function ToolsSettingsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  // Filter tools based on search and category
  const filteredTools = toolsData.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Handlers
  const handleEditClick = (tool: Tool) => {
    setSelectedTool(tool)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (tool: Tool) => {
    setSelectedTool(tool)
    setIsDeleteModalOpen(true)
  }

  const handleCreateTool = (data: any) => {
    console.log("Creating tool:", data)
    setIsCreateModalOpen(false)
  }

  const handleSaveTool = (tool: Tool) => {
    console.log("Saving tool:", tool)
    setIsEditModalOpen(false)
  }

  const handleDeleteTool = () => {
    console.log("Deleting tool:", selectedTool)
    setIsDeleteModalOpen(false)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || "blue"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Header
        title="Gestión de Herramientas"
        description="Crea y administra tus herramientas personalizadas para agilizar tu flujo de trabajo"
      />

      {/* Search and filters */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={["Más recientes", "Más usados", "Alfabético"]}
      />

      {/* Main content with tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {filteredTools.length} {filteredTools.length === 1 ? "Herramienta" : "Herramientas"}
            {selectedCategory !== "all" && (
              <span className="ml-1 text-gray-500">en {categories.find((c) => c.id === selectedCategory)?.name}</span>
            )}
          </h3>
          <TabsList>
            <TabsTrigger value="grid" className="gap-1.5">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-2 w-2 rounded-sm bg-current"></div>
                <div className="h-2 w-2 rounded-sm bg-current"></div>
                <div className="h-2 w-2 rounded-sm bg-current"></div>
                <div className="h-2 w-2 rounded-sm bg-current"></div>
              </div>
              <span className="sr-only sm:not-sr-only sm:ml-1">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-4 rounded-sm bg-current"></div>
                <div className="h-0.5 w-4 rounded-sm bg-current"></div>
                <div className="h-0.5 w-4 rounded-sm bg-current"></div>
              </div>
              <span className="sr-only sm:not-sr-only sm:ml-1">Lista</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Main content */}
          <div className="md:col-span-4">
            <TabsContent value="grid" className="mt-0">
              {filteredTools.length === 0 ? (
                <EmptyState
                  title="No se encontraron herramientas"
                  description="No hay herramientas que coincidan con tu búsqueda o filtros actuales."
                  buttonText="Limpiar filtros"
                  onButtonClick={handleClearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      tagColors={tagColors}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              {filteredTools.length === 0 ? (
                <EmptyState
                  title="No se encontraron herramientas"
                  description="No hay herramientas que coincidan con tu búsqueda o filtros actuales."
                  buttonText="Limpiar filtros"
                  onButtonClick={handleClearFilters}
                />
              ) : (
                <div className="space-y-3">
                  {filteredTools.map((tool) => (
                    <ToolListItem
                      key={tool.id}
                      tool={tool}
                      tagColors={tagColors}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Dialogs */}
      <CreateToolDialog isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSubmit={handleCreateTool} />

      <EditToolDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        tool={selectedTool}
        onSave={handleSaveTool}
      />

      <DeleteToolDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        tool={selectedTool}
        onConfirm={handleDeleteTool}
      />
    </div>
  )
}
