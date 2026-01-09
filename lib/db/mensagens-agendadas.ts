import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type MensagemAgendada = Database['public']['Tables']['mensagens_agendadas']['Row']
type MensagemAgendadaInsert = Database['public']['Tables']['mensagens_agendadas']['Insert']
type MensagemAgendadaUpdate = Database['public']['Tables']['mensagens_agendadas']['Update']

export interface FiltrosMensagensAgendadas {
  status?: 'pendente' | 'enviada' | 'cancelada' | 'erro'
  tipo?: 'confirmacao' | 'cancelamento' | 'atraso' | 'lembrete'
  reserva_id?: string
  telefone?: string
  data_inicio?: string
  data_fim?: string
}

export async function getMensagensAgendadas(filters?: FiltrosMensagensAgendadas) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('mensagens_agendadas')
      .select('*')
      .order('agendado_para', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo)
    }
    if (filters?.reserva_id) {
      query = query.eq('reserva_id', filters.reserva_id)
    }
    if (filters?.telefone) {
      query = query.eq('telefone', filters.telefone)
    }
    if (filters?.data_inicio) {
      query = query.gte('agendado_para', filters.data_inicio)
    }
    if (filters?.data_fim) {
      query = query.lte('agendado_para', filters.data_fim)
    }

    const { data, error } = await query

    if (error) {
      // Se a tabela não existe ainda, retornar array vazio
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn("Tabela mensagens_agendadas ainda não existe. Execute a migration SQL.")
        return []
      }
      throw error
    }
    return (data || []) as MensagemAgendada[]
  } catch (error: any) {
    console.error("Erro ao buscar mensagens agendadas:", error)
    // Retornar array vazio em caso de erro para não quebrar a página
    return []
  }
}

export async function getMensagensParaExecutar() {
  const supabase = await createClient()
  const agora = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('mensagens_agendadas')
    .select('*')
    .eq('status', 'pendente')
    .lte('agendado_para', agora)
    .order('agendado_para', { ascending: true })

  if (error) throw error
  return (data || []) as MensagemAgendada[]
}

export async function createMensagemAgendada(data: MensagemAgendadaInsert) {
  const supabase = await createClient()
  
  const { data: mensagem, error } = await supabase
    .from('mensagens_agendadas')
    .insert({
      ...data,
      status: data.status || 'pendente',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return mensagem as MensagemAgendada
}

export async function updateMensagemAgendada(id: string, updates: MensagemAgendadaUpdate) {
  const supabase = await createClient()
  
  const { data: mensagem, error } = await supabase
    .from('mensagens_agendadas')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mensagem as MensagemAgendada
}

export async function deleteMensagemAgendada(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('mensagens_agendadas')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getMensagemAgendadaById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('mensagens_agendadas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as MensagemAgendada
}

