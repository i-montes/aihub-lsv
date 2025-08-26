import { NextRequest, NextResponse } from 'next/server';
import { createWordPressOAuth } from '@/lib/wordpress-oauth';

export async function POST(request: NextRequest) {
  try {
    const { site_url, username, password, connection_type, connection_id, organization_id } = await request.json();

    let testResult;

    if (connection_type === 'self_hosted') {
      testResult = await testSelfHostedConnection(site_url, username, password);
    } else if (connection_type === 'wordpress_com') {
      // Usar la nueva función WordPressOAuth
      if (connection_id) {
        const { oauth, result } = await createWordPressOAuth(organization_id || '', connection_id);
        
        if (!result.success) {
          console.log('Error obteniendo conexión OAuth:', result.error);
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
          );
        }

        // Probar la conexión usando la nueva función
        const connectionTest = await oauth.testConnection();
        
        if (connectionTest.success) {
          testResult = {
            success: true,
            message: result.token_refreshed ? 'Conexión exitosa (token renovado)' : 'Conexión exitosa',
            post_count: connectionTest.post_count || 0,
            connection_type: 'wordpress_com'
          };
        } else {
          testResult = {
            success: false,
            error: connectionTest.error,
            connection_type: 'wordpress_com'
          };
        }
      } else {
        console.log('Se requiere connection_id para WordPress.com')
        return NextResponse.json(
          { success: false, error: 'Se requiere connection_id para WordPress.com' },
          { status: 400 }
        );
      }
    } else {
      console.log('Tipo de conexión no válido');
      return NextResponse.json(
        { success: false, error: 'Tipo de conexión no válido' },
        { status: 400 }
      );
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function testSelfHostedConnection(site_url: string, username: string, password: string) {
  try {
    // Normalizar URL
    const normalizedUrl = site_url.replace(/\/$/, '');
    const apiUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;

    // Crear credenciales de autenticación básica
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    // Realizar petición a la API de WordPress
    const response = await fetch(`${apiUrl}?per_page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Obtener el total de posts del header X-WP-Total
    const totalPosts = response.headers.get('X-WP-Total') || '0';

    return {
      success: true,
      message: 'Conexión exitosa',
      post_count: parseInt(totalPosts, 10),
      connection_type: 'self_hosted'
    };
  } catch (error) {
    console.error('Error testing self-hosted connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      connection_type: 'self_hosted'
    };
  }
}