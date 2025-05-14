import { Skeleton } from "@/components/ui/skeleton"

export default function WritingAssistantLoading() {
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Barra superior con título y acciones */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-1 border-b">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <Skeleton className="h-8 w-3/4 rounded mb-4" />
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-5/6 rounded mb-6" />

            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-4/5 rounded mb-6" />

            <Skeleton className="h-8 w-1/2 rounded mb-4" />
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>

        {/* Panel lateral de asistente */}
        <div className="w-80 border-l overflow-auto">
          <div className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 flex-1 rounded" />
              <Skeleton className="h-8 flex-1 rounded" />
              <Skeleton className="h-8 flex-1 rounded" />
            </div>
          </div>

          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full rounded mb-2" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
