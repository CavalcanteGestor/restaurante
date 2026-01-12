import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Auditoria = Database['public']['Tables']['auditoria']['Row']
type AuditoriaInsert = Database['public']['Tables']['auditoria']['Insert']

export interface AuditoriaFilters {
  user_id?: string
  module?: string
  action?: string
  data_inicio?: string
  data_fim?: string
  limit?: number
}

/**
 * Busca registros de auditoria
 */
export async function getAuditoria(filters?: AuditoriaFilters): Promise<Auditoria[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('auditoria')
    .select('*')
    .order('timestamp', { ascending: false })

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  if (filters?.module) {
    query = query.eq('module', filters.module)
  }

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  if (filters?.data_inicio) {
    query = query.gte('timestamp', filters.data_inicio)
  }

  if (filters?.data_fim) {
    query = query.lte('timestamp', filters.data_fim)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  } else {
    query = query.limit(100)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar auditoria:", error)
    return []
  }

  return (data || []) as Auditoria[]
}

/**
 * Cria um registro de auditoria
 */
export async function createAuditoria(auditoria: AuditoriaInsert): Promise<Auditoria> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('auditoria')
    .insert({
      ...auditoria,
      user_id: auditoria.user_id || user?.id || null,
      timestamp: auditoria.timestamp || new Date().toISOString(),
      created_at: auditoria.created_at || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Auditoria
}

/**
 * Helper para criar registro de auditoria com metadata
 * Aceita NextRequest opcional para capturar IP e User-Agent
 */
export async function logAuditoria(
  action: string,
  module: string,
  description?: string,
  record_id?: string,
  metadata?: Record<string, any>,
  request?: { headers: Headers } | null
): Promise<void> {
  try {
    const headers = request?.headers
    
    // Extrair IP (suporta headers do Vercel e padrão)
    let ipAddress: string | null = null
    if (headers) {
      ipAddress = headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                  headers.get('x-real-ip') ||
                  null
    }

    // Extrair User-Agent
    const userAgent = headers?.get('user-agent') || null

    await createAuditoria({
      action,
      module,
      description: description || null,
      record_id: record_id || null,
      metadata: metadata || null,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error)
    // Não lançar erro para não quebrar o fluxo principal
  }
}
