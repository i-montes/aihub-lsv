import { getSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email");
  const organizationId = requestUrl.searchParams.get("organizationId");
  const supabase = await getSupabaseServer();

  if (!email) {
    return NextResponse.json(
      { error: "ID de usuario no proporcionado" },
      { status: 400 }
    );
  }

  // En lugar de solo devolver la invitación, devolver también el usuario
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .eq("organizationId", organizationId as string)
    .single();

  if (userError || !userData) {
    console.error("Error al obtener usuario:", userError);
    return NextResponse.json(
      { error: "Usuario no encontrado o invitación inválida" },
      { status: 404 }
    );
  }

  if (userError || !userData) {
    console.error("Error al obtener usuario:", userError);
    return NextResponse.json(
      { error: "Usuario no encontrado o invitación inválida" },
      { status: 404 }
    );
  }

  // reviricar correo electrónico
  if (!userData.email) {
    return NextResponse.json(
      { error: "El usuario no tiene un correo electrónico asociado" },
      { status: 400 }
    );
  }

  // Obtener nombre de la organización si existe
  let organizationName = null;
  if (userData?.organizationId) {
    const { data: orgData } = await supabase
      .from("organization")
      .select("name")
      .eq("id", userData.organizationId)
      .single();

    organizationName = orgData?.name || null;
  }

  return NextResponse.json({
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name || null,
      lastname: userData.lastname || null,
      role: userData.role || "USER", // Asignar un rol por defecto si no existe
      organizationId: userData.organizationId || null,
    },
    invitation: {
      email: userData.email,
      name: userData.name || null,
      lastname: userData.lastname || null,
      organizationName,
    },
  });
}
