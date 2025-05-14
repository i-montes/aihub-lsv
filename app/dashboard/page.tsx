"use client"

import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquare,
  PenTool,
  Twitter,
  GripVertical,
  Info,
  Pencil,
  PlusCircle,
  Trash2,
  X,
  Link,
  Upload,
  Clock,
  CheckCircle,
  Video,
  Lightbulb,
  ChevronRight,
  Users,
  FileCheck,
} from "lucide-react"
import { FitnessLayout } from "@/components/fitness-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  return (
    <FitnessLayout>
      {/* Diálogo para añadir nuevo recurso */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Añadir nuevo recurso</h3>
              <button onClick={() => setIsDialogOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="resource-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del recurso
                </label>
                <input
                  type="text"
                  id="resource-name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Guía de estilo periodístico"
                />
              </div>

              <div>
                <label htmlFor="resource-type" className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de recurso
                </label>
                <select
                  id="resource-type"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="file">Archivo</option>
                  <option value="url">Enlace URL</option>
                  <option value="text">Texto</option>
                </select>
              </div>

              {/* Reemplazar la sección de botones de subida con esta zona de arrastre */}
              <div
                className={`mt-2 border-2 ${isDragging ? "border-slate-500 bg-slate-50" : "border-dashed border-slate-300"} rounded-lg p-6 transition-colors`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(false)

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0]
                    setUploadedFile(file)
                  }
                }}
              >
                {uploadedFile ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FileText size={24} className="text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Upload size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Arrastra y suelta tu archivo aquí</p>
                    <p className="text-xs text-slate-500 mt-1">o</p>
                    <label className="mt-2 inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-sm text-slate-700 cursor-pointer">
                      Seleccionar archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setUploadedFile(e.target.files[0])
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Campo para URL */}
              {document.getElementById("resource-type")?.value === "url" && (
                <div className="mt-4">
                  <label htmlFor="resource-url" className="block text-sm font-medium text-slate-700 mb-1">
                    URL del recurso
                  </label>
                  <div className="flex items-center">
                    <div className="mr-2 text-slate-400">
                      <Link size={16} />
                    </div>
                    <input
                      type="url"
                      id="resource-url"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="https://ejemplo.com/recurso"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="resource-description" className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  id="resource-description"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Breve descripción del recurso..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* Herramientas principales */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Herramientas principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
              <div className="h-2 bg-red-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-medium bg-red-50 text-red-500 px-2 py-1 rounded-full">Popular</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Corrector de Estilos</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Revisa y corrige tus textos según las normas de estilo periodístico.
                </p>
                <a
                  href="/dashboard/corrections"
                  className="text-red-500 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  Abrir herramienta
                  <ArrowRight size={16} />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
              <div className="h-2 bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <PenTool size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Asistente de Escritura</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Genera ideas, completa párrafos y mejora tu redacción periodística.
                </p>
                <a
                  href="/dashboard/writing-assistant"
                  className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  Abrir herramienta
                  <ArrowRight size={16} />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
              <div className="h-2 bg-purple-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                    <Twitter size={24} />
                  </div>
                  <span className="text-xs font-medium bg-purple-50 text-purple-500 px-2 py-1 rounded-full">Nuevo</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Generador de Hilos</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Convierte tus artículos en hilos atractivos para redes sociales.
                </p>
                <a
                  href="/dashboard/threads"
                  className="text-purple-500 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  Abrir herramienta
                  <ArrowRight size={16} />
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Actividad reciente y documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad reciente - Timeline */}
          <Card className="bg-white rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Actividad de la organización</CardTitle>
                <button className="text-sm text-slate-500 hover:text-slate-800">Ver todo</button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                <div className="space-y-8">
                  <div className="relative pl-12">
                    {/* Círculo del timeline */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center z-10 border-4 border-white">
                      <FileText size={16} className="text-red-500" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">Ana Martínez</span>
                        <span className="text-xs text-slate-500">• Hace 30 minutos</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        Corrigió el artículo{" "}
                        <span className="font-medium">"Análisis: Impacto económico de las nuevas políticas"</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                          Corrector de Estilos
                        </span>
                        <span className="text-xs text-slate-500">12 correcciones aplicadas</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-12">
                    {/* Círculo del timeline */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center z-10 border-4 border-white">
                      <Twitter size={16} className="text-purple-500" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">Carlos Rodríguez</span>
                        <span className="text-xs text-slate-500">• Hace 2 horas</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        Generó un hilo para{" "}
                        <span className="font-medium">"Resultados de las elecciones municipales"</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full">
                          Generador de Hilos
                        </span>
                        <span className="text-xs text-slate-500">8 tweets generados</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-12">
                    {/* Círculo del timeline */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center z-10 border-4 border-white">
                      <PenTool size={16} className="text-blue-500" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">Elena Gómez</span>
                        <span className="text-xs text-slate-500">• Ayer, 18:45</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        Utilizó el asistente para redactar{" "}
                        <span className="font-medium">"Entrevista: Ministro de Economía sobre inflación"</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                          Asistente de Escritura
                        </span>
                        <span className="text-xs text-slate-500">3 sugerencias aplicadas</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-12">
                    {/* Círculo del timeline */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center z-10 border-4 border-white">
                      <MessageSquare size={16} className="text-green-500" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">Miguel Sánchez</span>
                        <span className="text-xs text-slate-500">• Ayer, 10:20</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        Revisó comentarios en <span className="font-medium">"Artículo sobre cambio climático"</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-50 text-green-500 px-2 py-0.5 rounded-full">
                          Corrector de Estilos
                        </span>
                        <span className="text-xs text-slate-500">15 comentarios procesados</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-12">
                    {/* Círculo del timeline */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center z-10 border-4 border-white">
                      <Bot size={16} className="text-amber-500" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">Laura Torres</span>
                        <span className="text-xs text-slate-500">• Hace 2 días</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        Creó un nuevo prompt para <span className="font-medium">"Análisis de datos económicos"</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full">
                          Configuración de IA
                        </span>
                        <span className="text-xs text-slate-500">Prompt añadido a la biblioteca</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biblioteca de recursos */}
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Biblioteca de recursos</CardTitle>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                  aria-label="Añadir recurso"
                >
                  <PlusCircle size={16} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Recurso con opciones de edición */}
                <div className="group relative border border-dashed border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 cursor-move">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">Guía de estilo periodístico</p>
                      <p className="text-xs text-slate-500">PDF • Actualizado hace 2 días</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative border border-dashed border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 cursor-move">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">Plantillas para entrevistas</p>
                      <p className="text-xs text-slate-500">DOCX • Actualizado hace 1 semana</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative border border-dashed border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 cursor-move">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">Ejemplos de hilos virales</p>
                      <p className="text-xs text-slate-500">URL • Añadido hace 3 días</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative border border-dashed border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500 cursor-move">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">Glosario de términos económicos</p>
                      <p className="text-xs text-slate-500">XLSX • Actualizado hace 5 días</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative border border-dashed border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 cursor-move">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">Prompts efectivos para IA</p>
                      <p className="text-xs text-slate-500">TXT • Añadido hace 1 día</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1 rounded-md hover:bg-slate-200" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje de ayuda */}
              <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <Info size={14} />
                <span>
                  Arrastra los elementos para reordenarlos. Pasa el cursor sobre un recurso para editarlo o eliminarlo.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas de rendimiento */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Métricas de rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Métrica 1: Artículos corregidos */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                    <FileCheck size={20} />
                  </div>
                  <span className="text-xs font-medium bg-green-50 text-green-500 px-2 py-1 rounded-full">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">127</h3>
                <p className="text-sm text-slate-500">Artículos corregidos este mes</p>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Meta: 160</span>
                  <span>78% completado</span>
                </div>
              </CardContent>
            </Card>

            {/* Métrica 2: Hilos generados */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                    <Twitter size={20} />
                  </div>
                  <span className="text-xs font-medium bg-green-50 text-green-500 px-2 py-1 rounded-full">+24%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">83</h3>
                <p className="text-sm text-slate-500">Hilos generados este mes</p>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "92%" }}></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Meta: 90</span>
                  <span>92% completado</span>
                </div>
              </CardContent>
            </Card>

            {/* Métrica 3: Tiempo ahorrado */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                    <Clock size={20} />
                  </div>
                  <span className="text-xs font-medium bg-green-50 text-green-500 px-2 py-1 rounded-full">+18%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">42h</h3>
                <p className="text-sm text-slate-500">Tiempo ahorrado este mes</p>
                <div className="mt-4 flex items-end h-8">
                  <div className="w-1/5 h-3 bg-green-200 rounded-sm"></div>
                  <div className="w-1/5 h-4 bg-green-300 rounded-sm"></div>
                  <div className="w-1/5 h-5 bg-green-400 rounded-sm"></div>
                  <div className="w-1/5 h-6 bg-green-500 rounded-sm"></div>
                  <div className="w-1/5 h-8 bg-green-600 rounded-sm"></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Semana 1</span>
                  <span>Semana 5</span>
                </div>
              </CardContent>
            </Card>

            {/* Métrica 4: Usuarios activos */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-medium bg-green-50 text-green-500 px-2 py-1 rounded-full">+8%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">24</h3>
                <p className="text-sm text-slate-500">Usuarios activos diarios</p>
                <div className="mt-4 flex items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                    AM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                    LT
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                    CR
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs">
                    +20
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de tendencias */}
          <div className="mt-6">
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tendencias de uso</CardTitle>
                    <CardDescription>Uso de herramientas en los últimos 30 días</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-slate-500">Corrector</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-slate-500">Asistente</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-slate-500">Hilos</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 flex items-end">
                  {/* Simulación de gráfico de líneas */}
                  <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                    {/* Línea de cuadrícula */}
                    <line x1="0" y1="0" x2="800" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="800" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="225" x2="800" y2="225" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="300" x2="800" y2="300" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Línea de tendencia 1 - Corrector */}
                    <path
                      d="M0,250 C50,230 100,240 150,200 C200,160 250,150 300,140 C350,130 400,120 450,100 C500,80 550,90 600,70 C650,50 700,60 800,30"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                    />

                    {/* Línea de tendencia 2 - Asistente */}
                    <path
                      d="M0,280 C50,270 100,260 150,250 C200,240 250,220 300,210 C350,200 400,180 450,170 C500,160 550,140 600,130 C650,120 700,100 800,90"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                    />

                    {/* Línea de tendencia 3 - Hilos */}
                    <path
                      d="M0,290 C50,285 100,280 150,275 C200,270 250,260 300,250 C350,240 400,220 450,200 C500,180 550,150 600,130 C650,110 700,80 800,50"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>1 Mayo</span>
                  <span>15 Mayo</span>
                  <span>30 Mayo</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Centro de aprendizaje */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Centro de aprendizaje</h2>

          {/* Cursos destacados */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-700 mb-3">Cursos destacados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Curso 1 */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
                <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={48} className="text-white opacity-80" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium bg-blue-50 text-blue-500 px-2 py-1 rounded-full">Básico</span>
                    <span className="text-xs text-slate-500">4 lecciones</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Introducción al periodismo de datos</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aprende a utilizar datos para crear historias impactantes y visualizaciones efectivas.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        <CheckCircle size={12} />
                      </div>
                      <span className="text-xs text-slate-500">2/4 completadas</span>
                    </div>
                    <a href="#" className="text-blue-500 text-sm font-medium hover:underline">
                      Continuar
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Curso 2 */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
                <div className="h-40 bg-gradient-to-r from-purple-500 to-purple-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={48} className="text-white opacity-80" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium bg-purple-50 text-purple-500 px-2 py-1 rounded-full">
                      Intermedio
                    </span>
                    <span className="text-xs text-slate-500">6 lecciones</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Estrategias para redes sociales</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Domina las técnicas para crear contenido viral y aumentar tu audiencia en redes.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                        <CheckCircle size={12} />
                      </div>
                      <span className="text-xs text-slate-500">0/6 completadas</span>
                    </div>
                    <a href="#" className="text-purple-500 text-sm font-medium hover:underline">
                      Comenzar
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Curso 3 */}
              <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-none">
                <div className="h-40 bg-gradient-to-r from-amber-500 to-amber-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={48} className="text-white opacity-80" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium bg-amber-50 text-amber-500 px-2 py-1 rounded-full">
                      Avanzado
                    </span>
                    <span className="text-xs text-slate-500">5 lecciones</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">IA para periodistas</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aprende a utilizar la inteligencia artificial para potenciar tu trabajo periodístico.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                        <CheckCircle size={12} />
                      </div>
                      <span className="text-xs text-slate-500">1/5 completadas</span>
                    </div>
                    <a href="#" className="text-amber-500 text-sm font-medium hover:underline">
                      Continuar
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recursos y tutoriales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tutoriales rápidos */}
            <Card className="bg-white rounded-2xl shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Tutoriales rápidos</CardTitle>
                <CardDescription>Aprende nuevas habilidades en menos de 10 minutos</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1">Cómo usar el corrector de estilos</h4>
                      <p className="text-sm text-slate-500 mb-2">
                        Aprende a sacar el máximo provecho de esta herramienta para mejorar tus textos.
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">5 min</span>
                        <a
                          href="#"
                          className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                        >
                          Ver tutorial
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1">Técnicas avanzadas de redacción asistida</h4>
                      <p className="text-sm text-slate-500 mb-2">
                        Descubre cómo utilizar prompts efectivos para generar mejores resultados.
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">8 min</span>
                        <a
                          href="#"
                          className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1"
                        >
                          Ver tutorial
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1">Creando hilos virales paso a paso</h4>
                      <p className="text-sm text-slate-500 mb-2">
                        Estrategias para convertir tus artículos en hilos atractivos para redes sociales.
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">7 min</span>
                        <a
                          href="#"
                          className="text-xs text-purple-500 font-medium hover:underline flex items-center gap-1"
                        >
                          Ver tutorial
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500 shrink-0">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1">Optimizando tu flujo de trabajo</h4>
                      <p className="text-sm text-slate-500 mb-2">
                        Consejos para integrar todas las herramientas en tu rutina diaria de trabajo.
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">6 min</span>
                        <a
                          href="#"
                          className="text-xs text-green-500 font-medium hover:underline flex items-center gap-1"
                        >
                          Ver tutorial
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline de actualizaciones */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Actualizaciones de la plataforma</CardTitle>
                <CardDescription>Nuevas funciones y correcciones</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                  <div className="space-y-4">
                    <div className="relative pl-10">
                      {/* Círculo del timeline */}
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center z-10 border-2 border-white">
                        <PlusCircle size={16} className="text-green-500" />
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">Nueva funcionalidad</span>
                          <span className="text-xs text-slate-500">• v2.4.0 • 1 Jun 2023</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1">Generador de hilos para múltiples redes</p>
                        <p className="text-xs text-slate-500">
                          Ahora puedes generar hilos para Twitter, LinkedIn e Instagram con adaptaciones específicas
                          para cada plataforma.
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center z-10 border-2 border-white">
                        <ArrowRight size={16} className="text-blue-500" />
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">Mejora</span>
                          <span className="text-xs text-slate-500">• v2.3.5 • 28 May 2023</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1">Rendimiento del corrector de estilos</p>
                        <p className="text-xs text-slate-500">
                          Optimizaciones que mejoran la velocidad de procesamiento en un 40% para documentos extensos.
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center z-10 border-2 border-white">
                        <FileCheck size={16} className="text-red-500" />
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">Corrección</span>
                          <span className="text-xs text-slate-500">• v2.3.4 • 25 May 2023</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1">Error en exportación PDF</p>
                        <p className="text-xs text-slate-500">
                          Solucionado un problema que causaba la pérdida de formato en tablas al exportar a PDF.
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center z-10 border-2 border-white">
                        <Bot size={16} className="text-amber-500" />
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">IA Mejorada</span>
                          <span className="text-xs text-slate-500">• v2.3.0 • 20 May 2023</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1">Nuevo modelo lingüístico</p>
                        <p className="text-xs text-slate-500">
                          Actualización del modelo de IA para mejorar la precisión en la generación de resúmenes y
                          titulares.
                        </p>
                      </div>
                    </div>

                    <a
                      href="/changelog"
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 mt-2 py-2"
                    >
                      Ver historial completo
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </FitnessLayout>
  )
}
