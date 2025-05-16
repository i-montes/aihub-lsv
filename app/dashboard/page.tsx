import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileCheck,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowRight,
  FileUp,
  Users,
  Library,
  TrendingUp,
  Bell,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome to PressAI</h1>
          <p className="text-gray-500">Your AI-powered journalism toolkit</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Today</span>
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">New Project</Button>
        </div>
      </div>

      {/* Main Tools Section */}
      <section>
        <h2 className="text-lg font-bold mb-4">Main Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Style Checker */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Style Checker</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Verify and correct your text according to customized editorial guidelines.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Last used: Today</div>
                  <Link href="/dashboard/proofreader">
                    <Button variant="outline" className="flex items-center gap-1">
                      Use <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thread Generator */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Thread Generator</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Convert articles into engaging social media threads with a single click.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Last used: Yesterday</div>
                  <Link href="/dashboard/thread-generator">
                    <Button variant="outline" className="flex items-center gap-1">
                      Use <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Newsletter</h3>
                <p className="text-gray-500 mb-4 flex-grow">
                  Create attractive newsletters with formats optimized for email.
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">Last used: 3 days ago</div>
                  <Link href="/dashboard/newsletter-generator">
                    <Button variant="outline" className="flex items-center gap-1">
                      Use <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Organization Activity and Resource Library */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Activity */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Organization Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View all
              </Button>
            </div>
            <CardDescription>Recent activity from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileUp className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">María García uploaded a new article</p>
                  <p className="text-xs text-gray-500">35 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Carlos Rodríguez generated a Twitter thread</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ana Martínez created a newsletter</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Juan López invited a new member</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Library */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resource Library</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View all
              </Button>
            </div>
            <CardDescription>Available resources and templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <Library className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Editorial Style Guide</p>
                    <p className="text-xs text-gray-500">PDF • Updated 2 weeks ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Weekly Newsletter Template</p>
                    <p className="text-xs text-gray-500">Template • Used 24 times</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Viral Thread Structure</p>
                    <p className="text-xs text-gray-500">Template • Used 18 times</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Performance Metrics and Usage Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Metrics</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                This month
              </Button>
            </div>
            <CardDescription>Usage and efficiency statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Articles created</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +12% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Threads generated</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +8% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Newsletters sent</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +5% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Time saved</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">36h</p>
                  <p className="text-xs text-green-600 flex items-center">
                    +15% <TrendingUp className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[150px] flex items-end justify-between gap-2 px-2">
              {/* Simplified chart */}
              {Array.from({ length: 14 }).map((_, i) => {
                const height = 30 + Math.random() * 70
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary-100 rounded-t-sm" style={{ height: `${height}px` }}></div>
                    {i % 2 === 0 && <div className="text-[10px] text-gray-400 mt-1">{i + 1}</div>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage Trends</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                This month
              </Button>
            </div>
            <CardDescription>Tool usage by your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Style Checker</span>
                  </div>
                  <span className="text-sm">42%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Thread Generator</span>
                  </div>
                  <span className="text-sm">35%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium">Newsletters</span>
                  </div>
                  <span className="text-sm">23%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "23%" }}></div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Most active user</p>
                    <p className="text-xs text-gray-500">María García • 28 uses this week</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src="/professional-woman-journalist.png"
                      alt="María García"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Learning Center and Updates Log */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Center */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Learning Center</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View all
              </Button>
            </div>
            <CardDescription>Resources to improve your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">How to Write Headlines That Convert</p>
                  <p className="text-xs text-gray-500 mb-2">Tutorial • 8 min read</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View tutorial
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Viral Thread Structure on Twitter</p>
                  <p className="text-xs text-gray-500 mb-2">Webinar • 22 min</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch webinar
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Newsletter Optimization for Conversion</p>
                  <p className="text-xs text-gray-500 mb-2">Guide • 15 min read</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Read guide
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Log */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Updates Log</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View all
              </Button>
            </div>
            <CardDescription>Latest platform improvements and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-gray-200">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary-600"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">New Thread Generator</p>
                      <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">New</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">2 days ago</p>
                    <p className="text-sm text-gray-600">
                      We've launched a new version of the thread generator with support for multiple platforms.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-medium">Style Checker Improvements</p>
                    <p className="text-xs text-gray-500 mb-1">1 week ago</p>
                    <p className="text-sm text-gray-600">
                      The style checker now supports more editorial guides and offers more precise suggestions.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-medium">Google Docs Integration</p>
                    <p className="text-xs text-gray-500 mb-1">2 weeks ago</p>
                    <p className="text-sm text-gray-600">
                      You can now import and export documents directly from Google Docs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Status Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium">All Systems Operational</h3>
            <p className="text-sm text-gray-500">Last checked 5 minutes ago</p>
          </div>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">3 Unread Notifications</h3>
            <p className="text-sm text-gray-500">Check your inbox</p>
          </div>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium">Subscription Renews Soon</h3>
            <p className="text-sm text-gray-500">15 days remaining</p>
          </div>
        </Card>
      </section>
    </div>
  )
}
