import { createApiHandler, errorResponse, successResponse } from "@/app/api/base-handler"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer()
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "20"
  const categories = searchParams.get("categories") || ""

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
    // Function to detect if query is a URL and extract slug
    const isUrl = (str: string): boolean => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    }

    const extractSlugFromUrl = (url: string): string | null => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        // Remove leading and trailing slashes, then get the last segment
        const segments = pathname.split('/').filter(segment => segment.length > 0);
        return segments.length > 0 ? segments[segments.length - 1] : null;
      } catch {
        return null;
      }
    }

    // Construct WordPress API URL with pagination, order and date filters
    let wpApiUrl = `${site_url}${api_path}/posts?per_page=${perPage}&page=${page}&order=desc&orderby=date&_embed=true&status=any`

    // Check if query is a URL and search by slug, otherwise search normally
    if (query !== "*") {
      if (isUrl(query)) {
        const slug = extractSlugFromUrl(query);
        if (slug) {
          // Search by slug using the 'slug' parameter
          wpApiUrl += `&slug=${encodeURIComponent(slug)}`;
        } else {
          // Fallback to regular search if slug extraction fails
          wpApiUrl += `&search=${encodeURIComponent(query)}`;
        }
      } else {
        // Regular text search
        wpApiUrl += `&search=${encodeURIComponent(query)}`;
      }
    }

    if (categories) {
      const categoryIds = categories.split(',').map(id => id.trim()).filter(id => id)
      if (categoryIds.length > 0) {
        wpApiUrl += `&categories=${categoryIds.join(',')}`
      }
    }

    // Add date filters if provided
    if (startDate) {
      wpApiUrl += `&after=${encodeURIComponent(startDate)}T00:00:00`
    }
    if (endDate) {
      wpApiUrl += `&before=${encodeURIComponent(endDate)}T23:59:59`
    }

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

    // Get pagination info from WordPress headers
    const totalCount = response.headers.get('X-WP-Total') || '0'
    const totalPages = response.headers.get('X-WP-TotalPages') || '1'

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

    return successResponse(transformedPosts, 200, {
      count: parseInt(totalCount),
      pages: parseInt(totalPages)
    })
  } catch (error) {
    console.error('WordPress search error:', error)
    return errorResponse("Error connecting to WordPress", 500)
  }
})
