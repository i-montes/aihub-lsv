"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Search, Link, Key, CheckCircle, AlertTriangle, BookOpen } from "lucide-react"

export default function WordPressPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Integración con WordPress</h1>
        <p className="text-lg text-gray-600">
          Conecta tu sitio WordPress con KIT.AI para buscar y utilizar contenido de tus posts directamente en las herramientas.
        </p>
      </div>

      {/* ¿Qué es la Integración WordPress? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>¿Qué es la Integración WordPress?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La integración con WordPress permite que KIT.AI se conecte directamente con tu sitio web para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Buscar posts y páginas de tu sitio WordPress</li>
            <li>Importar contenido automáticamente a las herramientas</li>
            <li>Usar URLs de posts como fuente de contenido</li>
            <li>Acceder a metadatos como categorías, tags y fechas</li>
            <li>Trabajar con contenido actualizado en tiempo real</li>
          </ul>
        </CardContent>
      </Card>

      {/* Beneficios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Beneficios de la Integración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Flujo de trabajo eficiente:</strong> No necesitas copiar y pegar contenido manualmente</li>
            <li><strong>Contenido actualizado:</strong> Siempre trabajas con la versión más reciente de tus posts</li>
            <li><strong>Búsqueda inteligente:</strong> Encuentra posts por título, contenido, categoría o fecha</li>
            <li><strong>Integración perfecta:</strong> Funciona con todas las herramientas de KIT.AI</li>
            <li><strong>Ahorro de tiempo:</strong> Automatiza la importación de contenido</li>
          </ul>
        </CardContent>
      </Card>

      {/* Requisitos Previos */}
      <Card>
        <CardHeader>
          <CardTitle>Requisitos Previos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Antes de configurar la integración, asegúrate de tener:</p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Sitio WordPress activo</p>
                <p className="text-sm text-gray-600">Tu sitio debe estar en línea y accesible</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">WordPress REST API habilitada</p>
                <p className="text-sm text-gray-600">Disponible por defecto en WordPress 4.7+</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Permisos de administrador</p>
                <p className="text-sm text-gray-600">Para crear usuarios de aplicación si es necesario</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">URL del sitio</p>
                <p className="text-sm text-gray-600">La dirección completa de tu sitio WordPress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Configurar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Configurar la Integración WordPress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Paso 1: Acceder a la Configuración</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Ve al menú lateral y haz clic en <strong>"Configuración"</strong></li>
              <li>Selecciona <strong>"WordPress"</strong> en el submenu</li>
              <li>Haz clic en <strong>"Agregar Sitio WordPress"</strong></li>
            </ol>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla mostrando la navegación a Configuración → WordPress
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Paso 2: Configuración Básica</h3>
            <p className="text-gray-700">En el formulario de configuración, completa:</p>
            
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">URL del Sitio</p>
                <p className="text-sm text-gray-600">
                  Ingresa la URL completa de tu sitio WordPress (ej: https://misitio.com)
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Nombre Descriptivo</p>
                <p className="text-sm text-gray-600">
                  Un nombre para identificar este sitio en KIT.AI (ej: "Blog Principal")
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">Tipo de Autenticación</p>
                <p className="text-sm text-gray-600">
                  Selecciona entre "Público" (solo posts públicos) o "Autenticado" (requiere credenciales)
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla del formulario de configuración básica de WordPress
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Paso 3: Autenticación (Opcional)</h3>
            <p className="text-gray-700">
              Si tu sitio requiere autenticación o quieres acceder a posts privados:
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Opción A: Usuario y Contraseña</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                  <li>Usa las credenciales de un usuario con permisos de lectura</li>
                  <li>Recomendado crear un usuario específico para KIT.AI</li>
                  <li>Asignar rol de "Autor" o "Editor" según necesidades</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Opción B: Application Password (Recomendado)</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 ml-4">
                  <li>En WordPress, ve a Usuarios → Tu Perfil</li>
                  <li>Busca la sección "Application Passwords"</li>
                  <li>Crea una nueva contraseña para "KIT.AI"</li>
                  <li>Copia la contraseña generada</li>
                  <li>Úsala en lugar de tu contraseña normal</li>
                </ol>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla mostrando la sección de Application Passwords en WordPress
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Paso 4: Probar la Conexión</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Haz clic en <strong>"Probar Conexión"</strong></li>
              <li>KIT.AI intentará conectarse a tu sitio</li>
              <li>Si es exitoso, verás un mensaje de confirmación</li>
              <li>Si hay errores, revisa la URL y credenciales</li>
              <li>Una vez confirmado, haz clic en <strong>"Guardar"</strong></li>
            </ol>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla mostrando el resultado exitoso de la prueba de conexión
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usar la Integración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-green-600" />
            <span>Usar la Integración WordPress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Una vez configurada, puedes usar la integración en todas las herramientas de KIT.AI:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Búsqueda de Posts</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>En cualquier herramienta, busca el botón <strong>"Buscar en WordPress"</strong></li>
                <li>Se abrirá un diálogo de búsqueda</li>
                <li>Escribe términos de búsqueda (título, contenido, categoría)</li>
                <li>Selecciona el post que deseas usar</li>
                <li>El contenido se importará automáticamente</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold">Búsqueda por URL</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Copia la URL completa de un post de tu sitio</li>
                <li>Pégala en el campo de búsqueda de WordPress</li>
                <li>KIT.AI detectará automáticamente que es una URL</li>
                <li>Extraerá el contenido directamente del post</li>
              </ol>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla del diálogo de búsqueda WordPress mostrando resultados y la opción de búsqueda por URL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda Avanzados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La búsqueda de WordPress incluye filtros avanzados para encontrar contenido específico:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Por Fecha</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Últimos 7 días</li>
                <li>• Último mes</li>
                <li>• Último año</li>
                <li>• Rango personalizado</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Por Categoría</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Todas las categorías</li>
                <li>• Categorías específicas</li>
                <li>• Múltiples categorías</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Por Estado</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Publicados</li>
                <li>• Borradores</li>
                <li>• Programados</li>
                <li>• Privados</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Por Tipo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Posts</li>
                <li>• Páginas</li>
                <li>• Tipos personalizados</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando los filtros avanzados de búsqueda en acción
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Sitios */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Sitios WordPress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Puedes conectar múltiples sitios WordPress y gestionarlos desde un solo lugar:
          </p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Múltiples Sitios</h4>
              <p className="text-sm text-gray-600">
                Conecta tantos sitios WordPress como necesites (blog principal, sitios de clientes, etc.)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Estado de Conexión</h4>
              <p className="text-sm text-gray-600">
                Monitorea el estado de cada conexión y recibe alertas si hay problemas
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Configuración Individual</h4>
              <p className="text-sm text-gray-600">
                Cada sitio puede tener configuraciones diferentes (autenticación, filtros, etc.)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Búsqueda Unificada</h4>
              <p className="text-sm text-gray-600">
                Busca contenido en todos tus sitios desde una sola interfaz
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando la lista de sitios WordPress conectados con sus estados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Solución de Problemas */}
      <Card>
        <CardHeader>
          <CardTitle>Solución de Problemas Comunes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-800">Error: "No se puede conectar al sitio"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Verifica que la URL sea correcta y el sitio esté en línea</li>
                <li>Asegúrate de que WordPress REST API esté habilitada</li>
                <li>Comprueba que no haya plugins de seguridad bloqueando la API</li>
                <li>Verifica que el sitio no requiera autenticación adicional</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-800">Error: "Credenciales inválidas"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Verifica el nombre de usuario y contraseña</li>
                <li>Si usas Application Password, asegúrate de usar la contraseña generada</li>
                <li>Confirma que el usuario tenga permisos suficientes</li>
                <li>Intenta crear un nuevo Application Password</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-800">Error: "No se encuentran posts"</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                <li>Verifica que haya posts publicados en el sitio</li>
                <li>Ajusta los filtros de búsqueda</li>
                <li>Comprueba los permisos del usuario para ver posts</li>
                <li>Revisa si hay plugins que modifiquen la API REST</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad y Mejores Prácticas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Seguridad y Mejores Prácticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li><strong>Usa Application Passwords:</strong> Más seguro que contraseñas normales</li>
            <li><strong>Usuario específico:</strong> Crea un usuario dedicado para KIT.AI</li>
            <li><strong>Permisos mínimos:</strong> Asigna solo los permisos necesarios</li>
            <li><strong>Monitorea conexiones:</strong> Revisa regularmente el estado de las integraciones</li>
            <li><strong>Actualiza credenciales:</strong> Renueva passwords periódicamente</li>
            <li><strong>SSL requerido:</strong> Usa siempre HTTPS para conexiones seguras</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}