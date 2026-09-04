/**
 * Correos con acceso al panel de administración (`/dashboard/admin/*`).
 *
 * Es la única fuente de verdad: la usan tanto la barra lateral para mostrar el
 * acceso como los endpoints de administración para autorizar. El rol `ADMIN`
 * u `OWNER` no basta ahí, porque lo tiene el responsable de cada organización y
 * el panel opera sobre todas.
 */
export const SUPER_ADMIN_EMAILS = [
  "kdelahoz@lasillavacia.com",
  "imontes@lasillavacia.com",
  "jromero@lasillavacia.com",
]

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
