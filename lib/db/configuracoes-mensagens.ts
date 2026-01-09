import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type ConfiguracaoMensagem = Database['public']['Tables']['configuracoes_mensagens']['Row']
type ConfiguracaoMensagemInsert = Database['public']['Tables']['configuracoes_mensagens']['Insert']
type ConfiguracaoMensagemUpdate = Database['public']['Tables']['configuracoes_mensagens']['Update']

export async function getConfiguracaoMensagem(tipo: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('configuracoes_mensagens')
    .select('*')
    .eq('tipo', tipo)
    .eq('ativo', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ConfiguracaoMensagem | null
}

export async function getAllConfiguracoesMensagens() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('configuracoes_mensagens')
    .select('*')
    .order('tipo', { ascending: true })

  if (error) throw error
  return (data || []) as ConfiguracaoMensagem[]
}

export async function createConfiguracaoMensagem(config: ConfiguracaoMensagemInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('configuracoes_mensagens')
    .insert(config)
    .select()
    .single()

  if (error) throw error
  return data as ConfiguracaoMensagem
}

export async function updateConfiguracaoMensagem(id: string, config: ConfiguracaoMensagemUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('configuracoes_mensagens')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ConfiguracaoMensagem
}

export async function deleteConfiguracaoMensagem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('configuracoes_mensagens')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Processa template de mensagem substituindo placeholders
 */
export function processarTemplate(
  template: string,
  dados: {
    nome: string
    horario_reserva?: string
    data_reserva?: string
    numero_pessoas?: number
    mesas?: string
    data_atual?: string
    telefone?: string
  }
): string {
  let mensagem = template

  // Substituir placeholders
  mensagem = mensagem.replace(/{nome}/g, dados.nome)
  mensagem = mensagem.replace(/{horario_reserva}/g, dados.horario_reserva || '')
  mensagem = mensagem.replace(/{data_reserva}/g, dados.data_reserva || '')
  mensagem = mensagem.replace(/{numero_pessoas}/g, dados.numero_pessoas?.toString() || '')
  mensagem = mensagem.replace(/{mesas}/g, dados.mesas || '')
  mensagem = mensagem.replace(/{data_atual}/g, dados.data_atual || new Date().toLocaleDateString('pt-BR'))
  mensagem = mensagem.replace(/{telefone}/g, dados.telefone || '')

  return mensagem
}

