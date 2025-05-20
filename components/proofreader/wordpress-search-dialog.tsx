"use client"

import { WordPressSearchDialog as SharedWordPressSearchDialog } from "@/components/shared/wordpress-search-dialog"
import type { WordPressSearchDialogProps } from "@/components/shared/wordpress-search-dialog"

// Re-exportamos el componente compartido con el mismo nombre para mantener compatibilidad
export function WordPressSearchDialog(props: WordPressSearchDialogProps) {
  return <SharedWordPressSearchDialog {...props} />
}
