"use client"

type HeaderProps = {}

export function ProofreaderHeader({}: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
        Corrector de textos
      </h1>
    </div>
  )
}
