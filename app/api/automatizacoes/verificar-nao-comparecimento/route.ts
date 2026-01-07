import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verificarMensagemJaEnviada, createMensagemAutomatica } from "@/lib/db/mensagens-automaticas"
import { getLeadByTelefone, updateLeadByTelefone } from "@/lib/db/leads"
import { getConfiguracaoMensagem, processarTemplate } from "@/lib/db/configuracoes-mensagens"
import { evolutionApi } from "@/lib/evolution-api/client"

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

        // Verificar se passou 15 minutos
        if (diferenca < 15) {
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'ignorada',
            motivo: `Ainda não passou 15 minutos (${diferenca} min)`,
          })
          continue
        }

        // Verificar se já foi enviada mensagem para esta reserva
        const jaEnviada = await verificarMensagemJaEnviada(reserva.id, 'nao_comparecimento')
        if (jaEnviada) {
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'ignorada',
            motivo: 'Mensagem já enviada anteriormente',
          })
          continue
        }

        // Buscar template configurado
        const configMensagem = await getConfiguracaoMensagem('nao_comparecimento')
        
        // Se não houver configuração, usar template padrão
        const template = configMensagem?.template || 
          'Olá {nome}! Notamos que você tinha uma reserva para hoje às {horario_reserva} e ainda não chegou. Você ainda vai conseguir vir? Se precisar remarcar ou cancelar, estamos à disposição! 😊'
        
        // Processar template com dados da reserva
        const mensagem = processarTemplate(template, {
          nome: reserva.nome,
          horario_reserva: reserva.horario_reserva,
          data_reserva: reserva.data_reserva,
          numero_pessoas: reserva.numero_pessoas,
          mesas: reserva.mesas || undefined,
        })

        // Enviar mensagem via Evolution API
        try {
          await evolutionApi.sendText({
            number: reserva.telefone,
            text: mensagem,
          })

          // Registrar mensagem enviada
          await createMensagemAutomatica({
            reserva_id: reserva.id,
            telefone: reserva.telefone,
            nome: reserva.nome,
            mensagem,
            tipo: 'nao_comparecimento',
            status: 'enviada',
            data_envio: new Date().toISOString(),
          })

          // Atualizar contexto do lead
          const lead = await getLeadByTelefone(reserva.telefone)
          if (lead) {
            const contexto = `Cliente não compareceu em ${reserva.data_reserva} às ${reserva.horario_reserva}. Mensagem automática de não comparecimento enviada após 15 minutos de atraso.`
            await updateLeadByTelefone(reserva.telefone, {
              contexto: lead.contexto ? `${lead.contexto}\n\n${contexto}` : contexto,
              data_ultima_msg: new Date().toISOString(),
            })
          }

          mensagensEnviadas++
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'enviada',
          })
        } catch (errorEnvio: any) {
          // Registrar erro
          await createMensagemAutomatica({
            reserva_id: reserva.id,
            telefone: reserva.telefone,
            nome: reserva.nome,
            mensagem,
            tipo: 'nao_comparecimento',
            status: 'erro',
            erro: errorEnvio.message || 'Erro ao enviar mensagem',
            data_envio: new Date().toISOString(),
          })

          erros++
          resultados.push({
            reserva_id: reserva.id,
            nome: reserva.nome,
            telefone: reserva.telefone,
            status: 'erro',
            motivo: errorEnvio.message || 'Erro ao enviar mensagem',
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

