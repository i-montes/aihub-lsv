"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  onButtonClick: () => void
}

/**
 * Empty state component shown when no tools are found
 */
export function EmptyState({ title, description, buttonText, onButtonClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <Button onClick={onButtonClick} variant="outline" className="mt-4">
        {buttonText}
      </Button>
    </div>
  )
}
