import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verificarMensagemJaEnviada, createMensagemAutomatica } from "@/lib/db/mensagens-automaticas"
import { getLeadByTelefone, updateLeadByTelefone } from "@/lib/db/leads"
import { getConfiguracaoMensagem } from "@/lib/db/configuracoes-mensagens"
import { createMensagemAgendada } from "@/lib/db/mensagens-agendadas"

/**
 * POST /api/automatizacoes/verificar-nao-comparecimento
 * Verifica reservas que não compareceram e envia mensagens automáticas
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const hoje = new Date().toISOString().split('T')[0]
    const agora = new Date()
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()

    // Buscar reservas de hoje que ainda estão agendadas
    const { data: reservas, error } = await supabase
      .from('reservas')
      .select('id, nome, telefone, data_reserva, horario_reserva, status_comparecimento, numero_pessoas, mesas')
      .eq('data_reserva', hoje)
      .or('status_comparecimento.is.null,status_comparecimento.eq.agendado')
      .in('etapa', ['reserva_confirmada', 'confirmado', 'interesse', 'pendente'])

    if (error) {
      throw error
    }

    if (!reservas || reservas.length === 0) {
      return NextResponse.json({
        success: true,
        mensagensEnviadas: 0,
        reservasVerificadas: 0,
        mensagem: "Nenhuma reserva para verificar",
      })
    }

    let mensagensEnviadas = 0
    let erros = 0
    const resultados: Array<{
      reserva_id: string
      nome: string
      telefone: string
      status: 'enviada' | 'erro' | 'ignorada'
      motivo?: string
    }> = []

    for (const reserva of reservas) {
      try {
        // Calcular minutos de atraso
        const [hora, minuto] = reserva.horario_reserva.split(':').map(Number)
        const minutosReserva = hora * 60 + minuto
        const minutosAtual = horaAtual * 60 + minutoAtual
        const diferenca = minutosAtual - minutosReserva

        // Criar mensagens agendadas para múltiplos horários (15, 30, 60 minutos)
        const horariosAtraso = [15, 30, 60]
        let mensagensCriadas = 0

        // Buscar template configurado
        const configMensagem = await getConfiguracaoMensagem('nao_comparecimento')
        const template = configMensagem?.template || 
          'Olá {nome}! Notamos que você tinha uma reserva para hoje às {horario_reserva} e ainda não chegou. Você ainda vai conseguir vir? Se precisar remarcar ou cancelar, estamos à disposição! 😊'

        for (const minutosAtraso of horariosAtraso) {
          if (diferenca >= minutosAtraso) {
            // Calcular horário de envio (horário da reserva + minutos de atraso)
            const horarioReserva = new Date()
            horarioReserva.setHours(hora, minuto, 0, 0)
            const horarioEnvio = new Date(horarioReserva)
            horarioEnvio.setMinutes(horarioEnvio.getMinutes() + minutosAtraso)

            // Verificar se já existe mensagem agendada para este horário
            const { data: existente } = await supabase
              .from('mensagens_agendadas')
              .select('id')
              .eq('reserva_id', reserva.id)
              .eq('tipo', 'atraso')
              .eq('status', 'pendente')
              .gte('agendado_para', horarioEnvio.toISOString())
              .lt('agendado_para', new Date(horarioEnvio.getTime() + 60000).toISOString())
              .maybeSingle()

            if (!existente) {
              // Criar mensagem agendada
              await createMensagemAgendada({
                reserva_id: reserva.id,
                telefone: reserva.telefone,
                nome: reserva.nome,
                tipo: 'atraso',
                mensagem: template,
                agendado_para: horarioEnvio.toISOString(),
                status: 'pendente',
              })
              mensagensCriadas++
            }
          }
        }

        if (mensagensCriadas > 0) {
          mensagensEnviadas += mensagensCriadas
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'enviada',
            motivo: `${mensagensCriadas} mensagem(ns) agendada(s)`,
          })
        } else if (diferenca < 15) {
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'ignorada',
            motivo: `Ainda não passou 15 minutos (${diferenca} min)`,
          })
        } else {
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'ignorada',
            motivo: 'Mensagens já agendadas anteriormente',
          })
        }
      } catch (error: any) {
        console.error(`[Verificar Não Comparecimento] Erro ao processar reserva ${reserva.id}:`, error)
        erros++
        resultados.push({
          reserva_id: reserva.id,
          nome: reserva.nome,
          telefone: reserva.telefone,
          status: 'erro',
          motivo: error.message || 'Erro desconhecido',
        })
      }
    }

    return NextResponse.json({
      success: true,
      mensagensEnviadas,
      erros,
      reservasVerificadas: reservas.length,
      resultados,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Verificar Não Comparecimento] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao verificar não comparecimento",
      },
      { status: 500 }
    )
  }
}

