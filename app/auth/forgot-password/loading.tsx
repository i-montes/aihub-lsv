import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Skeleton className="h-4 w-3/4" />
        </CardFooter>
      </Card>
    </div>
  )
}
