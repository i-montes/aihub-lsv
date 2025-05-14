import { Suspense } from "react"
import { getOrganizationPrompts } from "@/lib/supabase/prompts"
import { PromptsList } from "./prompts-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default async function PromptsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prompts</h1>
        <Link href="/dashboard/settings/prompts/new">
          <Button className="bg-sidebar text-white hover:bg-sidebar/90">
            <Plus size={16} className="mr-2" />
            Nuevo Prompt
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Prompts</CardTitle>
          <CardDescription>Gestiona tus prompts y los que han sido compartidos contigo</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PromptsListSkeleton />}>
            <PromptsListContainer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function PromptsListContainer() {
  const prompts = await getOrganizationPrompts()
  return <PromptsList prompts={prompts} />
}

function PromptsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="h-24 w-full mt-4" />
        </div>
      ))}
    </div>
  )
}
