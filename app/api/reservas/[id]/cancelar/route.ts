import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateReserva } from "@/lib/db/reservas"
import { updateLeadByTelefone, getLeadByTelefone } from "@/lib/db/leads"

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

    // Atualizar contexto do lead
    const lead = await getLeadByTelefone(reserva.telefone)
    if (lead) {
      const contexto = `Reserva cancelada em ${new Date().toLocaleDateString('pt-BR')}. Reserva original: ${reserva.data_reserva} às ${reserva.horario_reserva} para ${reserva.numero_pessoas} pessoas.`
      await updateLeadByTelefone(reserva.telefone, {
        contexto: lead.contexto ? `${lead.contexto}\n\n${contexto}` : contexto,
        data_ultima_msg: new Date().toISOString(),
      })
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

