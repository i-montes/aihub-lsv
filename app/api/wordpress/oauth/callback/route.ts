import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";

// Configuración OAuth2 de WordPress.com
const WORDPRESS_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID!;
const WORDPRESS_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET!;
const WORDPRESS_REDIRECT_URI =
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/wordpress/oauth/callback`;
const WORDPRESS_TOKEN_URL = "https://public-api.wordpress.com/oauth2/token";
const WORDPRESS_API_BASE = "https://public-api.wordpress.com/rest/v1.1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Verificar si hay errores en la respuesta de WordPress.com
    if (error) {
      console.error(
        "Error de autorización de WordPress.com:",
        error,
        errorDescription
      );
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=authorization_failed&message=" +
            encodeURIComponent(errorDescription || "Error de autorización"),
          request.url
        )
      );
    }

    // Verificar que tenemos el código de autorización
    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=missing_code&message=" +
            encodeURIComponent("Código de autorización no recibido"),
          request.url
        )
      );
    }

    // Verificar el parámetro state para prevenir ataques CSRF
    const cookieStore = await cookies();
    const storedState = cookieStore.get("wordpress_oauth_state")?.value;

    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=invalid_state&message=" +
            encodeURIComponent("Estado de seguridad inválido"),
          request.url
        )
      );
    }

    // Intercambiar el código por un access token
    const tokenResponse = await fetch(WORDPRESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: WORDPRESS_CLIENT_ID,
        client_secret: WORDPRESS_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: WORDPRESS_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Error al intercambiar código por token:", errorData);
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=token_exchange_failed&message=" +
            encodeURIComponent("Error al obtener el token de acceso"),
          request.url
        )
      );
    }

    const tokenData = await tokenResponse.json();
    const {
      access_token,
      token_type = "bearer",
      blog_id,
      blog_url,
      scope,
    } = tokenData;

    if (!access_token) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=invalid_token&message=" +
            encodeURIComponent("Token de acceso no válido"),
          request.url
        )
      );
    }

    console.log("\n\n Token Data: ", tokenData);

    console.log("\n\n Headers: ", tokenResponse.headers);

    // Calcular la fecha de expiración (18 horas por defecto para WordPress.com)
    const expiresAt = new Date(Date.now() + 18 * 60 * 60 * 1000); // 18 horas

    // Obtener información básica del sitio conectado
    let siteInfo = null;
    try {
      const siteResponse = await fetch(`${WORDPRESS_API_BASE}/me`, {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          Accept: "application/json",
        },
      });

      if (siteResponse.ok) {
        siteInfo = await siteResponse.json();
      }
    } catch (error) {
      console.warn("No se pudo obtener información del sitio:", error);
    }

    // Obtener el usuario autenticado y su organización
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=auth_required&message=" +
            encodeURIComponent("Autenticación requerida"),
          request.url
        )
      );
    }

    // Obtener la organización del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", user.id)
      .single();

    if (!profile?.organizationId) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/configuracion/wordpress?error=no_organization&message=" +
            encodeURIComponent("Organización no encontrada"),
          request.url
        )
      );
    }

    // Verificar si ya existe una conexión de WordPress.com para esta organización
    const { data: existingConnection } = await supabase
      .from("wordpress_integration_table")
      .select("id, username, password")
      .eq("organizationId", profile.organizationId)
      .eq("connection_type", "wordpress_com")
      .single();

    const integrationData = {
      site_name:
        siteInfo?.display_name || siteInfo?.username || "WordPress.com",
      site_url: blog_url || siteInfo?.primary_blog_url || "https://wordpress.com",
      api_path: "/wp-json/wp/v2/",
      username: existingConnection?.username || null,
      password: existingConnection?.password || null,
      access_token: access_token,
      refresh_token: null, // WordPress.com no proporciona refresh_token
      expires_at: expiresAt.toISOString(),
      token_type: token_type,
      connection_type: "wordpress_com",
      permissions: siteInfo ? JSON.stringify({
        ...siteInfo,
        blog_id: blog_id,
        blog_url: blog_url,
        scope: scope
      }) : JSON.stringify({
        blog_id: blog_id,
        blog_url: blog_url,
        scope: scope
      }),
      active: true,
      organizationId: profile.organizationId,
      updatedAt: new Date().toISOString(),
    };

    if (existingConnection) {
      // Actualizar la conexión existente
      const { error: updateError } = await supabase
        .from("wordpress_integration_table")
        .update(integrationData)
        .eq("id", existingConnection.id);

      if (updateError) {
        console.error("Error al actualizar la integración:", updateError);
        return NextResponse.redirect(
          new URL(
            "/dashboard/configuracion/wordpress?error=update_failed&message=" +
              encodeURIComponent("Error al actualizar la conexión"),
            request.url
          )
        );
      }
    } else {
      // Crear nueva conexión
      const { error: insertError } = await supabase
        .from("wordpress_integration_table")
        .insert({
          ...integrationData,
          createdAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error al crear la integración:", insertError);
        return NextResponse.redirect(
          new URL(
            "/dashboard/configuracion/wordpress?error=create_failed&message=" +
              encodeURIComponent("Error al crear la conexión"),
            request.url
          )
        );
      }
    }

    // Limpiar la cookie del state
    const response = NextResponse.redirect(
      new URL(
        "/dashboard/configuracion/wordpress?success=connected&message=" +
          encodeURIComponent(
            "Conexión con WordPress.com establecida exitosamente"
          ),
        request.url
      )
    );

    response.cookies.delete("wordpress_oauth_state");

    return response;
  } catch (error) {
    console.error("Error en callback de OAuth2:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard/configuracion/wordpress?error=callback_error&message=" +
          encodeURIComponent("Error interno del servidor"),
        request.url
      )
    );
  }
}
