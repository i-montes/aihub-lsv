import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseRouteHandler,
  getSupabaseServer,
} from "@/lib/supabase/server";
import { errorResponse } from "../base-handler";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Authenticate the user by verifying with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("Not authenticated", 401);
    }

    // Obtener el organization_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Obtener enlaces útiles de la organización
    const { data: links, error: linksError } = await supabase
      .from("useful_links")
      .select("*")
      .eq("organization_id", profile.organizationId)
      .order("created_at", { ascending: false });

    if (linksError) {
      return NextResponse.json(
        { error: "Error al obtener enlaces" },
        { status: 500 }
      );
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error en GET /api/useful-links:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Authenticate the user by verifying with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("Not authenticated", 401);
    }

    // Obtener el organization_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { name, description, link } = body;

    // Validar datos requeridos
    if (!name || !link) {
      return NextResponse.json(
        { error: "Nombre y enlace son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de URL
    try {
      new URL(link);
    } catch {
      return NextResponse.json(
        { error: "El enlace debe ser una URL válida" },
        { status: 400 }
      );
    }

    // Crear nuevo enlace
    const { data: newLink, error: insertError } = await supabase
      .from("useful_links")
      .insert({
        name,
        description,
        link,
        organization_id: profile.organizationId,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Error al crear enlace" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: newLink }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/useful-links:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el organization_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { id, name, description, link } = body;

    // Validar datos requeridos
    if (!id || !name || !link) {
      return NextResponse.json(
        { error: "ID, nombre y enlace son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de URL
    try {
      new URL(link);
    } catch {
      return NextResponse.json(
        { error: "El enlace debe ser una URL válida" },
        { status: 400 }
      );
    }

    // Actualizar enlace
    const { data: updatedLink, error: updateError } = await supabase
      .from("useful_links")
      .update({
        name,
        description,
        link,
      })
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar enlace" },
        { status: 500 }
      );
    }

    if (!updatedLink) {
      return NextResponse.json(
        { error: "Enlace no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error("Error en PUT /api/useful-links:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el organization_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Obtener ID del enlace a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del enlace es requerido" },
        { status: 400 }
      );
    }

    // Eliminar enlace
    const { error: deleteError } = await supabase
      .from("useful_links")
      .delete()
      .eq("id", id)
      .eq("organization_id", profile.organizationId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Error al eliminar enlace" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Enlace eliminado correctamente" });
  } catch (error) {
    console.error("Error en DELETE /api/useful-links:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
