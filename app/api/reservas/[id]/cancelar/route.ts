import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateReserva } from "@/lib/db/reservas"
import { updateLeadByTelefone, getLeadByTelefone } from "@/lib/db/leads"
import { createMensagemAgendada } from "@/lib/db/mensagens-agendadas"
import { getConfiguracaoMensagem } from "@/lib/db/configuracoes-mensagens"
import { formatDate } from "@/lib/utils/date"
import { logAuditoria } from "@/lib/db/auditoria"

/**
 * PATCH /api/reservas/[id]/cancelar
 * Cancela uma reserva
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Buscar reserva
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single()

    if (reservaError || !reserva) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se já está cancelada
    if (reserva.etapa === 'cancelado') {
      return NextResponse.json(
        { error: "Reserva já está cancelada" },
        { status: 400 }
      )
    }

    // Atualizar reserva para cancelada
    await updateReserva(id, {
      etapa: 'cancelado',
      status_comparecimento: 'cancelado',
    })

    // Registrar auditoria
    await logAuditoria(
      'CANCEL',
      'RESERVAS',
      `Reserva cancelada: ${reserva.nome} - ${reserva.data_reserva} às ${reserva.horario_reserva}`,
      id,
      { nome: reserva.nome, telefone: reserva.telefone, data_reserva: reserva.data_reserva },
      request
    )

    // Atualizar contexto do lead
    const lead = await getLeadByTelefone(reserva.telefone)
    if (lead) {
      const contexto = `Reserva cancelada em ${new Date().toLocaleDateString('pt-BR')}. Reserva original: ${reserva.data_reserva} às ${reserva.horario_reserva} para ${reserva.numero_pessoas} pessoas.`
      await updateLeadByTelefone(reserva.telefone, {
        contexto: lead.contexto ? `${lead.contexto}\n\n${contexto}` : contexto,
        data_ultima_msg: new Date().toISOString(),
      })
    }

    // Criar mensagem agendada de cancelamento (enviar imediatamente ou agendar)
    try {
      const configCancelamento = await getConfiguracaoMensagem('cancelamento')
      let templateCancelamento = "Olá {nome}! Informamos que sua reserva para {data_reserva} às {horario_reserva} foi cancelada. Se precisar fazer uma nova reserva, estamos à disposição! 😊"
      
      if (configCancelamento && configCancelamento.ativo) {
        templateCancelamento = configCancelamento.template
      }

      await createMensagemAgendada({
        reserva_id: id,
        telefone: reserva.telefone,
        nome: reserva.nome,
        tipo: 'cancelamento',
        mensagem: templateCancelamento,
        agendado_para: new Date().toISOString(), // Enviar imediatamente
        status: 'pendente',
      })
    } catch (error) {
      console.error("[Cancelar Reserva] Erro ao criar mensagem agendada:", error)
      // Não falhar o cancelamento se houver erro na mensagem
    }

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada com sucesso",
      reserva: {
        ...reserva,
        etapa: 'cancelado',
        status_comparecimento: 'cancelado',
      },
    })
  } catch (error: any) {
    console.error("[Cancelar Reserva] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao cancelar reserva",
      },
      { status: 500 }
    )
  }
}

