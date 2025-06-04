import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id");
  const supabase = createRouteHandlerClient({ cookies });

  if (!id) {
    return NextResponse.json(
      { error: "ID de usuario no proporcionado" },
      { status: 400 }
    );
  }

  // En lugar de solo devolver la invitación, devolver también el usuario
  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(id);

  if (userError || !userData.user) {
    console.error("Error al obtener usuario:", userError);
    return NextResponse.json(
      { error: "Usuario no encontrado o invitación inválida" },
      { status: 404 }
    );
  }

  if (userError || !userData.user) {
    console.error("Error al obtener usuario:", userError);
    return NextResponse.json(
      { error: "Usuario no encontrado o invitación inválida" },
      { status: 404 }
    );
  }

  // reviricar correo electrónico
  if (!userData.user.email) {
    return NextResponse.json(
      { error: "El usuario no tiene un correo electrónico asociado" },
      { status: 400 }
    );
  }

  //actualizar la confirmacion del correo electrónico con supabase
  const { error: emailError } = await supabase.auth.admin.updateUserById(id, {
    email_confirm: true,
    user_metadata: {
      email_confirmed: true,
    },
  });

  if (emailError) {
    console.error("Error al confirmar el correo electrónico:", emailError);
    return NextResponse.json(
      { error: "Error al confirmar el correo electrónico" },
      { status: 500 }
    );
  }

  // Obtener datos del perfil
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("name, lastname, organizationId")
    .eq("id", id)
    .single();

  if (profileError) {
    console.error("Error al obtener perfil:", profileError);
  }

  // Obtener nombre de la organización si existe
  let organizationName = null;
  if (profileData?.organizationId) {
    const { data: orgData } = await supabase
      .from("organization")
      .select("name")
      .eq("id", profileData.organizationId)
      .single();

    organizationName = orgData?.name || null;
  }

  return NextResponse.json({
    invitation: {
      email: userData.user.email,
      name: profileData?.name || null,
      lastname: profileData?.lastname || null,
      organizationName,
    },
  });
}
