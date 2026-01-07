import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type MensagemAutomatica = Database['public']['Tables']['mensagens_automaticas']['Row']
type MensagemAutomaticaInsert = Database['public']['Tables']['mensagens_automaticas']['Insert']
type MensagemAutomaticaUpdate = Database['public']['Tables']['mensagens_automaticas']['Update']

export async function getMensagensAutomaticas(filters?: {
  reserva_id?: string
  telefone?: string
  tipo?: string
  status?: string
  data_inicio?: string
  data_fim?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('mensagens_automaticas')
    .select('*')
    .order('data_envio', { ascending: false })

  if (filters?.reserva_id) {
    query = query.eq('reserva_id', filters.reserva_id)
  }
  if (filters?.telefone) {
    query = query.eq('telefone', filters.telefone)
  }
  if (filters?.tipo) {
    query = query.eq('tipo', filters.tipo)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.data_inicio) {
    query = query.gte('data_envio', filters.data_inicio)
  }
  if (filters?.data_fim) {
    query = query.lte('data_envio', filters.data_fim)
  }

  // Paginação
  const limit = filters?.limit || 100
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error
  return (data || []) as MensagemAutomatica[]
}

export async function getMensagemAutomaticaById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mensagens_automaticas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as MensagemAutomatica
}

export async function createMensagemAutomatica(mensagem: MensagemAutomaticaInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mensagens_automaticas')
    .insert(mensagem)
    .select()
    .single()

  if (error) throw error
  return data as MensagemAutomatica
}

export async function updateMensagemAutomatica(id: string, mensagem: MensagemAutomaticaUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mensagens_automaticas')
    .update(mensagem)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MensagemAutomatica
}

export async function verificarMensagemJaEnviada(reserva_id: string, tipo: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mensagens_automaticas')
    .select('id')
    .eq('reserva_id', reserva_id)
    .eq('tipo', tipo)
    .eq('status', 'enviada')
    .limit(1)

  if (error) throw error
  return (data?.length || 0) > 0
}

export async function getEstatisticasMensagens(data_inicio?: string, data_fim?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('mensagens_automaticas')
    .select('status, tipo, data_envio')

  if (data_inicio) {
    query = query.gte('data_envio', data_inicio)
  }
  if (data_fim) {
    query = query.lte('data_envio', data_fim)
  }

  const { data, error } = await query

  if (error) throw error

  const total = data?.length || 0
  const enviadas = data?.filter(m => m.status === 'enviada').length || 0
  const erros = data?.filter(m => m.status === 'erro').length || 0
  const hoje = data?.filter(m => {
    const hoje = new Date().toISOString().split('T')[0]
    return m.data_envio?.startsWith(hoje)
  }).length || 0

  return {
    total,
    enviadas,
    erros,
    hoje,
  }
}

