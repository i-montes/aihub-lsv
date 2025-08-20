import type React from "react"
export default function ProofreaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-full bg-background">{children}</div>
}
