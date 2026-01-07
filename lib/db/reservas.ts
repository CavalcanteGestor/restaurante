import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"
import queryCache, { cacheKeys, cacheTTL } from "@/lib/cache/query-cache"

type Reserva = Database['public']['Tables']['reservas']['Row']
type ReservaInsert = Database['public']['Tables']['reservas']['Insert']
type ReservaUpdate = Database['public']['Tables']['reservas']['Update']

export async function getReservas(filters?: {
  data?: string
  turno?: string
  etapa?: string
  telefone?: string
  limit?: number
}) {
  // Verificar cache
  const cacheKey = cacheKeys.reservas(filters)
  const cached = queryCache.get<Reserva[]>(cacheKey)
  if (cached) {
    return cached
  }

  const supabase = await createClient()
  
  // Select específico para melhor performance
  let query = supabase
    .from('reservas')
    .select('id, nome, telefone, data_reserva, horario_reserva, numero_pessoas, etapa, contexto, created_at, turno, mesas, status_comparecimento')
    .order('data_reserva', { ascending: true })
    .order('horario_reserva', { ascending: true })

  if (filters?.data) {
    query = query.eq('data_reserva', filters.data)
  }
  if (filters?.turno) {
    query = query.eq('turno', filters.turno)
  }
  if (filters?.etapa) {
    query = query.eq('etapa', filters.etapa)
  }
  if (filters?.telefone) {
    query = query.eq('telefone', filters.telefone)
  }

  // Paginação padrão
  const limit = filters?.limit || 100
  query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  
  const result = (data || []) as Reserva[]
  
  // Armazenar no cache
  queryCache.set(cacheKey, result, cacheTTL.reservas)
  
  return result
}

export async function getReservaById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Reserva
}

export async function createReserva(reserva: ReservaInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .insert(reserva)
    .select()
    .single()

  if (error) throw error
  return data as Reserva
}

export async function updateReserva(id: string, reserva: ReservaUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .update(reserva)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Reserva
}

export async function deleteReserva(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reservas')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getReservasByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .gte('data_reserva', startDate)
    .lte('data_reserva', endDate)
    .neq('etapa', 'cancelado') // Excluir reservas canceladas - horário fica livre
    .order('data_reserva', { ascending: true })
    .order('horario_reserva', { ascending: true })

  if (error) throw error
  return data as Reserva[]
}

export async function getReservasAtrasadas() {
  // Verificar cache
  const cacheKey = cacheKeys.reservasAtrasadas()
  const cached = queryCache.get<Reserva[]>(cacheKey)
  if (cached) {
    return cached
  }

  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]
  const agora = new Date()
  const horaAtual = agora.getHours()
  const minutoAtual = agora.getMinutes()
  
  // Select específico e filtro otimizado
  // Excluir reservas canceladas
  const { data, error } = await supabase
    .from('reservas')
    .select('id, nome, telefone, data_reserva, horario_reserva, numero_pessoas, etapa, contexto, created_at, turno, mesas, status_comparecimento')
    .eq('data_reserva', hoje)
    .in('etapa', ['reserva_confirmada', 'confirmado', 'interesse', 'pendente'])
    .neq('etapa', 'cancelado') // Excluir canceladas
    .is('status_comparecimento', null) // Ainda não compareceu
    .or('status_comparecimento.is.null,status_comparecimento.eq.agendado')

  if (error) throw error

  // Filtrar reservas atrasadas (>15 minutos)
  const reservasAtrasadas = (data || []).filter((reserva) => {
    const [hora, minuto] = reserva.horario_reserva.split(':').map(Number)
    const minutosReserva = hora * 60 + minuto
    const minutosAtual = horaAtual * 60 + minutoAtual
    const diferenca = minutosAtual - minutosReserva
    return diferenca >= 15
  }) as Reserva[]

  // Armazenar no cache
  queryCache.set(cacheKey, reservasAtrasadas, cacheTTL.reservasAtrasadas)

  return reservasAtrasadas
}

