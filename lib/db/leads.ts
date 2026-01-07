import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

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
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('telefone', telefone)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Lead | null
}

export async function createLead(lead: LeadInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
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
  const { data, error } = await supabase
    .from('leads')
    .update(lead)
    .eq('telefone', telefone)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

