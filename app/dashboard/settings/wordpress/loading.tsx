import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function WordPressLoading() {
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>

          <Skeleton className="h-20 w-full rounded-xl" />

          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />

              <div className="space-y-4 p-4 bg-white border rounded-xl">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>

                <Skeleton className="h-6 w-40 mt-4" />

                <Skeleton className="h-10 w-32 ml-auto mt-4" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
