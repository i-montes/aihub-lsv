import { Sparkles } from "lucide-react"

interface HeaderProps {
  title: string
  description: string
}

/**
 * Header component for the tools page with gradient background
 */
export function Header({ title, description }: HeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar to-sidebar/80 p-6 text-white shadow-lg">
      <div className="absolute right-0 top-0 opacity-10">
        <Sparkles size={180} />
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-white/80">{description}</p>
        </div>
      </div>
    </div>
  )
}
