import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Post redes | AI Hub",
  description: "De una nota de La Silla a la pieza En Vivo para Facebook e Instagram",
}

export default function EnVivoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
