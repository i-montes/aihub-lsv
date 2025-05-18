import {
  createApiHandler,
  errorResponse,
  successResponse,
} from "@/app/api/base-handler";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export const POST = createApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse("Email and password are required", 400);
  }

  const supabase = await getSupabaseRouteHandler();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return errorResponse(error.message, 401);
    }

    if (!data.session) {
      console.error("No session returned from Supabase");
      return errorResponse("No se pudo establecer la sesión", 500);
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, name, lastname, avatar, role, organizationId")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // If the profile is not found, return a 404 error
      if (profileError.code === "PGRST116") {
        return errorResponse("Profile not found", 404);
      }
      // If there is any other error, return a 500 error
      return errorResponse("Internal server error", 500);
    }

    const profile = profileData

    // Devolver la sesión completa
    return successResponse({
      user: data.user,
      profile,
      session: data.session,
    });
  } catch (error: any) {
    console.error("Unexpected error during login:", error);
    return errorResponse(
      error.message || "Error durante el inicio de sesión",
      500
    );
  }
});
