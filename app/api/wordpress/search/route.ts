import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")

  if (!query) {
    return errorResponse("Query parameter is required", 400)
  }

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401)
  }

  // Get user profile to get organizationId
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organizationId")
    .eq("id", session.user.id)
    .single()

  if (profileError || !profile?.organizationId) {
    return errorResponse("User organization not found", 404)
  }

  // Get WordPress connection data
  const { data: wpConnection, error: wpError } = await supabase
    .from("wordpress_integration_table")
    .select("username, password, site_url, api_path")
    .eq("organizationId", profile.organizationId)
    .eq("active", true)
    .single()

  if (wpError || !wpConnection) {
    return errorResponse("WordPress connection not found or inactive", 404)
  }

  const { username, password, site_url, api_path } = wpConnection

  if (!username || !password || !site_url || !api_path) {
    return errorResponse("Incomplete WordPress connection configuration", 400)
  }

  try {
    // Construct WordPress API URL
    const wpApiUrl = `${site_url}${api_path}/posts?search=${encodeURIComponent(query)}&per_page=20&_embed=true`

    // Create basic auth header
    const authHeader = Buffer.from(`${username}:${password}`).toString('base64')

    // Make request to WordPress API
    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress API Error:', response.status, errorText)
      return errorResponse(`WordPress API error: ${response.status}`, response.status)
    }

    const posts = await response.json()

    // Transform the response to match our expected format
    const transformedPosts = posts.map((post: any) => ({
      id: post.id,
      title: {
        rendered: post.title?.rendered || ''
      },
      content: {
        rendered: post.content?.rendered || ''
      },
      excerpt: {
        rendered: post.excerpt?.rendered || ''
      },
      date: post.date,
      link: post.link,
      status: post.status
    }))

    return successResponse(transformedPosts)
  } catch (error) {
    console.error('WordPress search error:', error)
    return errorResponse("Error connecting to WordPress", 500)
  }
})
