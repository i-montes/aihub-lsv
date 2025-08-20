"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Activity, Clock, User, Globe, Monitor } from "lucide-react"

export default function ActivityPage() {
  const { user, profile } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchUserActivity()
    }
  }, [user])

  const fetchUserActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("activity")
        .select("*")
        .order("createdAt", { ascending: false })
        .limit(50)

      if (error) throw error

      setActivities(data || [])
    } catch (error) {
      console.error("Error fetching activity:", error)
      toast.error("Could not load activity data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getActivityIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "login":
        return <User className="h-5 w-5 text-green-500" />
      case "logout":
        return <User className="h-5 w-5 text-red-500" />
      case "create":
        return <Activity className="h-5 w-5 text-blue-500" />
      case "update":
        return <Activity className="h-5 w-5 text-yellow-500" />
      case "delete":
        return <Activity className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading activity data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <p className="text-gray-500">
        View your recent activity on the platform. This demonstrates how RLS policies control access to the activity
        table.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {profile?.role === "OWNER" || profile?.role === "WORKSPACE_ADMIN"
              ? "As an admin, you can see activity from all users in your organization"
              : "You can only see your own activity"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <h3 className="font-medium">
                        {activity.action || "Activity"}
                        {activity.details?.target && ` - ${activity.details.target}`}
                      </h3>
                      <span className="text-xs text-gray-500 mt-1 sm:mt-0">{formatDate(activity.createdAt)}</span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      {activity.details?.description && <p>{activity.details.description}</p>}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.ipAddress && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Globe className="h-3 w-3 mr-1" />
                          <span>IP: {activity.ipAddress}</span>
                        </div>
                      )}

                      {activity.userAgent && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Monitor className="h-3 w-3 mr-1" />
                          <span>
                            {activity.userAgent.length > 30
                              ? `${activity.userAgent.substring(0, 30)}...`
                              : activity.userAgent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-500">No Activity Found</h3>
              <p className="text-sm text-gray-400 mt-1">Your activity will appear here as you use the platform</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
