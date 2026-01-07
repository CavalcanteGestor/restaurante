import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Conversa = Database['public']['Tables']['conversas']['Row']

export async function getConversas(filters?: {
  numero?: string
  sessionid?: string
}) {
  const supabase = await createClient()
  let query = supabase.from('conversas').select('*').order('data_mensagem', { ascending: false, nullsFirst: false })

  if (filters?.numero) {
    query = query.eq('numero', filters.numero)
  }
  if (filters?.sessionid) {
    query = query.eq('sessionid', filters.sessionid)
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

