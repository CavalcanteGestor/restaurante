import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Usuario = Database['public']['Tables']['usuarios']['Row']

export type UserRole = 'admin' | 'recepcionista'

export interface UserWithRole extends Usuario {
  role: UserRole
  funcao_nome?: string
}

/**
 * Obtém o usuário atual com sua role
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const supabase = await createClient()
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Buscar dados do usuário na tabela usuarios
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (error || !usuario) {
    return null
  }

  // Determinar role baseado no tipo ou funcao
  let role: UserRole = 'recepcionista'
  let funcao_nome: string | undefined = undefined
  
  if (usuario.tipo === 'admin' || usuario.tipo === 'administrador') {
    role = 'admin'
  } else if (usuario.funcao_id) {
    // Se tem funcao_id, buscar o tipo da função
    const { data: funcao } = await supabase
      .from('funcoes')
      .select('tipo, nome')
      .eq('id', usuario.funcao_id)
      .single()
    
    if (funcao) {
      funcao_nome = funcao.nome
      if (funcao.tipo === 'admin' || funcao.tipo === 'administrador') {
        role = 'admin'
      }
    }
  }

  return {
    ...usuario,
    role,
    funcao_nome,
  }
}

/**
 * Verifica se o usuário tem permissão de admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Verifica se o usuário é recepcionista
 */
export async function isRecepcionista(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'recepcionista'
}

/**
 * Verifica se o usuário tem acesso a uma rota específica
 */
export async function hasAccess(requiredRole: UserRole | 'both'): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  if (requiredRole === 'both') return true
  
  return user.role === requiredRole
}

