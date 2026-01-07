import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Se marcar como não compareceu ou compareceu, enviar notificação
    if (status_comparecimento === 'nao_compareceu') {
      // TODO: Integrar com sistema de notificações/n8n
      console.log(`[Reservas] Cliente não compareceu: ${data.nome} - ${data.telefone}`)
    } else if (status_comparecimento === 'compareceu') {
      console.log(`[Reservas] Cliente compareceu: ${data.nome}`)
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

