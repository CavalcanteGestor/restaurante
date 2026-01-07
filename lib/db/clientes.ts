import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Reserva = Database['public']['Tables']['reservas']['Row']

export interface Cliente {
  telefone: string
  nome: string
  totalReservas: number
  primeiraReserva: string
  ultimaReserva: string
  reservas: Reserva[]
}

/**
 * Busca todos os clientes únicos baseado nas reservas
 */
export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient()
  
  // Buscar todas as reservas
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*')
    .order('data_reserva', { ascending: false })
    .order('horario_reserva', { ascending: false })

  if (error) throw error

  // Agrupar por telefone
  const clientesMap = new Map<string, Cliente>()

  reservas?.forEach((reserva) => {
    const telefone = reserva.telefone
    if (!telefone) return

    if (!clientesMap.has(telefone)) {
      clientesMap.set(telefone, {
        telefone,
        nome: reserva.nome,
        totalReservas: 0,
        primeiraReserva: reserva.data_reserva,
        ultimaReserva: reserva.data_reserva,
        reservas: [],
      })
    }

    const cliente = clientesMap.get(telefone)!
    cliente.totalReservas++
    cliente.reservas.push(reserva)

    // Atualizar primeira e última reserva
    if (reserva.data_reserva < cliente.primeiraReserva) {
      cliente.primeiraReserva = reserva.data_reserva
    }
    if (reserva.data_reserva > cliente.ultimaReserva) {
      cliente.ultimaReserva = reserva.data_reserva
    }
  })

  // Converter para array e ordenar por última reserva
  return Array.from(clientesMap.values()).sort((a, b) => {
    return new Date(b.ultimaReserva).getTime() - new Date(a.ultimaReserva).getTime()
  })
}

/**
 * Busca um cliente específico pelo telefone
 */
export async function getClienteByTelefone(telefone: string): Promise<Cliente | null> {
  const supabase = await createClient()
  
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('telefone', telefone)
    .order('data_reserva', { ascending: false })
    .order('horario_reserva', { ascending: false })

  if (error) throw error
  if (!reservas || reservas.length === 0) return null

  const primeiraReserva = reservas[reservas.length - 1].data_reserva
  const ultimaReserva = reservas[0].data_reserva

  return {
    telefone,
    nome: reservas[0].nome,
    totalReservas: reservas.length,
    primeiraReserva,
    ultimaReserva,
    reservas,
  }
}

