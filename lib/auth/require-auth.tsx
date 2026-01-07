import { redirect } from "next/navigation"
import { getCurrentUser, UserRole } from "./user"

interface RequireAuthOptions {
  role?: UserRole | 'both'
  redirectTo?: string
}

/**
 * Componente HOC para proteger rotas que requerem autenticação
 */
export async function requireAuth(options: RequireAuthOptions = {}) {
  const { role = 'both', redirectTo = '/login' } = options
  
  const user = await getCurrentUser()

  if (!user) {
    redirect(redirectTo)
  }

  if (role !== 'both' && user.role !== role) {
    // Redirecionar para a área apropriada
    if (user.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/recepcionista')
    }
  }

  return user
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export async function canAccess(requiredRole: UserRole | 'both'): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  if (requiredRole === 'both') return true
  
  return user.role === requiredRole
}

