import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, User, Building, FileText, Activity } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Row Level Security Demo</h1>
          <p className="text-gray-500">
            This dashboard demonstrates how Supabase Row Level Security (RLS) policies control access to your data.
            Navigate through the different sections to see how RLS policies affect what data you can view and modify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                <span>Row Level Security</span>
              </CardTitle>
              <CardDescription>Understanding how RLS protects your data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Row Level Security (RLS) in Supabase allows you to control which rows in a table users can access. This
                ensures users can only see and modify data they're authorized to access.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                    <span className="text-primary-600 text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Users can only access their own profile data</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                    <span className="text-primary-600 text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Organization members can view data within their organization</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                    <span className="text-primary-600 text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Admins and owners have additional privileges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                <span>Demo Features</span>
              </CardTitle>
              <CardDescription>Explore the different sections of this demo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Profile Management</span>
                  </div>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Organization Management</span>
                  </div>
                  <Link href="/dashboard/organization">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Content Management</span>
                  </div>
                  <Link href="/dashboard/content">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Activity Log</span>
                  </div>
                  <Link href="/dashboard/activity">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-primary-800 mb-2">How to Test RLS Policies</h3>
            <p className="text-primary-700 mb-4">To fully experience how RLS works, try the following:</p>
            <ul className="space-y-2 text-primary-700">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-primary-600 text-xs font-bold">1</span>
                </div>
                <p>Log in with different user accounts (with different roles) to see how data access changes</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-primary-600 text-xs font-bold">2</span>
                </div>
                <p>Try to create, update, and delete content to see how write permissions are enforced</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-primary-600 text-xs font-bold">3</span>
                </div>
                <p>Check the organization page to see how role-based permissions work</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
