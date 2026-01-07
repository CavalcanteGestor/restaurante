import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Mesa = Database['public']['Tables']['mesas']['Row']

export interface SolucaoMesa {
  mesas: string[] // Códigos das mesas
  capacidadeTotal: number
  descricao: string
  tipo: 'individual' | 'combinada'
  ambiente?: string
}

// Mapeamento de combinações permitidas baseado nas regras
const combinacoesPermitidas: Record<string, { mesas: string[], capacidadeMax: number, descricao: string }[]> = {
  // Cristal - Mesas 8, 9, 10, 11
  'cristal_8_11': [{ mesas: ['Mesa 8', 'Mesa 11'], capacidadeMax: 10, descricao: 'Mesa 8 + Mesa 11 (até 10 pessoas)' }],
  'cristal_9_10': [{ mesas: ['Mesa 9', 'Mesa 10'], capacidadeMax: 10, descricao: 'Mesa 9 + Mesa 10 (até 10 pessoas)' }],
  'cristal_8_9_10_11': [{ mesas: ['Mesa 8', 'Mesa 9', 'Mesa 10', 'Mesa 11'], capacidadeMax: 16, descricao: 'Mesas 8, 9, 10, 11 em quadrado (16 pessoas)' }],
  'cristal_8_11_9_10': [{ mesas: ['Mesa 8', 'Mesa 11', 'Mesa 9', 'Mesa 10'], capacidadeMax: 20, descricao: 'Mesas 8+11 e 9+10 (20 pessoas - reserva exclusiva)' }],
  
  // Bandeira - Mesas 12, 13, 14
  'bandeira_12_13_14': [{ mesas: ['Mesa 12', 'Mesa 13', 'Mesa 14'], capacidadeMax: 12, descricao: 'Mesas 12, 13, 14 juntas (até 12 pessoas)' }],
  
  // Cinema - Mesas 25, 26
  'cinema_25_26': [{ mesas: ['Mesa 25', 'Mesa 26'], capacidadeMax: 10, descricao: 'Mesa 25 + Mesa 26 (até 10 pessoas)' }],
  
  // Opera - Várias combinações
  'opera_27_28_29': [{ mesas: ['Mesa 27', 'Mesa 28', 'Mesa 29'], capacidadeMax: 8, descricao: 'Mesas 27, 28, 29 (até 8 pessoas)' }],
  'opera_30_33': [{ mesas: ['Mesa 30', 'Mesa 33'], capacidadeMax: 6, descricao: 'Mesa 30 + Mesa 33 (até 6 pessoas)' }],
  'opera_28_29_34': [{ mesas: ['Mesa 28', 'Mesa 29', 'Mesa 34'], capacidadeMax: 8, descricao: 'Mesas 28, 29, 34 (até 8 pessoas)' }],
  
  // Palio di Siena
  'palio_35_36': [{ mesas: ['Mesa 35', 'Mesa 36'], capacidadeMax: 4, descricao: 'Mesa 35 + Mesa 36 (4 pessoas)' }],
  'palio_37_38': [{ mesas: ['Mesa 37', 'Mesa 38'], capacidadeMax: 4, descricao: 'Mesa 37 + Mesa 38 (4 pessoas)' }],
  'palio_35_36_37_38': [{ mesas: ['Mesa 35', 'Mesa 36', 'Mesa 37', 'Mesa 38'], capacidadeMax: 12, descricao: 'Todas as mesas Palio (até 12 pessoas)' }],
}

export async function getSugestoesMesas(
  dataReserva: string,
  turno: string,
  numeroPessoas: number,
  tipoUso: 'pessoal' | 'corporativo' | 'evento' = 'pessoal'
): Promise<SolucaoMesa[]> {
  const supabase = await createClient()
  const solucoes: SolucaoMesa[] = []

  // Buscar todas as mesas
  const { data: mesas, error: mesasError } = await supabase
    .from('mesas')
    .select('*')
    .eq('disponivel', true)

  if (mesasError || !mesas) return []

  // Buscar reservas para a data e turno
  const { data: reservas } = await supabase
    .from('reservas')
    .select('*')
    .eq('data_reserva', dataReserva)
    .eq('turno', turno)
    .eq('etapa', 'reserva_confirmada')

  // Mesas ocupadas
  const mesasOcupadas = new Set<string>()
  reservas?.forEach((reserva) => {
    if (reserva.mesas) {
      reserva.mesas.split('+').forEach((mesa: string) => {
        mesasOcupadas.add(mesa.trim())
      })
    }
  })

  // Filtrar mesas disponíveis
  const mesasDisponiveis = mesas.filter((mesa) => {
    if (mesasOcupadas.has(mesa.codigo)) return false
    
    // Aplicar regras de tipo de uso
    if (tipoUso === 'evento') {
      if (!mesa.eventos_pessoais && !mesa.eventos_corporativos && !mesa.so_eventos) return false
    } else if (tipoUso === 'corporativo') {
      if (mesa.so_eventos) return false
      if (!mesa.eventos_corporativos && mesa.eventos_pessoais) return false
    } else if (tipoUso === 'pessoal') {
      if (mesa.so_eventos) return false
    }

    return true
  })

  // 1. Soluções com mesas individuais (apenas se capacidade suficiente)
  mesasDisponiveis.forEach((mesa) => {
    if (mesa.capacidade >= numeroPessoas) {
      // Verificar se não está ocupada
      if (!mesasOcupadas.has(mesa.codigo)) {
        solucoes.push({
          mesas: [mesa.codigo],
          capacidadeTotal: mesa.capacidade,
          descricao: `${mesa.codigo} (${mesa.capacidade} lugares) - ${mesa.ambiente || 'N/A'}`,
          tipo: 'individual',
          ambiente: mesa.ambiente || undefined,
        })
      }
    }
  })

  // 2. Soluções combinadas (juntar mesas)
  const mesasPorAmbiente: Record<string, Mesa[]> = {}
  mesasDisponiveis.forEach((mesa) => {
    const ambiente = mesa.ambiente || 'outros'
    if (!mesasPorAmbiente[ambiente]) {
      mesasPorAmbiente[ambiente] = []
    }
    mesasPorAmbiente[ambiente].push(mesa)
  })

  // Verificar combinações específicas
  Object.entries(combinacoesPermitidas).forEach(([key, combinacoes]) => {
    combinacoes.forEach((combinacao) => {
      // Verificar se todas as mesas da combinação estão disponíveis
      const todasDisponiveis = combinacao.mesas.every((codigo) => {
        const mesa = mesasDisponiveis.find((m) => m.codigo === codigo)
        return mesa && !mesasOcupadas.has(codigo)
      })

      if (todasDisponiveis && combinacao.capacidadeMax >= numeroPessoas) {
        const mesasCombinacao = combinacao.mesas.map((codigo) => {
          return mesasDisponiveis.find((m) => m.codigo === codigo)!
        })

        const capacidadeTotal = mesasCombinacao.reduce((sum, m) => sum + m.capacidade, 0)
        const ambiente = mesasCombinacao[0]?.ambiente || ''

        solucoes.push({
          mesas: combinacao.mesas,
          capacidadeTotal,
          descricao: combinacao.descricao,
          tipo: 'combinada',
          ambiente,
        })
      }
    })
  })

  // 3. Buscar combinações dinâmicas baseadas em junta_com
  mesasDisponiveis.forEach((mesa) => {
    if (mesa.pode_juntar && mesa.junta_com) {
      const mesasParaJuntar = mesa.junta_com.split(',').map((m: string) => m.trim())
      
      mesasParaJuntar.forEach((codigoCombinacao: string) => {
        const mesaCombinacao = mesasDisponiveis.find((m) => m.codigo === codigoCombinacao)
        
        // Verificar se ambas as mesas estão disponíveis e não ocupadas
        if (mesaCombinacao && 
            !mesasOcupadas.has(mesa.codigo) && 
            !mesasOcupadas.has(codigoCombinacao)) {
          const capacidadeTotal = mesa.capacidade + mesaCombinacao.capacidade
          
          if (capacidadeTotal >= numeroPessoas) {
            const codigos = [mesa.codigo, codigoCombinacao].sort()
            const descricao = `${mesa.codigo} + ${codigoCombinacao} (${capacidadeTotal} lugares)`
            
            // Evitar duplicatas
            const jaExiste = solucoes.some(
              (s) => s.mesas.length === codigos.length && 
              s.mesas.every((m) => codigos.includes(m))
            )

            if (!jaExiste) {
              solucoes.push({
                mesas: codigos,
                capacidadeTotal,
                descricao,
                tipo: 'combinada',
                ambiente: mesa.ambiente || undefined,
              })
            }
          }
        }
      })
    }
  })

  // Ordenar: primeiro individuais, depois combinadas, por capacidade (menor primeiro)
  solucoes.sort((a, b) => {
    if (a.tipo !== b.tipo) {
      return a.tipo === 'individual' ? -1 : 1
    }
    return a.capacidadeTotal - b.capacidadeTotal
  })

  return solucoes
}

