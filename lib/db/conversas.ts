import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Conversa = Database['public']['Tables']['conversas']['Row']

export async function getConversas(filters?: {
  numero?: string
  sessionid?: string
  tipo_mensagem?: string
  conversation_id?: string
}) {
  const supabase = await createClient()
  let query = supabase.from('conversas').select('*').order('data_mensagem', { ascending: false, nullsFirst: false })

  if (filters?.numero) {
    query = query.eq('numero', filters.numero)
  }
  if (filters?.sessionid) {
    query = query.eq('sessionid', filters.sessionid)
  }
  if (filters?.tipo_mensagem) {
    query = query.eq('tipo_mensagem', filters.tipo_mensagem)
  }
  if (filters?.conversation_id) {
    query = query.eq('conversation_id', filters.conversation_id)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as Conversa[]
}

export async function getConversasByTelefone(telefone: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('conversas')
    .select('*')
    .eq('numero', telefone)
    .order('data_mensagem', { ascending: true })

  if (error) throw error
  return data as Conversa[]
}

export interface EstatisticasConversas {
  total: number
  mensagensIA: number
  mensagensLead: number
  mensagensHumano: number
  mensagensAutomaticas: number
  porTipo: Record<string, number>
  tempoMedioResposta?: number
}

export async function getEstatisticasConversas(
  dataInicio?: string,
  dataFim?: string
): Promise<EstatisticasConversas> {
  const supabase = await createClient()
  
  let query = supabase.from('conversas').select('*')
  
  if (dataInicio) {
    query = query.gte('data_mensagem', dataInicio)
  }
  if (dataFim) {
    query = query.lte('data_mensagem', dataFim)
  }

  const { data, error } = await query

  if (error) throw error

  const conversas = (data || []) as Conversa[]

  const estatisticas: EstatisticasConversas = {
    total: conversas.length,
    mensagensIA: conversas.filter(c => c.mensagem_ia && !c.mensagem_lead).length,
    mensagensLead: conversas.filter(c => c.mensagem_lead && !c.mensagem_ia).length,
    mensagensHumano: conversas.filter(c => 
      c.tipo_mensagem?.includes('ATENDENTE') || 
      c.tipo_mensagem === 'ATENDENTEHUMANARESPONDEU' ||
      c.tipo_mensagem === 'HUMANO'
    ).length,
    mensagensAutomaticas: conversas.filter(c => 
      c.tipo_mensagem?.includes('AUTOMATICA') || 
      c.tipo_mensagem === 'nao_comparecimento'
    ).length,
    porTipo: {}
  }

  // Agrupar por tipo_mensagem
  conversas.forEach(conv => {
    const tipo = conv.tipo_mensagem || 'sem_tipo'
    estatisticas.porTipo[tipo] = (estatisticas.porTipo[tipo] || 0) + 1
  })

  // Calcular tempo médio de resposta (diferença entre mensagem_lead e mensagem_ia subsequente)
  let temposResposta: number[] = []
  for (let i = 0; i < conversas.length - 1; i++) {
    const atual = conversas[i]
    const proxima = conversas[i + 1]
    
    if (atual.mensagem_lead && atual.data_mensagem && 
        proxima.mensagem_ia && proxima.data_mensagem &&
        atual.numero === proxima.numero) {
      const tempo = new Date(proxima.data_mensagem).getTime() - new Date(atual.data_mensagem).getTime()
      if (tempo > 0 && tempo < 3600000) { // Menos de 1 hora
        temposResposta.push(tempo)
      }
    }
  }

  if (temposResposta.length > 0) {
    const tempoMedio = temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length
    estatisticas.tempoMedioResposta = tempoMedio / 1000 / 60 // Convertido para minutos
  }

  return estatisticas
}

