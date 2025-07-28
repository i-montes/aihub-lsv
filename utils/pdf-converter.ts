"use client"

import { useState, useEffect } from "react"
import { loadPdfJs } from "@/lib/load-pdfjs"

interface PdfToImagesProps {
  pdfFile: File
  onImagesExtracted: (images: string[]) => void
  onError: (error: string) => void
}

export function PdfToImages({ pdfFile, onImagesExtracted, onError }: PdfToImagesProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Preparando...")

  useEffect(() => {
    if (pdfFile) {
      convertPdfToImages()
    }
  }, [pdfFile])

  const convertPdfToImages = async () => {
    setIsProcessing(true)
    setProgress(0)
    setStatus("Cargando PDF.js...")

    try {
      // Cargar PDF.js dinámicamente
      const pdfjsLib = await loadPdfJs()

      setStatus("Leyendo el archivo PDF...")
      setProgress(10)

      // Leer el archivo como ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer()

      // Cargar el documento PDF
      setStatus("Procesando el documento...")
      setProgress(20)
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      // Extraer cada página como imagen
      const images: string[] = []
      const totalPages = pdf.numPages
      console.log(`PDF tiene ${totalPages} páginas en total`)

      for (let i = 1; i <= totalPages; i++) {
        setStatus(`Extrayendo página ${i}/${totalPages}...`)
        setProgress(20 + (i / totalPages) * 70)
        console.log(`Procesando página ${i}/${totalPages}`)

        try {
          // Obtener la página
          const page = await pdf.getPage(i)

          // Configurar el canvas para renderizar la página
          const viewport = page.getViewport({ scale: 1.5 }) // Escala para mejor calidad
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")

          if (!context) {
            throw new Error("No se pudo crear el contexto del canvas")
          }

          canvas.height = viewport.height
          canvas.width = viewport.width

          // Establecer fondo blanco
          context.fillStyle = "white"
          context.fillRect(0, 0, canvas.width, canvas.height)

          // Renderizar la página en el canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          // Convertir el canvas a imagen base64 con calidad ajustada para PDFs grandes
          const quality = totalPages > 20 ? 0.7 : 0.8 // Reducir calidad para PDFs grandes
          const imageData = canvas.toDataURL("image/jpeg", quality)
          images.push(imageData)
          console.log(`Página ${i} extraída correctamente`)
        } catch (pageError) {
          console.error(`Error al procesar la página ${i}:`, pageError)
          // Continuar con las siguientes páginas en caso de error
        }
      }

      console.log(`Extracción completada. Total de imágenes: ${images.length}/${totalPages}`)

      // Verificar si se procesaron todas las páginas
      if (images.length < totalPages) {
        console.warn(`Advertencia: Solo se procesaron ${images.length} de ${totalPages} páginas`)
        setStatus(`Procesamiento completado (${images.length}/${totalPages} páginas)`)
      } else {
        setStatus(`Procesamiento completado (${totalPages} páginas)`)
      }

      setProgress(100)

      // Devolver las imágenes
      onImagesExtracted(images)
    } catch (error) {
      console.error("Error al convertir PDF a imágenes:", error)
      onError(`Error al procesar el PDF: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white">
      <h3 className="font-medium text-black">Procesamiento del PDF</h3>
      <p className="text-sm text-gray-700">Convirtiendo PDF a imágenes para análisis...</p>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-black">{status}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-700">
          Este proceso puede tardar varios minutos dependiendo del tamaño del archivo.
        </p>
      </div>
    </div>
  )
}