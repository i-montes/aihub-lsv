import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generador de Hilos | AI Hub",
  description: "Genera hilos de Twitter a partir de tu contenido",
}

export default function ThreadGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
