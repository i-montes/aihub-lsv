"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ExportUsersButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportUsersToCSV = async (): Promise<void> => {
    setIsExporting(true)

    try {
      // Hacer la solicitud al endpoint de exportación
      const response = await fetch("/api/users/export")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al exportar usuarios")
      }

      // Obtener el blob del CSV
      const blob = await response.blob()

      // Crear URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un elemento de enlace para descargar
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      // Añadir al DOM, hacer clic y eliminar
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación completada",
        description: "Los usuarios se han exportado correctamente.",
      })
    } catch (error) {
      console.error("Error al exportar usuarios:", error)
      toast({
        title: "Error al exportar usuarios",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" className="flex items-center gap-2" onClick={exportUsersToCSV} disabled={isExporting}>
      {isExporting ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-sidebar"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <FileText size={16} />
      )}
      {isExporting ? "Exportando..." : "Exportar"}
    </Button>
  )
}
