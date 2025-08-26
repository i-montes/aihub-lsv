import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

// Configuración OAuth2 para WordPress.com
const WORDPRESS_CONFIG = {
  clientId: process.env.WORDPRESS_CLIENT_ID!,
  clientSecret: process.env.WORDPRESS_CLIENT_SECRET!,
  tokenUrl: 'https://public-api.wordpress.com/oauth2/token'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refresh_token, connection_id } = body

    if (!refresh_token || !connection_id) {
      return NextResponse.json(
        { error: 'refresh_token y connection_id son requeridos' },
        { status: 400 }
      )
    }

    // Renovar el token de acceso usando el refresh token
    const tokenResponse = await fetch(WORDPRESS_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: WORDPRESS_CONFIG.clientId,
        client_secret: WORDPRESS_CONFIG.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Error al renovar token:', errorData)
      return NextResponse.json(
        { error: 'Error al renovar el token de acceso' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenData

    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + (expires_in * 1000))

    // Actualizar tokens en la base de datos
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabase
      .from('wordpress_integration_table')
      .update({
        access_token: access_token,
        refresh_token: new_refresh_token || refresh_token, // Usar el nuevo refresh token si está disponible
        expires_at: expiresAt.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', connection_id)
      .eq('connection_type', 'wordpress_com')
      .eq('active', true)

    if (updateError) {
      console.error('Error al actualizar tokens:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar los tokens en la base de datos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      access_token: access_token,
      expires_at: expiresAt.toISOString(),
      message: 'Token renovado exitosamente'
    })

  } catch (error) {
    console.error('Error en /api/wordpress/oauth/token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para verificar si un token ha expirado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connection_id')

    if (!connectionId) {
      return NextResponse.json(
        { error: 'connection_id es requerido' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: connection, error } = await supabase
      .from('wordpress_integration_table')
      .select('expires_at, access_token')
      .eq('id', connectionId)
      .eq('connection_type', 'wordpress_com')
      .eq('active', true)
      .single()

    if (error || !connection) {
      return NextResponse.json(
        { error: 'Conexión no encontrada' },
        { status: 404 }
      )
    }

    const now = new Date()
    const expiresAt = new Date(connection.expires_at)
    const isExpired = now >= expiresAt
    const expiresInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60))

    return NextResponse.json({
      is_expired: isExpired,
      expires_in_minutes: expiresInMinutes,
      expires_at: connection.expires_at,
      has_token: !!connection.access_token
    })

  } catch (error) {
    console.error('Error al verificar token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}