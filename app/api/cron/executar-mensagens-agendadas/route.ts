import { NextRequest, NextResponse } from "next/server"
import { getMensagensParaExecutar, updateMensagemAgendada } from "@/lib/db/mensagens-agendadas"
import { getReservaById } from "@/lib/db/reservas"
import { processarTemplate } from "@/lib/db/configuracoes-mensagens"
import { evolutionApi } from "@/lib/evolution-api/client"
import { createClient } from "@/lib/supabase/server"
import { getReservasAtrasadas } from "@/lib/db/reservas"
import { createMensagemAgendada } from "@/lib/db/mensagens-agendadas"
import { getConfiguracaoMensagem } from "@/lib/db/configuracoes-mensagens"
import { formatDate } from "@/lib/utils/date"

/**
 * Cron job para executar mensagens agendadas
 * Executa mensagens pendentes cujo agendado_para já passou
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (cron job do Vercel ou webhook seguro)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Criar mensagens automáticas para reservas (lembrete, atraso, etc)
    const { criadas: mensagensCriadas } = await criarMensagensAutomaticasParaReservas()
    
    // Buscar mensagens para executar
    const mensagens = await getMensagensParaExecutar()

    if (mensagens.length === 0) {
      return NextResponse.json({
        success: true,
        mensagensEnviadas: 0,
        mensagensCriadas,
        mensagem: "Nenhuma mensagem agendada para executar",
      })
    }

    let sucesso = 0
    let erros = 0
    const resultados: Array<{
      id: string
      telefone: string
      status: 'sucesso' | 'erro'
      erro?: string
    }> = []

    // Verificar se Evolution API está configurada
    if (!evolutionApi.isConfigured()) {
      throw new Error("Evolution API não configurada")
    }

    const isConnected = await evolutionApi.isConnected()
    if (!isConnected) {
      throw new Error("Instância do WhatsApp não está conectada")
    }

    // Processar cada mensagem
    for (const msg of mensagens) {
      try {
        // Buscar dados da reserva se houver
        let dadosReserva: any = {
          nome: msg.nome,
          telefone: msg.telefone,
          data_atual: new Date().toLocaleDateString('pt-BR'),
        }

        if (msg.reserva_id) {
          const reserva = await getReservaById(msg.reserva_id)
          if (reserva) {
            dadosReserva = {
              ...dadosReserva,
              data_reserva: formatDate(reserva.data_reserva),
              horario_reserva: reserva.horario_reserva,
              numero_pessoas: reserva.numero_pessoas,
              mesas: reserva.mesas || '',
            }
          }
        }

        // Processar template
        const mensagemFinal = processarTemplate(msg.mensagem, dadosReserva)

        // Enviar via Evolution API
        await evolutionApi.sendText({
          number: msg.telefone,
          text: mensagemFinal,
          delay: 1200,
        })

        // Atualizar status
        await updateMensagemAgendada(msg.id, {
          status: 'enviada',
          enviado_em: new Date().toISOString(),
          erro: null,
        })

        // Salvar na tabela conversas
        const supabase = await createClient()
        await supabase.from('conversas').insert({
          numero: msg.telefone,
          nome: msg.nome,
          mensagem_ia: mensagemFinal,
          data_mensagem: new Date().toISOString(),
          tipo_mensagem: `AUTOMATICA_${msg.tipo.toUpperCase()}`,
        })

        sucesso++
        resultados.push({
          id: msg.id,
          telefone: msg.telefone,
          status: 'sucesso',
        })
      } catch (error: any) {
        erros++
        const erroMsg = error.message || "Erro desconhecido"
        
        await updateMensagemAgendada(msg.id, {
          status: 'erro',
          erro: erroMsg,
        })

        resultados.push({
          id: msg.id,
          telefone: msg.telefone,
          status: 'erro',
          erro: erroMsg,
        })
      }
    }

    return NextResponse.json({
      success: true,
      mensagensEnviadas: sucesso,
      mensagensErro: erros,
      totalProcessadas: mensagens.length,
      resultados,
    })
  } catch (error: any) {
    console.error("Erro ao executar mensagens agendadas:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Erro ao executar mensagens agendadas",
      },
      { status: 500 }
    )
  }
}

/**
 * Função auxiliar para criar mensagens automáticas baseadas em eventos de reserva
 */
export async function criarMensagensAutomaticasParaReservas() {
  try {
    const hoje = new Date().toISOString().split('T')[0]
    const agora = new Date()
    
    // Buscar reservas confirmadas para hoje (lembrete)
    const supabase = await createClient()
    const { data: reservasHoje } = await supabase
      .from('reservas')
      .select('*')
      .eq('data_reserva', hoje)
      .in('etapa', ['reserva_confirmada', 'confirmado'])
      .neq('status_comparecimento', 'cancelado')
      .is('status_comparecimento', null)

    if (!reservasHoje || reservasHoje.length === 0) {
      return { criadas: 0 }
    }

    // Configuração de mensagem de lembrete
    const configLembrete = await getConfiguracaoMensagem('lembrete')
    let templateLembrete = "Olá {nome}! Lembrando que você tem uma reserva hoje às {horario_reserva} no Est! Est!! Est!!! Ristorante. Esperamos você! 😊"
    
    if (configLembrete && configLembrete.ativo) {
      templateLembrete = configLembrete.template
    }

    let mensagensCriadas = 0

    // Criar mensagens de lembrete para reservas confirmadas (enviar 2 horas antes)
    for (const reserva of reservasHoje) {
      const [hora, minuto] = reserva.horario_reserva.split(':').map(Number)
      const horarioReserva = new Date()
      horarioReserva.setHours(hora, minuto, 0, 0)
      
      const duasHorasAntes = new Date(horarioReserva)
      duasHorasAntes.setHours(duasHorasAntes.getHours() - 2)

      // Só criar se ainda não passou o horário de envio e está no futuro
      if (duasHorasAntes > agora && duasHorasAntes <= horarioReserva) {
        // Verificar se já não existe uma mensagem agendada para esta reserva
        const { data: existente } = await supabase
          .from('mensagens_agendadas')
          .select('id')
          .eq('reserva_id', reserva.id)
          .eq('tipo', 'lembrete')
          .eq('status', 'pendente')
          .maybeSingle()

        if (!existente) {
          await createMensagemAgendada({
            reserva_id: reserva.id,
            telefone: reserva.telefone,
            nome: reserva.nome,
            tipo: 'lembrete',
            mensagem: templateLembrete,
            agendado_para: duasHorasAntes.toISOString(),
            status: 'pendente',
          })
          mensagensCriadas++
        }
      }
    }

    // Criar mensagens de atraso para reservas atrasadas (15, 30, 60 minutos)
    const reservasAtrasadas = await getReservasAtrasadas()
    
    for (const reserva of reservasAtrasadas) {
      const [hora, minuto] = reserva.horario_reserva.split(':').map(Number)
      const horarioReserva = new Date()
      horarioReserva.setHours(hora, minuto, 0, 0)
      const minutosAtraso = Math.floor((agora.getTime() - horarioReserva.getTime()) / 60000)

      // Criar mensagens em múltiplos horários se necessário
      const horarios = [15, 30, 60]
      
      for (const minutos of horarios) {
        if (minutosAtraso >= minutos) {
          const horarioEnvio = new Date(horarioReserva)
          horarioEnvio.setMinutes(horarioEnvio.getMinutes() + minutos)

          // Verificar se já não existe uma mensagem agendada para este horário
          const { data: existente } = await supabase
            .from('mensagens_agendadas')
            .select('id')
            .eq('reserva_id', reserva.id)
            .eq('tipo', 'atraso')
            .eq('status', 'pendente')
            .gte('agendado_para', horarioEnvio.toISOString())
            .lt('agendado_para', new Date(horarioEnvio.getTime() + 60000).toISOString()) // 1 minuto de margem
            .maybeSingle()

          if (!existente) {
            const configAtraso = await getConfiguracaoMensagem('nao_comparecimento')
            let templateAtraso = "Olá {nome}! Notamos que você tinha uma reserva para hoje às {horario_reserva} e ainda não chegou. Você ainda vai conseguir vir? Se precisar remarcar, estamos à disposição! 😊"
            
            if (configAtraso && configAtraso.ativo) {
              templateAtraso = configAtraso.template
            }

            await createMensagemAgendada({
              reserva_id: reserva.id,
              telefone: reserva.telefone,
              nome: reserva.nome,
              tipo: 'atraso',
              mensagem: templateAtraso,
              agendado_para: horarioEnvio.toISOString(),
              status: 'pendente',
            })
            mensagensCriadas++
          }
        }
      }
    }

    return { criadas: mensagensCriadas }
  } catch (error: any) {
    console.error("Erro ao criar mensagens automáticas:", error)
    throw error
  }
}

