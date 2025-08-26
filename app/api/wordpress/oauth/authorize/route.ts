import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Configuración OAuth2 de WordPress.com - Password Grant
const WORDPRESS_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID!;
const WORDPRESS_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET!;
const WORDPRESS_TOKEN_URL = "https://public-api.wordpress.com/oauth2/token";
const WORDPRESS_SCOPE = "users,sites,posts,taxonomy,media";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Verificar autenticación del usuario
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Obtener información de la organización del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("organizationId")
      .eq("id", user.id)
      .single();

    if (!profile?.organizationId) {
      return NextResponse.json(
        { error: "No se encontró la organización del usuario" },
        { status: 400 }
      );
    }

    // Obtener credenciales de WordPress.com del body
    const body = await request.json();
    const { username, password, site_url } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Se requieren username y password de WordPress.com" },
        { status: 400 }
      );
    }

    // Realizar petición Password Grant a WordPress.com
    const tokenResponse = await fetch(WORDPRESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: WORDPRESS_CLIENT_ID,
        client_secret: WORDPRESS_CLIENT_SECRET,
        username: username,
        password: password,
        grant_type: "password",
        scope: WORDPRESS_SCOPE,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("Error en Password Grant:", errorData);
      return NextResponse.json(
        { error: "Credenciales de WordPress.com inválidas" },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Extraer información del token
    let {
      access_token,
      token_type = "bearer",
      blog_id,
      blog_url,
      scope,
    } = tokenData;

    if (!access_token) {
      return NextResponse.json(
        { error: "No se recibió access token de WordPress.com" },
        { status: 500 }
      );
    }

    // Si no tenemos blog_id y blog_url, obtenerlos de la API de sitios del usuario
    if (!blog_id || !blog_url) {
      try {
        const sitesResponse = await fetch(
          "https://public-api.wordpress.com/rest/v1.1/me/sites",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        if (sitesResponse.ok) {
          const sitesData = await sitesResponse.json();
          if (sitesData.sites && sitesData.sites.length > 0) {
            // Si se proporcionó una URL específica, buscar el sitio que coincida
            let targetSite = sitesData.sites[0]; // Por defecto, usar el primer sitio
            
            if (site_url && site_url !== "https://wordpress.com") {
              const matchingSite = sitesData.sites.find((site:any) => 
                site.URL && (site.URL.includes(site_url.replace(/^https?:\/\//, '')) || 
                site_url.includes(site.URL.replace(/^https?:\/\//, '')))
              );
              if (matchingSite) {
                targetSite = matchingSite;
              }
            }
            
            // Actualizar blog_id y blog_url con la información obtenida
            blog_id = targetSite.ID;
            blog_url = targetSite.URL;
          }
        }
      } catch (error) {
        console.error("Error obteniendo sitios del usuario:", error);
      }
    }

    // Obtener información del sitio usando el token
    let siteInfo = null;
    if (blog_id) {
      try {
        const siteResponse = await fetch(
          `https://public-api.wordpress.com/rest/v1.1/sites/${blog_id}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        if (siteResponse.ok) {
          siteInfo = await siteResponse.json();
        }
      } catch (error) {
        console.error("Error obteniendo información del sitio:", error);
      }
    }

    // Verificar si ya existe una conexión de WordPress.com para esta organización
    const { data: existingConnection } = await supabase
      .from("wordpress_integration_table")
      .select("id, username, password")
      .eq("organizationId", profile.organizationId)
      .eq("connection_type", "wordpress_com")
      .single();

    const expiresAt = new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString();
    if (existingConnection) {
      // Actualizar la conexión existente
      const { error: updateError } = await supabase
        .from("wordpress_integration_table")
        .update({
          site_name:
            siteInfo?.display_name || siteInfo?.username || "WordPress.com",
          site_url:
            blog_url || site_url || siteInfo?.primary_blog_url || "https://wordpress.com",
          api_path: "/wp-json/wp/v2/",
          username: existingConnection?.username || null,
          password: existingConnection?.password || null,
          access_token: access_token,
          refresh_token: null, // WordPress.com no proporciona refresh_token
          expires_at: expiresAt.toString(),
          token_type: token_type,
          connection_type: "wordpress_com",
          permissions: siteInfo
            ? JSON.stringify({
                ...siteInfo,
                blog_id: blog_id,
                blog_url: blog_url,
                scope: scope,
              })
            : JSON.stringify({
                blog_id: blog_id,
                blog_url: blog_url,
                scope: scope,
              }),
          active: true,
          organizationId: profile.organizationId,
          updatedAt: new Date().toISOString(),
        })
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
          site_name:
            siteInfo?.display_name || siteInfo?.username || "WordPress.com",
          site_url:
            blog_url || site_url || siteInfo?.primary_blog_url || "https://wordpress.com",
          api_path: "/wp-json/wp/v2/",
          username: username,
          password: password,
          access_token: access_token,
          refresh_token: null, // WordPress.com no proporciona refresh_token
          expires_at: expiresAt.toString(),
          token_type: token_type,
          connection_type: "wordpress_com",
          permissions: siteInfo
            ? JSON.stringify({
                ...siteInfo,
                blog_id: blog_id,
                blog_url: blog_url,
                scope: scope,
              })
            : JSON.stringify({
                blog_id: blog_id,
                blog_url: blog_url,
                scope: scope,
              }),
          active: true,
          organizationId: profile.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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

    return NextResponse.json({
      success: true,
      message: "Conexión con WordPress.com establecida exitosamente",
      site_info: {
        url: blog_url || siteInfo?.URL,
        name: siteInfo?.name || "WordPress.com Site",
        blog_id: blog_id,
      },
    });
  } catch (error) {
    console.error("Error en Password Grant de WordPress:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
