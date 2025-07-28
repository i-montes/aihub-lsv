// Esta función se encarga de cargar PDF.js dinámicamente
export async function loadPdfJs() {
  // Verificar si ya está cargado
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib
  }

  // Cargar el script de PDF.js
  const pdfjsScript = document.createElement("script")
  pdfjsScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
  pdfjsScript.async = true

  // Esperar a que se cargue el script
  await new Promise<void>((resolve, reject) => {
    pdfjsScript.onload = () => resolve()
    pdfjsScript.onerror = () => reject(new Error("No se pudo cargar PDF.js"))
    document.head.appendChild(pdfjsScript)
  })

  // Configurar el worker
  const pdfjsLib = (window as any).pdfjsLib
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"

  return pdfjsLib
}