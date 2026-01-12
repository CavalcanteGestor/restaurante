import { createClient } from "@/lib/supabase/server"

export type TipoDocumento = 'cardapio' | 'cartela_videos' | 'restaurante'

export interface Documento {
  id: string
  tipo: TipoDocumento
  titulo: string
  descricao: string | null
  arquivo_url: string
  arquivo_nome: string
  arquivo_tamanho: number | null
  ativo: boolean
  ordem: number
  created_at: string | null
  updated_at: string | null
}

export interface DocumentoInsert {
  tipo: TipoDocumento
  titulo: string
  descricao?: string | null
  arquivo_url: string
  arquivo_nome: string
  arquivo_tamanho?: number | null
  ativo?: boolean
  ordem?: number
}

export interface DocumentoUpdate {
  tipo?: TipoDocumento
  titulo?: string
  descricao?: string | null
  arquivo_url?: string
  arquivo_nome?: string
  arquivo_tamanho?: number | null
  ativo?: boolean
  ordem?: number
}

/**
 * Busca todos os documentos ativos de um tipo específico
 */
export async function getDocumentos(tipo?: TipoDocumento): Promise<Documento[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('documentos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (tipo) {
    query = query.eq('tipo', tipo)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []) as Documento[]
}

/**
 * Busca um documento por ID
 */
export async function getDocumentoById(id: string): Promise<Documento | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    throw error
  }

  return data as Documento
}

/**
 * Cria um novo documento
 */
export async function createDocumento(documento: DocumentoInsert): Promise<Documento> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documentos')
    .insert(documento)
    .select()
    .single()

  if (error) throw error

  return data as Documento
}

/**
 * Atualiza um documento existente
 */
export async function updateDocumento(
  id: string,
  documento: DocumentoUpdate
): Promise<Documento> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documentos')
    .update(documento)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Documento
}

/**
 * Remove (desativa) um documento
 */
export async function deleteDocumento(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Busca o documento ativo mais recente de um tipo
 */
export async function getDocumentoAtivoPorTipo(tipo: TipoDocumento): Promise<Documento | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('tipo', tipo)
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as Documento
}
