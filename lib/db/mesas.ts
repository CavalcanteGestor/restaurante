import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Mesa = Database['public']['Tables']['mesas']['Row']
type MesaInsert = Database['public']['Tables']['mesas']['Insert']
type MesaUpdate = Database['public']['Tables']['mesas']['Update']

export async function getMesas(filters?: {
  andar?: string
  ambiente?: string
  tipo?: string
  disponivel?: boolean
}) {
  const supabase = await createClient()
  let query = supabase.from('mesas').select('*').order('codigo', { ascending: true })

  if (filters?.andar) {
    query = query.eq('andar', filters.andar)
  }
  if (filters?.ambiente) {
    query = query.eq('ambiente', filters.ambiente)
  }
  if (filters?.tipo) {
    query = query.eq('tipo', filters.tipo)
  }
  if (filters?.disponivel !== undefined) {
    query = query.eq('disponivel', filters.disponivel)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Mesa[]
}

export async function getMesaById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Mesa
}

export async function getMesaByCodigo(codigo: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('codigo', codigo)
    .single()

  if (error) throw error
  return data as Mesa
}

export async function updateMesa(id: string, mesa: MesaUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mesas')
    .update(mesa)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Mesa
}

export async function getMesasDisponiveis(
  dataReserva: string,
  turno: string,
  numeroPessoas: number,
  tipoUso?: 'pessoal' | 'corporativo' | 'evento'
) {
  const supabase = await createClient()
  
  // Buscar todas as mesas disponíveis
  const { data: mesas, error: mesasError } = await supabase
    .from('mesas')
    .select('*')
    .eq('disponivel', true)

  if (mesasError) throw mesasError
  if (!mesas) return []

  // Buscar reservas para a data e turno
  const { data: reservas, error: reservasError } = await supabase
    .from('reservas')
    .select('*')
    .eq('data_reserva', dataReserva)
    .eq('turno', turno)
    .eq('etapa', 'reserva_confirmada')

  if (reservasError) throw reservasError

  // Mesas ocupadas
  const mesasOcupadas = new Set<string>()
  reservas?.forEach((reserva) => {
    if (reserva.mesas) {
      reserva.mesas.split('+').forEach((mesa: string) => {
        mesasOcupadas.add(mesa.trim())
      })
    }
  })

  // Filtrar mesas disponíveis aplicando regras
  const mesasDisponiveis = mesas.filter((mesa) => {
    // Não está ocupada
    if (mesasOcupadas.has(mesa.codigo)) return false

    // Capacidade suficiente
    if (mesa.capacidade < numeroPessoas) return false

    // Aplicar regras MCPS baseadas no tipo de uso
    if (tipoUso === 'evento') {
      // Para eventos, apenas mesas que permitem eventos
      if (!mesa.eventos_pessoais && !mesa.eventos_corporativos && !mesa.so_eventos) {
        return false
      }
    } else if (tipoUso === 'corporativo') {
      // Para corporativo, não pode ser apenas pessoal
      if (mesa.so_eventos) return false
      if (!mesa.eventos_corporativos && mesa.eventos_pessoais) return false
    } else if (tipoUso === 'pessoal') {
      // Para pessoal, não pode ser apenas eventos
      if (mesa.so_eventos) return false
    }

    return true
  })

  return mesasDisponiveis as Mesa[]
}

