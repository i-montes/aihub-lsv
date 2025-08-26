import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connection_id } = body

    if (!connection_id) {
      return NextResponse.json(
        { error: 'connection_id es requerido' },
        { status: 400 }
      )
    }

    // Obtener el token de autenticación del usuario
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-access-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Crear cliente de Supabase con el token del usuario
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    )

    // Obtener información del usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no válido' },
        { status: 401 }
      )
    }

    // Obtener el organizationId del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('organizationId')
      .eq('id', user.id)
      .single()

    if (!profile?.organizationId) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Usar el service role key para la operación de desconexión
    const adminSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar que la conexión pertenece a la organización del usuario
    const { data: connection, error: connectionError } = await adminSupabase
      .from('wordpress_integration_table')
      .select('id, site_name, connection_type')
      .eq('id', connection_id)
      .eq('organizationId', profile.organizationId)
      .eq('connection_type', 'wordpress_com')
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Conexión no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Desactivar la conexión y limpiar los tokens
    const { error: updateError } = await adminSupabase
      .from('wordpress_integration_table')
      .update({
        active: false,
        access_token: null,
        refresh_token: null,
        expires_at: null,
        token_type: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', connection_id)
      .eq('organizationId', profile.organizationId)
      .eq('connection_type', 'wordpress_com')

    if (updateError) {
      console.error('Error al desconectar WordPress.com:', updateError)
      return NextResponse.json(
        { error: 'Error al desconectar la cuenta de WordPress.com' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Conexión con ${connection.site_name} desconectada exitosamente`,
      disconnected_site: connection.site_name
    })

  } catch (error) {
    console.error('Error en /api/wordpress/oauth/disconnect:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Método GET para obtener información de conexiones activas
export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autenticación del usuario
    const cookieStore = cookies()
    const authToken = cookieStore.get('sb-access-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Crear cliente de Supabase con el token del usuario
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    )

    // Obtener información del usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no válido' },
        { status: 401 }
      )
    }

    // Obtener el organizationId del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('organizationId')
      .eq('id', user.id)
      .single()

    if (!profile?.organizationId) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Obtener todas las conexiones activas de WordPress.com
    const { data: connections, error: connectionsError } = await supabase
      .from('wordpress_integration_table')
      .select('id, site_name, site_url, connection_type, createdAt, expires_at')
      .eq('organizationId', profile.organizationId)
      .eq('connection_type', 'wordpress_com')
      .eq('active', true)
      .order('createdAt', { ascending: false })

    if (connectionsError) {
      console.error('Error al obtener conexiones:', connectionsError)
      return NextResponse.json(
        { error: 'Error al obtener las conexiones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      connections: connections || [],
      total: connections?.length || 0
    })

  } catch (error) {
    console.error('Error al obtener conexiones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}