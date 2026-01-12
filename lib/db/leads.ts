import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"
import { normalizeTelefone } from "@/lib/utils/telefone"

type Lead = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

export async function getLeads(filters?: {
  etapa?: string
  telefone?: string
}) {
  const supabase = await createClient()
  let query = supabase.from('leads').select('*').order('data_ultima_msg', { ascending: false, nullsFirst: false })

  if (filters?.etapa) {
    query = query.eq('etapa', filters.etapa)
  }
  if (filters?.telefone) {
    query = query.eq('telefone', filters.telefone)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as Lead[]
}

export async function getLeadById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Lead
}

export async function getLeadByTelefone(telefone: string) {
  const supabase = await createClient()
  const telefoneNormalizado = normalizeTelefone(telefone)
  
  if (!telefoneNormalizado) {
    return null
  }

  // Buscar com telefone normalizado
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('telefone', telefoneNormalizado)
    .single()

  if (error && error.code !== 'PGRST116') {
    // Se não encontrou com formato normalizado, tentar buscar todos e filtrar
    // (para lidar com leads já existentes em formatos diferentes)
    const { data: allLeads, error: searchError } = await supabase
      .from('leads')
      .select('*')
    
    if (searchError) throw searchError
    
    // Normalizar telefones dos leads existentes e encontrar match
    const leadEncontrado = (allLeads || []).find(lead => {
      const leadTelNormalizado = normalizeTelefone(lead.telefone)
      return leadTelNormalizado === telefoneNormalizado
    })
    
    return leadEncontrado as Lead | null
  }
  
  return data as Lead | null
}

export async function createLead(lead: LeadInsert) {
  const supabase = await createClient()
  
  // Normalizar telefone antes de criar
  const telefoneNormalizado = lead.telefone ? normalizeTelefone(lead.telefone) : null
  
  if (!telefoneNormalizado) {
    throw new Error('Telefone é obrigatório e deve ser válido')
  }

  // Verificar se já existe um lead com esse telefone (normalizado)
  const leadExistente = await getLeadByTelefone(telefoneNormalizado)
  if (leadExistente) {
    // Se já existe, atualizar ao invés de criar
    return await updateLeadByTelefone(telefoneNormalizado, lead)
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...lead,
      telefone: telefoneNormalizado,
    })
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLead(id: number, lead: LeadUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .update(lead)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLeadByTelefone(telefone: string, lead: LeadUpdate) {
  const supabase = await createClient()
  const telefoneNormalizado = normalizeTelefone(telefone)
  
  if (!telefoneNormalizado) {
    throw new Error('Telefone inválido')
  }

  // Primeiro, buscar o lead (pode estar em formato diferente)
  const leadExistente = await getLeadByTelefone(telefone)
  
  if (!leadExistente) {
    throw new Error('Lead não encontrado')
  }

  // Atualizar usando o ID (mais confiável que telefone)
  const { data, error } = await supabase
    .from('leads')
    .update({
      ...lead,
      // Garantir que o telefone seja sempre normalizado
      telefone: telefoneNormalizado,
    })
    .eq('id', leadExistente.id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

