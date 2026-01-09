import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createMensagemAgendada } from "@/lib/db/mensagens-agendadas"
import { getConfiguracaoMensagem } from "@/lib/db/configuracoes-mensagens"
import { formatDate } from "@/lib/utils/date"

/**
 * PATCH /api/reservas/[id]/status
 * Atualiza status de comparecimento da reserva
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status_comparecimento } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID da reserva não fornecido" },
        { status: 400 }
      )
    }

    if (!status_comparecimento) {
      return NextResponse.json(
        { error: "Status de comparecimento não fornecido" },
        { status: 400 }
      )
    }

    // Validar status
    const statusValidos = ['agendado', 'compareceu', 'nao_compareceu', 'cancelado']
    if (!statusValidos.includes(status_comparecimento)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Atualizar status
    const { data, error } = await supabase
      .from('reservas')
      .update({ status_comparecimento })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Se marcar como compareceu, criar mensagem de confirmação agendada
    if (status_comparecimento === 'compareceu') {
      try {
        const configConfirmacao = await getConfiguracaoMensagem('confirmacao')
        let templateConfirmacao = "Olá {nome}! Confirmamos sua presença para a reserva de hoje às {horario_reserva}. Estamos ansiosos para recebê-lo(a)! 😊"
        
        if (configConfirmacao && configConfirmacao.ativo) {
          templateConfirmacao = configConfirmacao.template
        }

        await createMensagemAgendada({
          reserva_id: id,
          telefone: data.telefone,
          nome: data.nome,
          tipo: 'confirmacao',
          mensagem: templateConfirmacao,
          agendado_para: new Date().toISOString(), // Enviar imediatamente
          status: 'pendente',
        })
      } catch (error) {
        console.error("[Status Reserva] Erro ao criar mensagem de confirmação:", error)
        // Não falhar a atualização se houver erro na mensagem
      }
    } else if (status_comparecimento === 'nao_compareceu') {
      console.log(`[Reservas] Cliente não compareceu: ${data.nome} - ${data.telefone}`)
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Status atualizado com sucesso",
    })
  } catch (error: any) {
    console.error("[Reservas Status] Erro:", error.message)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar status" },
      { status: 500 }
    )
  }
}

