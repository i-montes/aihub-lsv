"use client"

type HeaderProps = {}

export function ProofreaderHeader({}: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Corrector de textos
      </h1>
    </div>
  )
}
