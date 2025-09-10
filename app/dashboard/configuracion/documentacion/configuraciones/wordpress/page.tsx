"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Globe, Key, CheckCircle, Search, AlertTriangle, Info } from "lucide-react"

export default function WordPressPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integración WordPress</h1>
          <p className="text-gray-600 mt-2">
            Conecta tus sitios WordPress para importar y trabajar con tu contenido existente
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Globe className="h-4 w-4 mr-1" />
          Integración Externa
        </Badge>
      </div>

      {/* Introducción */}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué es la Integración WordPress?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            La integración WordPress te permite conectar KIT.AI con tus sitios WordPress para:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Importar contenido existente de posts y páginas</li>
            <li>Buscar y seleccionar posts específicos para trabajar</li>
            <li>Acceder a tu biblioteca de contenido desde cualquier herramienta</li>
            <li>Mantener la conexión con múltiples sitios WordPress</li>
            <li>Usar filtros avanzados para encontrar contenido específico</li>
          </ul>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Beneficios:</strong> Ahorra tiempo reutilizando contenido existente, 
              mantén consistencia en tu marca y aprovecha tu biblioteca de contenido.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Requisitos Previos */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Requisitos Previos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-orange-700">
            Antes de configurar la integración, asegúrate de tener:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
            <li><strong>Sitio WordPress activo:</strong> Con acceso de administrador</li>
            <li><strong>WordPress REST API habilitada:</strong> (habilitada por defecto en versiones recientes)</li>
            <li><strong>Usuario con permisos:</strong> Capaz de leer posts y páginas</li>
            <li><strong>Conexión HTTPS:</strong> Recomendado para mayor seguridad</li>
            <li><strong>Application Password:</strong> (recomendado) o credenciales de usuario</li>
          </ul>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Configurar WordPress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Acceder a la Configuración</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Ve a <strong>Configuración → Integraciones</strong></li>
                <li>Busca la sección <strong>"WordPress"</strong></li>
                <li>Haz clic en <strong>"Configurar"</strong> o <strong>"Añadir Sitio"</strong></li>
              </ol>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla mostrando la ubicación de la configuración WordPress en la página de integraciones
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Configuración Básica</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">URL del Sitio</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Introduce la URL completa de tu sitio WordPress:
                  </p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    https://tusitio.com
                  </code>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Nombre del Sitio</h4>
                  <p className="text-sm text-gray-600">
                    Un nombre descriptivo para identificar este sitio (ej: "Blog Principal", "Sitio Cliente")
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
              <p className="text-sm text-gray-600">
                Captura de pantalla del formulario de configuración básica mostrando los campos URL y nombre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Autenticación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-purple-600" />
            <span>Configurar Autenticación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Elige el método de autenticación que prefieras:
          </p>

          <div className="space-y-4">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Opción 1: Application Password (Recomendado)</h3>
              <p className="text-sm text-green-700 mb-3">
                Más seguro y específico para aplicaciones externas.
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-green-700 ml-4">
                <li>En tu WordPress, ve a <strong>Usuarios → Perfil</strong></li>
                <li>Busca la sección <strong>"Application Passwords"</strong></li>
                <li>Introduce un nombre: <code>"KIT.AI"</code></li>
                <li>Haz clic en <strong>"Add New Application Password"</strong></li>
                <li>Copia la contraseña generada (solo se muestra una vez)</li>
                <li>Usa tu nombre de usuario normal y esta contraseña en KIT.AI</li>
              </ol>
            </div>

            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">Opción 2: Credenciales de Usuario</h3>
              <p className="text-sm text-blue-700 mb-3">
                Usa tu nombre de usuario y contraseña normales.
              </p>
              
              <div className="space-y-2">
                <div>
                  <strong>Usuario:</strong> Tu nombre de usuario de WordPress
                </div>
                <div>
                  <strong>Contraseña:</strong> Tu contraseña de WordPress
                </div>
              </div>
              
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Nota:</strong> Menos seguro que Application Passwords. 
                  Recomendamos crear un usuario específico para KIT.AI.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>[Imagen Captura]</strong></p>
            <p className="text-sm text-gray-600">
              Captura de pantalla mostrando cómo crear un Application Password en WordPress
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Probar Conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Probar y Guardar Conexión</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Verificar la Configuración</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Una vez completados todos los campos, haz clic en <strong>"Probar Conexión"</strong></li>
                <li>KIT.AI intentará conectarse a tu sitio</li>
                <li>Si es exitoso, verás un mensaje de confirmación</li>
                <li>Si hay errores, revisa la URL y credenciales</li>
                <li>Una vez confirmado, haz clic en <strong>"Guardar"</strong></li>
              </ol>
            </div>

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