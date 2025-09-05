import {
  createApiHandler,
  errorResponse,
  successResponse,
} from "@/app/api/base-handler";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export const GET = createApiHandler(async (req: NextRequest) => {
  const supabase = await getSupabaseServer();

  // Get identity parameter from URL
  const { searchParams } = new URL(req.url);
  const identity = searchParams.get("identity");

  if (!identity) {
    return errorResponse("Identity parameter is required", 400);
  }

  return successResponse({ identity });

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return errorResponse("Not authenticated", 401);
  }

  // Get the user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name, lastname, avatar, role, organizationId")
    .eq("id", session.user.id)
    .single();

  // Get the organization
  const { data: organization, error: organizationError } = await supabase
    .from("organization")
    .select("id, name, state")
    .eq("id", profile?.organizationId)
    .single();

  if (organizationError) {
    return errorResponse(organizationError.message, 400);
  }

  if (profileError) {
    return errorResponse(profileError.message, 400);
  }

  return successResponse({ profile, organization });
});
