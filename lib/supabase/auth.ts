import { getSupabaseServer, getSupabaseRouteHandler } from './server'
import type { User, AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

/**
 * Securely gets the authenticated user using getUser() which authenticates
 * with the Supabase Auth server, not just reading from cookies.
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await getSupabaseServer()
  
  try {
    const { data, error } = await supabase.auth.getUser()
    
    return {
      user: data?.user || null,
      error
    }
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return {
      user: null,
      error: error as AuthError
    }
  }
}

/**
 * Secure authentication for API routes
 */
export async function getAuthenticatedUserAPI(): Promise<AuthResult> {
  const supabase = await getSupabaseRouteHandler()
  
  try {
    const { data, error } = await supabase.auth.getUser()
    
    return {
      user: data?.user || null,
      error
    }
  } catch (error) {
    console.error("Error getting authenticated user in API:", error)
    return {
      user: null,
      error: error as AuthError
    }
  }
}

/**
 * Checks if a user is authenticated, returning true only if
 * a valid user is found with no errors
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user, error } = await getAuthenticatedUser()
  return !!user && !error
}

/**
 * Gets the user profile from the database
 */
export async function getUserProfile(userId: string) {
  const supabase = await getSupabaseServer()
  
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
}

/**
 * Gets the user profile from the database (API route version)
 */
export async function getUserProfileAPI(userId: string) {
  const supabase = await getSupabaseRouteHandler()
  
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
}

/**
 * For compatibility: gets session data but prioritizes getUser() for auth
 */
export async function getSessionSecurely() {
  // First authenticate the user securely
  const { user, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { session: null, user: null, error: authError }
  }
  
  // Only if user is authenticated, get session data
  const supabase = await getSupabaseServer()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  return {
    session,
    user, // Use the authenticated user from getUser()
    error: sessionError
  }
}

