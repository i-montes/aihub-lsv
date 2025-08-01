# KIT.AI

*AI-powered tools for modern journalism and content creation*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/la-silla-vacia/v0-aihub)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/bQLARYML7XV)

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Librerías y Dependencias](#librerías-y-dependencias)
- [Componentes Principales](#componentes-principales)
- [Funciones Clave](#funciones-clave)
- [Despliegue](#despliegue)
- [Desarrollo](#desarrollo)
- [API Routes](#api-routes)

## 📖 Descripción

AI HUB es una plataforma completa de herramientas impulsadas por IA para periodistas y creadores de contenido. Incluye un editor inteligente, generador de hilos para redes sociales, generador de newsletters y más.

## ✨ Características

- **Editor de Texto Inteligente**: Editor con IA integrada y guías de estilo
- **Generador de Hilos**: Convierte artículos en hilos optimizados para redes sociales
- **Generador de Newsletter**: Transforma contenido en formatos de newsletter
- **Autenticación**: Sistema completo con Supabase Auth
- **Gestión de Organizaciones**: Sistema multi-tenant con roles de usuario
- **Dashboard Interactivo**: Panel de control con métricas y analytics

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (opcional para funcionalidad completa)

### Pasos de Instalación

1. **Clonar el repositorio**
```
git clone https://github.com/la-silla-vacia/v0-aihub.git
cd v0-aihub
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar las variables de entorno** (ver sección siguiente)

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

### Variables Obligatorias

```env
# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (Obligatorio para funcionalidad completa)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services (Opcional - para funcionalidades de IA)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
```

### Variables Opcionales

```env
# Desarrollo
NODE_ENV=development

# Analytics (Opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email (Opcional - para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña
```

### Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener las claves
3. Configura las políticas RLS en tu base de datos
4. Ejecuta las migraciones necesarias (ver `/database/schema.sql`)

## 📚 Librerías y Dependencias

### Framework Principal
- **Next.js 15.2.4**: Framework React con SSR/SSG
- **React 19**: Librería de interfaz de usuario
- **TypeScript 5**: Superset tipado de JavaScript

### UI y Styling
- **Tailwind CSS 3.4.17**: Framework CSS utility-first
- **Radix UI**: Componentes headless accesibles
- **Lucide React**: Iconos SVG
- **class-variance-authority**: Gestión de variantes CSS
- **tailwind-merge**: Fusión inteligente de clases Tailwind

### Autenticación y Base de Datos
- **Supabase**: Backend como servicio (Auth + Database)
  - `@supabase/supabase-js`: Cliente JavaScript
  - `@supabase/ssr`: Integración con SSR

### IA y Procesamiento
- **AI SDK**: Framework para integrar múltiples proveedores de IA
  - `@ai-sdk/openai`: Integración con OpenAI
  - `@ai-sdk/anthropic`: Integración con Claude
  - `@ai-sdk/google`: Integración con Google AI

### Editor y Contenido
- **Tiptap**: Editor de texto rico
  - `@tiptap/react`: Integración con React
  - `@tiptap/starter-kit`: Kit básico de extensiones
- **React Markdown**: Renderizado de Markdown
- **marked**: Parser de Markdown

### Formularios y Validación
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas TypeScript
- **@hookform/resolvers**: Resolvers para validación

### PDF y Documentos
- **pdf2pic**: Conversión de PDF a imágenes
- **pdfjs-dist**: Renderizado de PDFs
- **canvas**: Manipulación de canvas HTML5

### Utilidades
- **date-fns**: Manipulación de fechas
- **uuid**: Generación de UUIDs
- **clsx**: Construcción condicional de clases CSS

## 🧩 Componentes Principales

### Componentes de UI Base (`/components/ui/`)

#### **Button**
Componente de botón reutilizable con múltiples variantes y estados.

```typescript
interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit" | "reset"
}

// Uso
<Button variant="outline" size="sm" onClick={handleClick}>
  Guardar
</Button>
```

#### **Input**
Campo de entrada con validación integrada y soporte para diferentes tipos.

```typescript
interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search"
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

// Uso
<Input
  type="email"
  placeholder="correo@ejemplo.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  required
/>
```

#### **Dialog**
Modal reutilizable con soporte para diferentes tamaños y acciones.

```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
}

// Uso
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirmar acción"
  description="¿Estás seguro de que quieres continuar?"
  size="md"
>
  <div className="space-y-4">
    <p>Contenido del modal</p>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>Confirmar</Button>
    </div>
  </div>
</Dialog>
```

#### **Dropdown**
Menú desplegable con soporte para items anidados y acciones personalizadas.

```typescript
interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
}

interface DropdownItem {
  label: string
  value: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  separator?: boolean
  destructive?: boolean
}

// Uso
<Dropdown
  trigger={<Button variant="outline">Opciones</Button>}
  items={[
    { label: "Editar", value: "edit", icon: <Edit2 /> },
    { label: "Duplicar", value: "duplicate", icon: <Copy /> },
    { separator: true },
    { label: "Eliminar", value: "delete", icon: <Trash2 />, destructive: true }
  ]}
  align="end"
/>
```

#### **Tabs**
Sistema de pestañas navegables con soporte para contenido dinámico.

```typescript
interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  children: React.ReactNode
}

// Uso
<Tabs defaultValue="general" orientation="horizontal">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Seguridad</TabsTrigger>
    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    <GeneralSettings />
  </TabsContent>
  <TabsContent value="security">
    <SecuritySettings />
  </TabsContent>
</Tabs>
```

#### **Toast**
Sistema de notificaciones con diferentes tipos y posicionamiento.

```typescript
interface ToastProps {
  type?: "default" | "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
  action?: React.ReactNode
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

// Uso
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  type: "success",
  title: "Éxito",
  description: "Los cambios se guardaron correctamente",
  duration: 3000
})
```

### Componentes de Layout

#### **Navigation**
Barra de navegación principal con soporte para autenticación y menús.

```typescript
interface NavigationProps {
  user?: User | null
  onLogout?: () => void
  showMobileMenu?: boolean
  className?: string
}

// Características:
// - Responsive design (mobile/desktop)
// - Avatar de usuario con dropdown
// - Notificaciones en tiempo real
// - Breadcrumbs automáticos
// - Dark/light mode toggle
```

#### **Sidebar**
Barra lateral del dashboard con navegación jerárquica.

```typescript
interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  currentPath?: string
  navigation: NavigationItem[]
}

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  children?: NavigationItem[]
  permission?: string
}

// Características:
// - Navegación jerárquica
// - Estados activos automáticos
// - Badges de notificación
// - Permisos por rol
// - Búsqueda rápida
```

#### **Footer**
Pie de página con enlaces y información de la aplicación.

```typescript
interface FooterProps {
  showSocial?: boolean
  showNewsletter?: boolean
  companyInfo?: CompanyInfo
  links?: FooterLink[]
}

// Características:
// - Links organizados por categorías
// - Formulario de newsletter
// - Redes sociales
// - Copyright automático
```

### Componentes de Autenticación

#### **LoginForm**
Formulario de inicio de sesión con validación y estados de carga.

```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void
  onError?: (error: string) => void
  redirectTo?: string
  showSocialLogins?: boolean
}

// Características:
// - Validación en tiempo real
// - Recuperación de contraseña
// - Login social (Google, GitHub)
// - Remember me
// - Rate limiting
// - 2FA support

// Uso
<LoginForm
  onSuccess={(user) => router.push('/dashboard')}
  onError={(error) => toast({ type: "error", title: error })}
  showSocialLogins={true}
/>
```

#### **RegisterForm**
Formulario de registro con validación avanzada y creación de organización.

```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void
  onError?: (error: string) => void
  requireOrganization?: boolean
  inviteCode?: string
}

// Características:
// - Validación de contraseña robusta
// - Verificación de email en tiempo real
// - Creación automática de organización
// - Términos y condiciones
// - Captcha opcional

// Uso
<RegisterForm
  onSuccess={(user) => router.push('/onboarding')}
  requireOrganization={true}
  inviteCode={searchParams.get('invite')}
/>
```

#### **AuthProvider**
Proveedor de contexto para gestión de estado de autenticación.

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

// Uso
const { user, signOut, loading } = useAuth()

if (loading) return <LoadingSpinner />
if (!user) return <LoginForm />
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License

Copyright (c) 2024 La Silla Vacía

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**Hecho con ❤️ por La Silla Vacía**
