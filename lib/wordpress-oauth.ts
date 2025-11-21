'use server'
import { createClient } from "@supabase/supabase-js";

// Verificar que estamos en el servidor
if (typeof window !== 'undefined') {
  throw new Error('WordPressOAuth debe ejecutarse solo en el servidor');
}

// Verificar variables de entorno requeridas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Variables de entorno de Supabase no configuradas');
}

// if (!process.env.WORDPRESS_CLIENT_ID || !process.env.WORDPRESS_CLIENT_SECRET) {
//   throw new Error('Variables de entorno de WordPress no configuradas');
// }

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WordPressConnection {
  id: string;
  site_name: string;
  username: string;
  password: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  site_url: string;
  permissions?: Record<string, unknown> | string;
  connection_type: "self_hosted" | "wordpress_com";
  organizationId: string;
}

export interface WordPressOAuthResult {
  success: boolean;
  connection?: WordPressConnection;
  error?: string;
  token_refreshed?: boolean;
}

export interface WordPressAPIResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  post_count?: number;
}

/**
 * Obtiene la información de conexión de WordPress basada en el ID de la organización
 * @param organizationId ID de la organización
 * @param connectionId ID específico de la conexión (opcional)
 * @returns Resultado con la información de conexión
 */
export async function getWordPressConnection(
  organizationId: string,
  connectionId?: string
): Promise<WordPressOAuthResult> {
  try {
    let query = supabase
      .from("wordpress_integration_table")
      .select(
        "id, site_name, access_token, refresh_token, expires_at, site_url, permissions, connection_type, organizationId, username, password"
      )
      .eq("organizationId", organizationId);

    if (connectionId) {
      query = query.eq("id", connectionId);
    }
    
    const { data: connections, error } = await query.single();
    console.log("connections: ", connections);
    console.log("error: ", error);

    if (error || !connections) {
      return {
        success: false,
        error: "No se encontró conexión de WordPress para esta organización",
      };
    }

    const connection = connections as WordPressConnection;

    // Verificar si el token ha expirado y renovarlo si es necesario
    if (
      connection.connection_type === "wordpress_com" &&
      await isTokenExpired(connection)
    ) {
      const refreshResult = await refreshWordPressToken(connection);
      if (!refreshResult.success) {
        return refreshResult;
      }
      return {
        success: true,
        connection: refreshResult.connection!,
        token_refreshed: true,
      };
    }

    return {
      success: true,
      connection,
    };
  } catch (error) {
    console.error("Error obteniendo conexión de WordPress:", error);
    return {
      success: false,
      error: "Error interno al obtener la conexión",
    };
  }
}

/**
 * Verifica si el token de acceso ha expirado
 * @param connection Conexión de WordPress
 * @returns true si el token ha expirado, false en caso contrario
 */
export async function isTokenExpired(connection: WordPressConnection): Promise<boolean> {
  if (!connection?.expires_at) {
    return false; // Si no hay fecha de expiración, asumimos que no expira
  }

  const expirationDate = new Date(connection.expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutos de buffer

  return expirationDate.getTime() - bufferTime <= now.getTime();
}

/**
 * Renueva el token de acceso usando el refresh token
 * @param connection Conexión de WordPress
 * @returns Resultado de la renovación del token
 */
export async function refreshWordPressToken(
  connection: WordPressConnection
): Promise<WordPressOAuthResult> {
  if (!connection?.refresh_token) {
    return {
      success: false,
      error: "No se encontró refresh token para renovar el acceso",
    };
  }

  try {
    const response = await fetch(
      "https://public-api.wordpress.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.WORDPRESS_CLIENT_ID!,
          client_secret: process.env.WORDPRESS_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: connection.refresh_token,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Actualizar la conexión con el nuevo token
    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("wordpress_integration_table")
      .update({
        access_token: tokenData.access_token,
        refresh_token:
          tokenData.refresh_token || connection.refresh_token,
        expires_at: expiresAt,
      })
      .eq("id", connection.id);

    if (updateError) {
      throw new Error("Error actualizando el token en la base de datos");
    }

    // Crear conexión actualizada
    const updatedConnection: WordPressConnection = {
      ...connection,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || connection.refresh_token,
      expires_at: expiresAt,
    };

    return {
      success: true,
      connection: updatedConnection,
      token_refreshed: true,
    };
  } catch (error) {
    console.error("Error renovando token:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al renovar token",
    };
  }
}

/**
 * Realiza una petición autenticada a la API de WordPress (WordPress.com o self-hosted)
 * @param connection Conexión de WordPress
 * @param endpoint Endpoint de la API (sin el dominio base)
 * @param options Opciones adicionales para la petición
 * @returns Respuesta de la API
 */
export async function makeWordPressAuthenticatedRequest(
  connection: WordPressConnection,
  endpoint: string,
  options: RequestInit = {}
): Promise<WordPressAPIResponse> {
  try {
    let currentConnection = connection;
    let apiUrl: string;
    const headers:any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (connection.connection_type === "wordpress_com") {
      // Verificar y renovar token si es necesario para WordPress.com
      if (await isTokenExpired(currentConnection)) {
        const refreshResult = await refreshWordPressToken(currentConnection);
        if (!refreshResult.success) {
          return {
            success: false,
            error: "No se pudo renovar el token de acceso",
          };
        }
        currentConnection = refreshResult.connection!;
      }

      const siteIdentifier = await getSiteIdentifier(currentConnection);
      apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${siteIdentifier}${endpoint}`;
      headers.Authorization = `Bearer ${currentConnection.access_token}`;
    } else if (connection.connection_type === "self_hosted") {
      // Para sitios self-hosted, usar autenticación Basic
      const baseUrl = connection.site_url.replace(/\/$/, '');
      apiUrl = `${baseUrl}/wp-json/wp/v2${endpoint}`;
      
      // Crear credenciales Basic Auth en base64
      const credentials = `${connection.username}:${connection.password}`;
      const base64Credentials = Buffer.from(credentials).toString('base64');
      headers.Authorization = `Basic ${base64Credentials}`;
    } else {
      return {
        success: false,
        error: "Tipo de conexión no soportado",
      };
    }

    const response = await fetch(apiUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Para WordPress.com, intentar renovar token si es 401
      if (response.status === 401 && connection.connection_type === "wordpress_com") {
        const refreshResult = await refreshWordPressToken(currentConnection);
        if (refreshResult.success) {
          currentConnection = refreshResult.connection!;
          // Reintentar la petición con el nuevo token
          const retryResponse = await fetch(apiUrl, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${currentConnection.access_token}`,
            },
          });

          if (!retryResponse.ok) {
            throw new Error(
              `HTTP ${retryResponse.status}: ${retryResponse.statusText}`
            );
          }

          const retryData = await retryResponse.json();
          return {
            success: true,
            data: retryData,
          };
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error en petición autenticada:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene el identificador del sitio para usar en las APIs
 * @param connection Conexión de WordPress
 * @returns Identificador del sitio
 */
export async function getSiteIdentifier(connection: WordPressConnection): Promise<string> {
  let siteIdentifier = connection.site_url;

  if (connection.permissions) {
    const permissions =
      typeof connection.permissions === "string"
        ? JSON.parse(connection.permissions)
        : connection.permissions;

    siteIdentifier =
      permissions.ID || permissions.slug || connection.site_url;
  }

  // Formatear el identificador apropiadamente
  if (
    typeof siteIdentifier === "number" ||
    /^\d+$/.test(String(siteIdentifier))
  ) {
    return String(siteIdentifier);
  } else if (typeof siteIdentifier === "string") {
    if (siteIdentifier.includes("://")) {
      return siteIdentifier.replace(/^https?:\/\//, "").replace(/\/$/, "");
    } else {
      return siteIdentifier;
    }
  }

  return String(siteIdentifier);
}

/**
 * Obtiene el conteo de posts del sitio de WordPress
 * @param connection Conexión de WordPress
 * @returns Respuesta con el conteo de posts
 */
export async function getWordPressPostCount(
  connection: WordPressConnection
): Promise<WordPressAPIResponse> {
  let endpoint: string;
  
  if (connection.connection_type === "wordpress_com") {
    endpoint = "/posts?number=1";
  } else if (connection.connection_type === "self_hosted") {
    endpoint = "/posts?per_page=1";
  } else {
    return {
      success: false,
      error: "Tipo de conexión no soportado",
    };
  }

  const response = await makeWordPressAuthenticatedRequest(
    connection,
    endpoint
  );

  if (response.success && response.data) {
    let postCount = 0;
    
    if (connection.connection_type === "wordpress_com") {
      // WordPress.com devuelve 'found' con el total
      postCount = typeof response.data.found === 'number' ? response.data.found : 0;
    } else if (connection.connection_type === "self_hosted") {
      // Self-hosted devuelve un array de posts, necesitamos hacer otra petición para el total
      // o usar los headers X-WP-Total si están disponibles
      const posts = Array.isArray(response.data) ? response.data : [];
      postCount = posts.length; // Por ahora, solo el número de posts en esta página
    }
    
    return {
      success: true,
      data: response.data,
      post_count: postCount,
    };
  }

  return response;
}

/**
 * Prueba la conexión de WordPress
 * @param connection Conexión de WordPress
 * @returns Resultado de la prueba de conexión
 */
export async function testWordPressConnection(
  connection: WordPressConnection
): Promise<WordPressAPIResponse> {
  if (connection.connection_type === "wordpress_com") {
    return await getWordPressPostCount(connection);
  } else if (connection.connection_type === "self_hosted") {
    // Para sitios self-hosted, probar con una petición simple a posts
    try {
      const response = await makeWordPressAuthenticatedRequest(
        connection,
        "/posts?per_page=1"
      );
      
      if (response.success && response.data) {
        // Contar posts desde la respuesta
        const posts = Array.isArray(response.data) ? response.data : [];
        return {
          success: true,
          data: response.data,
          post_count: posts.length > 0 ? 1 : 0, // Al menos sabemos que hay posts si devuelve alguno
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al probar conexión self-hosted",
      };
    }
  } else {
    return {
      success: false,
      error: "Tipo de conexión no soportado",
    };
  }
}

/**
 * Función de conveniencia para obtener la conexión de WordPress
 * @param organizationId ID de la organización
 * @param connectionId ID específico de la conexión (opcional)
 * @returns Resultado con la información de conexión
 */
export async function getWordPressOAuth(
  organizationId: string,
  connectionId?: string
): Promise<WordPressOAuthResult> {
  return await getWordPressConnection(organizationId, connectionId);
}
