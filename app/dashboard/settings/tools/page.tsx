"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Header } from "@/components/tools/header"
import { SearchBar } from "@/components/tools/search-bar"
import { EmptyState } from "@/components/tools/empty-state"
import { ToolCard } from "@/components/tools/tool-card"
import { ToolListItem } from "@/components/tools/tool-list-item"
import { CreateToolDialog } from "@/components/tools/create-tool-dialog"
import { EditToolDialog } from "@/components/tools/edit-tool-dialog"
import { DeleteToolDialog } from "@/components/tools/delete-tool-dialog"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Tool } from "@/types/tool"

// Define tag colors for consistent styling
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch tools data on component mount
  useEffect(() => {
    fetchTools()
  }, [])

  // Function to fetch tools from both tables
  const fetchTools = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Get the current user's organization ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error("Error al obtener la sesión: " + sessionError.message)
      }

      if (!session?.user) {
        throw new Error("Usuario no autenticado")
      }

      // Get user profile to get organization ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        throw new Error("Error al obtener el perfil: " + profileError.message)
      }

      const organizationId = profileData.organizationId

      if (!organizationId) {
        throw new Error("Usuario no pertenece a una organización")
      }

      // Fetch custom tools for this organization
      const { data: customTools, error: customToolsError } = await supabase
        .from("tools")
        .select("*")
        .eq("organization_id", organizationId)

      if (customToolsError) {
        throw new Error("Error al obtener herramientas personalizadas: " + customToolsError.message)
      }

      // Fetch default tools
      const { data: defaultTools, error: defaultToolsError } = await supabase.from("default_tools").select("*")

      if (defaultToolsError) {
        throw new Error("Error al obtener herramientas predeterminadas: " + defaultToolsError.message)
      }

      // Process and merge tools
      const processedTools: Tool[] = []

      // If we have custom tools, use them
      if (customTools && customTools.length > 0) {
        customTools.forEach((tool) => {
          // Extract tags from the tool's schema if available
          let tags: string[] = []
          try {
            if (tool.schema && typeof tool.schema === "object") {
              // Extract tags based on schema properties or other logic
              tags = Object.keys(tool.schema).slice(0, 3)
            }
          } catch (e) {
            console.error("Error extracting tags from schema:", e)
          }

          processedTools.push({
            id: tool.id,
            title: tool.title,
            description:
              Array.isArray(tool.prompts) && tool.prompts.length > 0
                ? tool.prompts[0].toString()
                : typeof tool.prompts === "object" && tool.prompts !== null
                  ? JSON.stringify(tool.prompts)
                  : "Sin descripción",
            tags: tags,
            favorite: false,
            usageCount: tool.usage || 0,
            lastUsed: tool.updated_at ? new Date(tool.updated_at).toLocaleDateString() : "Nunca",
            isDefault: false,
            identity: tool.identity,
            schema: tool.schema,
            prompts: tool.prompts,
            temperature: tool.temperature || 0.7,
            topP: tool.top_p || 1,
          })
        })
      } else {
        // If no custom tools, use default tools
        defaultTools.forEach((tool) => {
          // Extract tags from the tool's schema if available
          let tags: string[] = []
          try {
            if (tool.schema && typeof tool.schema === "object") {
              // Extract tags based on schema properties or other logic
              tags = Object.keys(tool.schema).slice(0, 3)
            }
          } catch (e) {
            console.error("Error extracting tags from schema:", e)
          }

          processedTools.push({
            id: tool.id,
            title: tool.title,
            description:
              Array.isArray(tool.prompts) && tool.prompts.length > 0
                ? tool.prompts[0].toString()
                : typeof tool.prompts === "object" && tool.prompts !== null
                  ? JSON.stringify(tool.prompts)
                  : "Sin descripción",
            tags: tags,
            favorite: false,
            usageCount: tool.usage || 0,
            lastUsed: tool.updated_at ? new Date(tool.updated_at).toLocaleDateString() : "Nunca",
            isDefault: true,
            identity: tool.identity,
            schema: tool.schema,
            prompts: tool.prompts,
            temperature: tool.temperature || 0.7,
            topP: tool.top_p || 1,
          })
        })
      }

      setTools(processedTools)
    } catch (err) {
      console.error("Error fetching tools:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar herramientas")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al cargar herramientas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter tools based on search
  const filteredTools = tools.filter((tool) => {
    return (
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
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

  const handleCreateTool = async (data: any) => {
    try {
      const supabase = getSupabaseClient()

      // Get the current user's organization ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error("Error al obtener la sesión: " + sessionError.message)
      }

      if (!session?.user) {
        throw new Error("Usuario no autenticado")
      }

      // Get user profile to get organization ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        throw new Error("Error al obtener el perfil: " + profileError.message)
      }

      const organizationId = profileData.organizationId

      if (!organizationId) {
        throw new Error("Usuario no pertenece a una organización")
      }

      // Generate a unique identity based on title
      const identity = `custom.${data.title.toLowerCase().replace(/\s+/g, "-")}`

      // Insert new tool
      const { data: newTool, error: insertError } = await supabase
        .from("tools")
        .insert({
          title: data.title,
          prompts: data.description,
          schema: data.schema || {},
          identity: identity,
          organization_id: organizationId,
          temperature: data.temperature || 0.7,
          top_p: data.topP || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage: 0,
        })
        .select()

      if (insertError) {
        throw new Error("Error al crear la herramienta: " + insertError.message)
      }

      toast({
        title: "Herramienta creada",
        description: "La herramienta se ha creado correctamente",
      })

      // Refresh tools list
      fetchTools()
    } catch (err) {
      console.error("Error creating tool:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al crear la herramienta",
        variant: "destructive",
      })
    }

    setIsCreateModalOpen(false)
  }

  const handleSaveTool = async (tool: Tool) => {
    try {
      const supabase = getSupabaseClient()

      // Get the current user's organization ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error("Error al obtener la sesión: " + sessionError.message)
      }

      if (!session?.user) {
        throw new Error("Usuario no autenticado")
      }

      // Get user profile to get organization ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        throw new Error("Error al obtener el perfil: " + profileError.message)
      }

      const organizationId = profileData.organizationId

      if (!organizationId) {
        throw new Error("Usuario no pertenece a una organización")
      }

      // If it's a default tool, create a new custom tool based on it
      if (tool.isDefault) {
        // Insert new tool based on the default one
        const { data: newTool, error: insertError } = await supabase
          .from("tools")
          .insert({
            title: tool.title,
            prompts: tool.prompts,
            schema: tool.schema,
            identity: tool.identity,
            organization_id: organizationId,
            temperature: tool.temperature,
            top_p: tool.topP,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            usage: 0,
          })
          .select()

        if (insertError) {
          throw new Error("Error al personalizar la herramienta predeterminada: " + insertError.message)
        }

        toast({
          title: "Herramienta personalizada",
          description: "La herramienta predeterminada se ha personalizado correctamente",
        })
      } else {
        // Update existing custom tool
        const { error: updateError } = await supabase
          .from("tools")
          .update({
            title: tool.title,
            prompts: tool.prompts,
            schema: tool.schema,
            temperature: tool.temperature,
            top_p: tool.topP,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tool.id)

        if (updateError) {
          throw new Error("Error al actualizar la herramienta: " + updateError.message)
        }

        toast({
          title: "Herramienta actualizada",
          description: "La herramienta se ha actualizado correctamente",
        })
      }

      // Refresh tools list
      fetchTools()
    } catch (err) {
      console.error("Error saving tool:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al guardar la herramienta",
        variant: "destructive",
      })
    }

    setIsEditModalOpen(false)
  }

  const handleDeleteTool = async () => {
    if (!selectedTool) return

    try {
      const supabase = getSupabaseClient()

      // Can only delete custom tools, not default ones
      if (!selectedTool.isDefault) {
        const { error: deleteError } = await supabase.from("tools").delete().eq("id", selectedTool.id)

        if (deleteError) {
          throw new Error("Error al eliminar la herramienta: " + deleteError.message)
        }

        toast({
          title: "Herramienta eliminada",
          description: "La herramienta se ha eliminado correctamente",
        })

        // Refresh tools list
        fetchTools()
      } else {
        toast({
          title: "Operación no permitida",
          description: "No se pueden eliminar herramientas predeterminadas",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting tool:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al eliminar la herramienta",
        variant: "destructive",
      })
    }

    setIsDeleteModalOpen(false)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
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
        onCreateNew={() => setIsCreateModalOpen(true)}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error al cargar herramientas</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        /* Main content with tabs */
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {filteredTools.length} {filteredTools.length === 1 ? "Herramienta" : "Herramientas"}
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

          {/* Main content */}
          <div>
            <TabsContent value="grid" className="mt-0">
              {filteredTools.length === 0 ? (
                <EmptyState
                  title="No se encontraron herramientas"
                  description="No hay herramientas que coincidan con tu búsqueda."
                  buttonText="Limpiar filtros"
                  onButtonClick={handleClearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      tagColors={tagColors}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              {filteredTools.length === 0 ? (
                <EmptyState
                  title="No se encontraron herramientas"
                  description="No hay herramientas que coincidan con tu búsqueda."
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
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      )}

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
