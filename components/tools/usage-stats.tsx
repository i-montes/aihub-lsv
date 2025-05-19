interface UsageStatsProps {
  usageCount: number
  rating?: number
}

/**
 * Component for displaying tool usage statistics
 */
export function UsageStats({ usageCount, rating = 4.8 }: UsageStatsProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium mb-3">Estadísticas de uso</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-gray-50 p-3 text-center">
          <div className="text-2xl font-bold text-sidebar">{usageCount}</div>
          <div className="text-xs text-gray-500">Usos totales</div>
        </div>
        <div className="rounded-md bg-gray-50 p-3 text-center">
          <div className="text-2xl font-bold text-sidebar">{rating}</div>
          <div className="text-xs text-gray-500">Valoración</div>
        </div>
      </div>
    </div>
  )
}
