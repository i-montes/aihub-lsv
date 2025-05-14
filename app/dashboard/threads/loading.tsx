import { Skeleton } from "@/components/ui/skeleton"

export default function ThreadsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
