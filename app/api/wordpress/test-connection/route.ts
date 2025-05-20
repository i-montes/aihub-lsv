import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { site_url, username, password, api_path = "/wp-json/wp/v2" } = await request.json()

    // Validar datos de entrada
    if (!site_url) {
      return NextResponse.json({ error: "La URL del sitio es requerida" }, { status: 400 })
    }

    // Normalizar URL
    let siteUrl = site_url
    if (!siteUrl.startsWith("http")) {
      siteUrl = `https://${siteUrl}`
    }
    if (siteUrl.endsWith("/")) {
      siteUrl = siteUrl.slice(0, -1)
    }

    // Normalizar ruta de API
    let apiPath = api_path || "/wp-json/wp/v2"
    if (!apiPath.startsWith("/")) {
      apiPath = `/${apiPath}`
    }
    if (apiPath.endsWith("/")) {
      apiPath = apiPath.slice(0, -1)
    }

    // Construir URL de la API de WordPress para settings
    const settingsUrl = `${siteUrl}${apiPath}/settings`

    // Preparar headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Añadir autenticación si se proporcionan credenciales
    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString("base64")
      headers["Authorization"] = `Basic ${credentials}`
    }

    // Hacer la solicitud al servidor WordPress
    const response = await fetch(settingsUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error al conectar con WordPress: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Extraer el nombre del sitio del campo title
    const siteName = data.title || "Sitio WordPress"

    return NextResponse.json({
      success: true,
      site: {
        name: siteName,
        url: siteUrl,
        api_path: apiPath,
      },
      settings: data,
    })
  } catch (error) {
    console.error("Error en el endpoint de prueba de conexión:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? `Error: ${error.message}` : "Error desconocido al conectar con WordPress",
      },
      { status: 500 },
    )
  }
}
